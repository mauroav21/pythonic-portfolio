---
title: "Amazon SNS a fondo: fan-out, filtros, entrega confiable y cuándo elegir EventBridge"
date: 2026-09-10
description: "Temas estándar y FIFO, suscripciones y protocolos, políticas de filtrado por atributos y por contenido, el patrón SNS+SQS con permisos y cifrado, reintentos, DLQ, SMS y comparación con EventBridge."
tags: [AWS, SNS, Mensajería]
---

SNS responde una pregunta distinta a la de SQS. Una cola dice "este trabajo lo hará alguien". SNS dice "esto pasó, y **varios** interesados deben enterarse". Pagó un cliente: facturación debe emitir el comprobante, inventario debe reservar el stock, marketing debe actualizar su segmento y el sistema antifraude debe revisar el patrón. Quien publica el evento no debería saber ni cuántos son ni quiénes.

Esto, bien hecho, desacopla equipos. Mal hecho, produce eventos perdidos, suscriptores que reciben lo que no les toca y permisos que fallan en silencio. Veamos cómo hacerlo bien.

## El modelo

- **Tema (topic):** el canal con nombre al que se publica.
- **Publicador:** envía mensajes al tema (`Publish`). No conoce a los suscriptores.
- **Suscripción:** une un destino (endpoint) a un tema, con su propia configuración de filtro, reintentos y DLQ.
- **Entrega:** SNS **empuja** una copia a cada suscripción.

Una diferencia clave con SQS: **SNS no almacena mensajes para quien no está.** Si publicas cuando no hay suscripciones, el mensaje se pierde. Si un destino está caído, SNS reintenta según su política y, agotada, descarta (o envía a una DLQ si la configuraste).

## Tipos de tema

| | **Estándar** | **FIFO** |
|---|---|---|
| Orden | Mejor esfuerzo | Estricto por grupo (`MessageGroupId`) |
| Duplicados | Entrega al menos una vez | Deduplicación (ventana de 5 min) |
| Destinos | Todos los protocolos | **Solo colas SQS FIFO** (y algunos otros según la versión) |
| Rendimiento | Muy alto | Menor, con límites por tema |
| Extras | Filtrado, DLQ | Archivo y reproducción (*replay*) de mensajes |

Usa estándar salvo que el orden sea un requisito real.

## Destinos (protocolos)

| Protocolo | Uso | Atención |
|---|---|---|
| **SQS** | El destino más fiable y común | Requiere política en la cola |
| **Lambda** | Reaccionar con código | La invocación es asíncrona; hay reintentos |
| **HTTP/HTTPS** | Webhooks | Confirmación de suscripción; verifica firmas; reintentos más acotados |
| **Kinesis Data Firehose** | Entregar a S3, OpenSearch, Redshift | Para archivo y análisis |
| **Correo electrónico** | Avisos a personas | Cada destinatario confirma por enlace; **no uses esto para correo transaccional** (usa SES) |
| **SMS** | Mensajes de texto | Regulación, costo y límites por país |
| **Push móvil** | APNs, FCM, etc. | Requiere configurar plataformas |

## Mensaje y atributos

Un `Publish` lleva un **cuerpo** (hasta 256 KiB; más grande, guarda en S3 y manda la referencia) y hasta 10 **atributos de mensaje** (nombre, tipo y valor). Los atributos sirven sobre todo para **filtrar**.

```python
import json, boto3

sns = boto3.client("sns")
sns.publish(
    TopicArn="arn:aws:sns:us-east-1:111122223333:pedidos-creados",
    Message=json.dumps({"pedidoId": "A001", "total": 1250.0, "pais": "MX"}),
    MessageAttributes={
        "pais":  {"DataType": "String", "StringValue": "MX"},
        "total": {"DataType": "Number", "StringValue": "1250"},
        "tipo":  {"DataType": "String", "StringValue": "pedido.creado"},
    },
)
```

## Filtrado: que cada suscriptor reciba solo lo suyo

Sin filtros, cada suscriptor recibe todo y descarta lo que no le toca (cuesta, genera ruido y acopla). Con una **política de filtro** en la suscripción, SNS entrega solo lo que coincide.

Puede basarse en **atributos** del mensaje o en el **contenido (payload)** del cuerpo JSON. Ejemplo de política por atributos para una cola de pedidos internacionales grandes:

```json
{
  "pais": [{ "anything-but": ["MX"] }],
  "total": [{ "numeric": [">=", 1000] }]
}
```

Operadores comunes: coincidencia exacta, `prefix`, `suffix`, `anything-but`, `numeric`, `exists`, `equals-ignore-case` y rangos de IP (`cidr`). Dentro de una clave, los valores se combinan con **OR**; entre claves distintas, con **AND**.

