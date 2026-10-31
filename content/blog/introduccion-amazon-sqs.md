---
title: "Amazon SQS a fondo: colas confiables, reintentos, orden y los errores que duplican trabajo"
date: 2026-09-04
description: "Colas estándar y FIFO, visibilidad y reintentos, DLQ y redrive, long polling, procesamiento por lotes y contrapresión, seguridad, métricas, costos y el diseño de consumidores idempotentes."
tags: [AWS, SQS, Mensajería]
---

Casi toda arquitectura que crece termina necesitando una cola. Al principio un servicio llama a otro y funciona. Luego llega un pico y el segundo cae. Después uno de los dos se despliega y durante dos minutos nadie contesta. Más tarde alguien pide "reprocesar lo de ayer" y no hay de dónde. Una cola resuelve esas cuatro cosas, y SQS lo hace sin que administres nada. Pero tiene reglas precisas sobre entrega, visibilidad y orden que, si no conoces, producen justo los problemas que querías evitar: mensajes procesados dos veces, mensajes que no se procesan nunca, o un sistema que se atasca en un solo mensaje.

## Qué es una cola, en concreto

SQS guarda mensajes de forma duradera (replicados en varias zonas) hasta que un consumidor los procesa y los elimina. Rasgos del modelo:

- **El consumidor extrae** (*pull*) los mensajes; la cola no los empuja.
- **Un mensaje se entrega a un consumidor a la vez** (mientras esté "en vuelo").
- **Un mensaje no desaparece al leerlo:** se oculta temporalmente. Solo se elimina cuando el consumidor lo confirma.
- **No hay un "acuse de procesado" implícito:** eliminar es una llamada explícita.

Esto último es la fuente de todo lo demás.

## El ciclo de vida de un mensaje

```text
Productor ──SendMessage──► [ cola ] ──ReceiveMessage──► Consumidor
                              ▲                              │
                              │   (si no se elimina antes     │ procesa
                              │    de que venza la            ▼
                              └── visibilidad vuelve) ◄── DeleteMessage
```

1. El productor envía el mensaje.
2. El consumidor lo recibe. SQS le entrega un **identificador de recibo** (*receipt handle*) y **oculta** el mensaje durante el **tiempo de visibilidad**.
3. Si el consumidor termina y llama a `DeleteMessage`, el mensaje se elimina.
4. Si no lo hace antes de que expire la visibilidad (porque falló, se colgó o tardó demasiado), el mensaje **reaparece** y otro consumidor puede recibirlo.
5. Cada recepción incrementa un contador (`ApproximateReceiveCount`). Si supera `maxReceiveCount`, la cola de mensajes fallidos lo recoge.

Un efecto inevitable: **un mensaje puede procesarse más de una vez.** No es un fallo de SQS; es la consecuencia de que "procesado" y "eliminado" sean dos pasos distintos.

## Estándar o FIFO

| | **Estándar** | **FIFO** |
|---|---|---|
| Entrega | **Al menos una vez** (pueden duplicarse) | **Exactamente una vez** (deduplicación en una ventana de 5 minutos) |
| Orden | Mejor esfuerzo; puede desordenarse | Estricto **dentro de un grupo de mensajes** |
| Rendimiento | Prácticamente ilimitado | Alto, pero acotado por cola y por grupo (cientos de mensajes por segundo por API sin lotes, miles con lotes, más en modo de alto rendimiento; consulta los límites actuales) |
| Nombre | Cualquiera | Debe terminar en `.fifo` |
| Cuándo | La mayoría de los casos | Cuando el orden o la no duplicación son requisitos del negocio |

### Lo que hay que entender de FIFO

- **`MessageGroupId`** define el "carril" de orden. Los mensajes del mismo grupo se entregan en orden y **solo un consumidor a la vez** procesa un grupo. Para paralelizar, usa muchos grupos (por ejemplo, un grupo por cliente).
- **Bloqueo de cabeza de línea:** si el primer mensaje de un grupo falla repetidamente, **todo el grupo espera detrás**. Un solo mensaje venenoso detiene a ese cliente. Una DLQ mitiga el problema.
- **`MessageDeduplicationId`** (o deduplicación basada en contenido) evita que el mismo mensaje entre dos veces dentro de 5 minutos. No sustituye la idempotencia del consumidor.

Regla práctica: **empieza con estándar** y construye consumidores idempotentes. FIFO añade restricciones de rendimiento y bloqueo; úsalo cuando el orden de verdad importe (por ejemplo, actualizaciones de un mismo registro).

## Los parámetros que importan

| Parámetro | Rango / defecto | Qué hace |
|---|---|---|
| **Tiempo de visibilidad** | 0 s a 12 h; por defecto **30 s** | Cuánto se oculta el mensaje tras recibirlo |
| **Retención** | 60 s a 14 días; por defecto **4 días** | Cuánto vive un mensaje sin consumir |
| **Retraso de entrega** | 0 a 15 min | Posponer la visibilidad de mensajes nuevos |
| **Espera de recepción** | 0 a 20 s | 0 = sondeo corto; >0 = **sondeo largo** |
| **Tamaño máximo** | **256 KiB** | Para más, guarda el contenido en S3 y manda la referencia (hay una biblioteca de cliente extendida) |
| **Mensajes por recepción** | hasta 10 | Procesa por lotes |

### El tiempo de visibilidad: el error más común

Debe ser **mayor que el tiempo máximo de procesamiento** de un mensaje. Si es menor:

1. El consumidor A recibe el mensaje y empieza a trabajar.
2. Vence la visibilidad antes de que termine.
3. El consumidor B recibe el **mismo mensaje** y lo procesa también.
4. Resultado: trabajo duplicado, a veces en paralelo.

Ajustes:

- Calcula el tiempo máximo real y deja margen.
- Si el tiempo es muy variable, usa **`ChangeMessageVisibility`** para ampliarlo mientras trabajas (un "latido").
- Con Lambda como consumidora, AWS recomienda un tiempo de visibilidad **de al menos 6 veces el timeout de la función**.

### Sondeo largo

Con sondeo corto (espera 0), cada recepción devuelve de inmediato aunque no haya mensajes, y te cobran esas solicitudes vacías. Con **sondeo largo** (`WaitTimeSeconds` hasta 20), SQS espera a que llegue algo. Reduce solicitudes vacías, costo y latencia. **Actívalo siempre.**

## Un consumidor correcto

```python
import json, boto3

sqs = boto3.client("sqs")
URL = "https://sqs.us-east-1.amazonaws.com/111122223333/pedidos"

def consumir():
    while True:
        r = sqs.receive_message(
            QueueUrl=URL,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,          # sondeo largo
            AttributeNames=["ApproximateReceiveCount"],
        )
        for m in r.get("Messages", []):
            try:
                procesar(json.loads(m["Body"]))     # debe ser idempotente
            except Exception:
                registrar_error(m)                   # no eliminar: reaparecerá
                continue
            sqs.delete_message(QueueUrl=URL, ReceiptHandle=m["ReceiptHandle"])
```

Detalles que importan:

- **Elimina solo después de procesar con éxito.**
- Si fallas, **no hagas nada**: el mensaje reaparecerá solo.
- Para eliminar en bloque, `delete_message_batch` (hasta 10).
- Los consumidores deben ser **idempotentes** (siguiente sección).

## Idempotencia: la regla que lo sostiene todo

Como un mensaje puede llegar más de una vez, procesarlo dos veces no debe tener efectos duplicados. Estrategias:

- **Operaciones naturalmente idempotentes:** `SET estado = 'ENVIADO'` es seguro repetir; `SET saldo = saldo - 10` no.
- **Clave de idempotencia:** incluye en el mensaje un identificador único de la operación y registra en una tabla (por ejemplo, DynamoDB con escritura condicional `attribute_not_exists`) los identificadores ya procesados. Si ya existe, descartas.
- **Transacciones de base de datos** que inserten el resultado y la marca de "procesado" juntos.