Consejos:

- Filtrar en SNS **reduce el costo** y la lógica de descarte en los consumidores.
- Los mensajes que **no coinciden con ningún filtro** simplemente no se entregan, sin error visible: si un consumidor "no recibe nada", revisa primero su política de filtro y los tipos de dato de los atributos (un `Number` publicado como `String` no coincide con un filtro numérico).
- Si una suscripción tiene política de filtro por **payload**, el cuerpo debe ser JSON válido.

## El patrón SNS + SQS (fan-out), con todos sus permisos

```text
                     ┌─ filtro: pais=MX ──────► cola "facturacion-mx" ─► Lambda
pedido.creado ─► SNS ┼─ filtro: total≥1000 ──► cola "antifraude"      ─► servicio
                     └─ sin filtro ──────────► cola "analitica"       ─► Firehose/S3
```

Cada cola es independiente: su propio ritmo de consumo, reintentos, DLQ y retención. Si "analítica" se cae dos horas, "facturación" no se entera.

Lo que hay que configurar (y que suele fallar silenciosamente):

**1. La política de la cola debe permitir al tema enviarle mensajes:**

```json
{
  "Effect": "Allow",
  "Principal": { "Service": "sns.amazonaws.com" },
  "Action": "sqs:SendMessage",
  "Resource": "arn:aws:sqs:us-east-1:111122223333:antifraude",
  "Condition": {
    "ArnEquals": { "aws:SourceArn": "arn:aws:sns:us-east-1:111122223333:pedidos-creados" }
  }
}
```

La condición `aws:SourceArn` evita que otro tema ajeno escriba en tu cola.

**2. Si usas cifrado con KMS** en la cola (o en el tema), la política de la **llave** debe permitir al servicio `sns.amazonaws.com` usarla (`kms:GenerateDataKey*`, `kms:Decrypt`). La cola con la llave administrada por AWS (`aws/sqs`) **no** sirve para este caso porque no se puede editar su política: usa una llave propia.

**3. Entrega de mensaje sin envoltorio ("raw message delivery").** Por defecto, SNS envía a SQS un **sobre JSON** con metadatos y tu mensaje dentro como cadena. Activa *raw message delivery* y el consumidor recibe el cuerpo original (y los atributos como atributos de SQS). Decídelo desde el principio, porque cambiarlo después rompe a los consumidores.

## Reintentos y entregas fallidas

Para destinos administrados por AWS (**SQS, Lambda, Firehose**) SNS reintenta durante mucho tiempo (del orden de decenas de miles de intentos a lo largo de días) con espera creciente. Para **HTTP/S**, la política predeterminada es mucho más corta y **se puede personalizar** (número de reintentos, tiempos, tasa máxima de entrega para no saturar tu endpoint).

Para no perder mensajes que agotaron los reintentos, configura una **DLQ en la suscripción** (una cola SQS). Ten en cuenta que:

- Es **por suscripción**, no por tema.
- La DLQ debe estar en la misma cuenta y región, con una política que permita a SNS escribir.
- Pon alarma sobre ella.

Las garantías son **al menos una vez**: tus consumidores deben ser **idempotentes**, igual que con SQS.

## Archivo y reproducción (FIFO)

Los temas FIFO pueden **archivar** mensajes durante un periodo configurable y permitir **reproducirlos** hacia una suscripción (por ejemplo, para poblar un nuevo consumidor o recuperarte de un error). Es una capacidad que los temas estándar no tienen; si la necesitas con temas estándar, mira EventBridge Archive o Kinesis.

## SMS, correo y push: cosas que sorprenden

- **SMS:** las cuentas nuevas empiezan en un **entorno aislado (sandbox)** con destinatarios verificados y un límite de gasto mensual bajo; hay que solicitar salir. El costo por mensaje **varía muchísimo por país**, hay **registros obligatorios** de remitente en varios países y normativas de consentimiento. Para mensajería a clientes a escala, valora Amazon Pinpoint/End User Messaging.
- **Correo:** pensado para **alertas internas**, no para correos de marketing o transaccionales (para eso, SES).
- **Suscripción por correo o HTTP:** requiere **confirmación**; hasta entonces no recibe mensajes.

## SNS o EventBridge

No son excluyentes, pero se parecen más de lo que parece:

| | **SNS** | **EventBridge** |
|---|---|---|
| Modelo | Tema con suscriptores | Bus de eventos con reglas |
| Enrutamiento | Filtros por suscripción | Patrones de reglas muy ricos sobre el contenido |
| Destinos | SQS, Lambda, HTTP, SMS, correo, push, Firehose | Más de 20 servicios de AWS como destino, APIs externas, otros buses |
| Fuentes | Tus publicadores | Servicios de AWS, SaaS, tus aplicaciones |
| Transformación | Mínima | Transformador de entrada, esquemas, *archive/replay* |
| Rendimiento | Muy alto, baja latencia | Alto, con latencia algo mayor; hay límites por regla/destino |
| Cuándo | Fan-out masivo y simple; notificaciones a personas | Integración de dominios, eventos de AWS/SaaS, enrutamiento complejo |

Una guía simple: **SNS** para difundir un mensaje a muchos destinos de forma rápida y barata, y para avisar a personas; **EventBridge** para arquitecturas orientadas a eventos entre dominios, con reglas ricas, esquemas y eventos de otros servicios.

## Seguridad

- **Política de acceso del tema:** quién puede publicar y suscribirse (incluso entre cuentas), con `aws:SourceArn`/`aws:SourceAccount` cuando publica un servicio de AWS.
- **Cifrado en reposo** con SSE-KMS (recuerda dar permisos a los servicios que publican).
- **TLS en tránsito.** Exige `aws:SecureTransport`.
- **Validación de firmas** de mensajes recibidos por HTTP/S, para saber que vienen de SNS.
- **Mínimo privilegio** en `sns:Publish` y `sns:Subscribe`: permitir suscribirse a cualquiera es una forma de filtrar datos.
- **Endpoint de VPC** para publicar sin salir a internet.

## Costos

SNS cobra por **publicaciones** y por **entregas**, y la tarifa depende del destino:

| Destino | Costo de entrega |
|---|---|
| SQS, Lambda, Firehose | Normalmente incluido sin cargo adicional de entrega (se paga la publicación) |
| HTTP/S | Por millón |
| Correo | Por 100 000 |
| SMS y push | Por mensaje, **muy variable por país** |

Consulta la tabla vigente. Para controlarlos: filtra para no entregar de más, ten cuidado con los bucles (un suscriptor que publica de nuevo en el mismo tema), y fija límites de gasto de SMS.

## Los gotchas, al punto

- **Publicar sin suscripciones** pierde el mensaje.
- **Política de la cola** que no permite a SNS enviar: no hay error en el publicador, simplemente no llega.
- **KMS** sin permisos para `sns.amazonaws.com`, o usar la llave administrada `aws/sqs`.
- **Política de filtro** con tipos de dato incorrectos, que no coincide con nada.
- **Raw delivery** cambiada después de tener consumidores.
- **Suscripción por HTTP sin confirmar.**
- **Sin DLQ** en la suscripción.
- **Consumidores no idempotentes.**
- **Bucle de eventos:** un consumidor que reacciona publicando en el mismo tema.
- **Usar SNS por correo** como sistema de correo transaccional.
- **SMS sin salir del sandbox** o sin cumplir registros por país.
- **Mensajes demasiado grandes** (>256 KiB).
- **Suponer orden** en un tema estándar.

## Cuándo no usar SNS

- Necesitas **que un mensaje lo procese un solo consumidor** con reintentos controlados: una cola SQS, directamente.
- Necesitas **conservar el histórico** y reprocesarlo con varios lectores a distintos ritmos: Kinesis o Kafka.
- Necesitas **reglas ricas y fuentes de eventos de AWS/SaaS:** EventBridge.
- Necesitas **correo o SMS transaccional a escala:** SES o el servicio de mensajería correspondiente.

## Un diseño razonable por defecto

1. Un tema **estándar** por tipo de evento de negocio, con nombres claros (`pedidos-creados`).
2. **Una cola SQS por consumidor** suscrita al tema, con **raw message delivery** y **política de filtro**.
3. **DLQ** tanto en la cola (para el procesamiento) como en la suscripción (para la entrega).
4. **Cifrado con llave propia** y permisos en la política de la llave.
5. **Mensajes con un esquema versionado** (`version`, `tipo`, `id`), y atributos para filtrar.
6. **Alarmas:** mensajes en DLQ, antigüedad de las colas, fallos de entrega (`NumberOfNotificationsFailed`).
7. Todo definido como **infraestructura como código**.

## Para finalizar

SNS es la forma más directa de que un evento llegue a muchos sitios sin que quien lo origina tenga que conocerlos. Su poder está en la combinación con SQS: cada consumidor con su cola, su ritmo y su DLQ, y filtros que mantienen cada flujo limpio.

La mayoría de los problemas con SNS son de configuración silenciosa —permisos, KMS, filtros, raw delivery—, no de funcionamiento. Prueba cada suscripción de extremo a extremo con un mensaje real antes de darla por buena.