## Cola de mensajes fallidos (DLQ) y redrive

Un mensaje que siempre falla (datos inválidos, error de código, dependencia que ya no existe) **no debe reintentarse eternamente**. Configura una DLQ con `maxReceiveCount` (por ejemplo, 3 a 5):

```json
{
  "deadLetterTargetArn": "arn:aws:sqs:us-east-1:111122223333:pedidos-dlq",
  "maxReceiveCount": 5
}
```

Puntos importantes:

- **El tipo de la DLQ debe coincidir** con la cola de origen (estándar con estándar, FIFO con FIFO).
- **La retención en la DLQ cuenta desde el momento original de envío**, no desde que entró a la DLQ. Si el mensaje ya llevaba 3 días en la cola principal y la DLQ retiene 4, te quedan 1 día para actuar. **Configura la retención de la DLQ al máximo (14 días).**
- **Alarma sobre la DLQ:** cualquier mensaje en ella es una señal (`ApproximateNumberOfMessagesVisible > 0`).
- **Redrive:** SQS permite **devolver** los mensajes de la DLQ a la cola de origen (desde consola o API) cuando ya corregiste la causa. Es lo que convierte la DLQ en una herramienta de recuperación y no en un cementerio.

## Procesar a escala: lotes, concurrencia y contrapresión

- **Lotes:** enviar, recibir y eliminar por lotes de hasta 10 reduce solicitudes y costo.
- **Varios consumidores en paralelo** leen de la misma cola y se reparten el trabajo (es el patrón de "consumidores competidores").
- **Contrapresión:** la cola absorbe picos. El consumidor procesa a su ritmo y la profundidad crece temporalmente. Lo importante es que **la profundidad vuelva a bajar**.
- **Escalar según la cola:** escala el número de consumidores según `ApproximateNumberOfMessagesVisible` dividido por la capacidad de cada uno ("backlog por instancia"). Es mejor métrica que la CPU para consumidores.
- **Proteger lo que hay aguas abajo:** si la cola alimenta una base de datos o una API externa limitada, limita la concurrencia de los consumidores (con Lambda, `MaximumConcurrency` en el mapeo de la fuente de eventos).

### Con Lambda

Lambda sondea la cola y te entrega lotes. Configuraciones clave:

- `BatchSize` y ventana de agrupación (`MaximumBatchingWindowInSeconds`).
- **`ReportBatchItemFailures`:** devuelves solo los mensajes fallidos y no todo el lote (si no, **un mensaje malo reintenta los 10**).
- Visibilidad ≥ 6 × timeout.
- DLQ en la **cola** (no en la función) para fuentes SQS.

## Patrones útiles

| Patrón | Idea |
|---|---|
| **Nivelación de carga** | La cola protege a un servicio lento de picos |
| **Trabajo en segundo plano** | La API encola y responde enseguida; trabajadores procesan después |
| **Fan-out** | SNS publica a varias colas SQS, una por consumidor |
| **Reintento con retraso** | Mensajes con retraso (`DelaySeconds`) o visibilidad creciente |
| **Petición-respuesta** | Cola de respuesta temporal con `correlationId` (pero valora si una llamada directa es más simple) |
| **Prioridades** | Colas separadas por prioridad y consumidores que leen la alta primero |

Lo que SQS no hace: **no tiene prioridades internas, no filtra por contenido y no mantiene al mensaje para múltiples lectores** (cada mensaje lo procesa un consumidor). Para varias copias, SNS delante; para enrutamiento por contenido, EventBridge.

## Seguridad

- **Políticas de IAM** para quién envía y recibe, y **política de cola** para dar acceso entre cuentas o a servicios (por ejemplo, para que un tema SNS pueda enviar mensajes, con la condición `aws:SourceArn`).
- **Cifrado en reposo:** las colas nuevas usan SSE-SQS por defecto; puedes usar KMS con llave propia (en ese caso, los servicios que envían, como SNS, necesitan permiso sobre la llave).
- **TLS en tránsito** y política que **exija** `aws:SecureTransport`.
- **Endpoint de VPC** (interfaz) para acceso privado.
- **No pongas datos sensibles** en el cuerpo si pueden evitarse; manda referencias.

## Observabilidad

Las métricas que más sirven:

| Métrica | Qué te dice |
|---|---|
| `ApproximateNumberOfMessagesVisible` | Cuánto trabajo espera |
| `ApproximateNumberOfMessagesNotVisible` | Cuánto está "en vuelo" |
| **`ApproximateAgeOfOldestMessage`** | **La mejor señal de salud:** cuánto lleva esperando el mensaje más viejo |
| `NumberOfMessagesSent/Received/Deleted` | Flujo; si "recibidos" ≫ "eliminados", hay fallos |
| `NumberOfEmptyReceives` | Si es alta, falta sondeo largo |

Alarma recomendada: **antigüedad del mensaje más viejo** por encima del tiempo que tu negocio tolera, y mensajes visibles en la DLQ.

## Costos

SQS cobra por **solicitudes** (con una capa gratuita mensual); cada solicitud cubre hasta 64 KiB de carga útil, y una carga mayor cuenta como varias. Las colas FIFO tienen un precio por solicitud algo mayor que las estándar. Revisa la tabla vigente en la página oficial. Cómo no pagar de más:

- **Sondeo largo** siempre (evita millones de recepciones vacías).
- **Lotes** para enviar, recibir y eliminar.
- **Mensajes pequeños** (el costo escala por fragmentos de 64 KiB).
- **No dejar consumidores sondeando** colas que ya no se usan.
- **Evitar bucles de reintento** que generan tráfico sin trabajo útil.

Normalmente el costo de SQS es insignificante frente a lo que cuesta lo que hay alrededor (cómputo, transferencia), pero un diseño con sondeo corto y miles de consumidores puede sorprender.

## Los gotchas, al punto

- **Visibilidad menor que el tiempo de procesamiento:** duplicados en paralelo.
- **Consumidores no idempotentes** en cola estándar.
- **Sin DLQ**, con mensajes venenosos reintentándose para siempre.
- **Retención corta en la DLQ**, y perder los mensajes antes de investigarlos.
- **Un mensaje malo en un lote** que reintenta los demás (sin `ReportBatchItemFailures`).
- **FIFO con un solo grupo** (sin paralelismo) o con un mensaje venenoso que bloquea el grupo.
- **Esperar orden** en una cola estándar.
- **Mensajes de más de 256 KiB** sin plan (referencia a S3).
- **Mensajes "en vuelo" que alcanzan el límite** (del orden de 120 000 en estándar, 20 000 en FIFO).
- **Permisos de KMS** que impiden a SNS o a EventBridge enviar a una cola cifrada.
- **No monitorear la antigüedad:** la cola crece en silencio durante días.

## Cuándo no usar SQS

- Necesitas que **varios consumidores independientes** reciban el mismo evento: SNS (o EventBridge) + SQS.
- Necesitas **reproducir** el histórico de eventos o procesar en orden con múltiples lectores: Kinesis o MSK (Kafka).
- Necesitas **enrutamiento por contenido** y muchas integraciones: EventBridge.
- Necesitas **transacciones** o consultas sobre los mensajes: una base de datos.
- La **latencia de sondeo** de la cola no es aceptable para una llamada que debe ser síncrona: llamada directa.

## Para finalizar

SQS es una de las piezas más sencillas y más rentables de AWS, pero su simplicidad depende de que respetes tres reglas: el consumidor debe ser idempotente, el tiempo de visibilidad debe superar el de procesamiento, y toda cola de trabajo necesita una DLQ con alarma y retención larga. Con eso, una cola convierte picos en trabajo ordenado y fallos en reintentos controlados. Sin eso, convierte un fallo en una avalancha de duplicados.
