---
title: "Introducción a Amazon SNS: notificaciones y publicación/suscripción"
date: 2026-09-10
description: "Temas, suscriptores, filtrado de mensajes y el patrón fan-out con SQS: cómo enviar un evento a muchos destinos sin acoplarlos."
tags: [AWS, SNS, Mensajería]
---

Una cosa es que un componente necesite pasar trabajo a otro (para eso están las colas). Otra distinta es que algo **ocurra** y varios interesados necesiten enterarse: se creó un pedido, subió el uso de CPU, falló un pago. Para eso sirve **Amazon SNS (Simple Notification Service)**, el servicio de publicación/suscripción de AWS.

## El modelo: publicar y suscribirse

- **Tema (topic):** un canal con nombre al que se publican mensajes.
- **Publicador:** quien envía un mensaje al tema. No sabe ni le importa quién lo recibirá.
- **Suscriptor:** quien se registra en el tema y recibe copias de cada mensaje.

Es **uno a muchos**: un mensaje publicado llega a **todos** los suscriptores. Y puedes añadir suscriptores sin modificar al publicador.

## Tipos de destinos

| Destino | Para qué |
|---|---|
| **SQS** | Procesar de forma confiable y a su ritmo |
| **Lambda** | Ejecutar código en reacción |
| **HTTP/HTTPS** | Llamar a un servicio web |
| **Correo electrónico** | Avisos a personas |
| **SMS** | Mensajes de texto |
| **Notificaciones push móviles** | Aplicaciones móviles |
| **Kinesis Data Firehose** | Entregar a almacenamiento y análisis |

## SNS vs. SQS

Se confunden con frecuencia porque se usan juntos:

| | SNS | SQS |
|---|---|---|
| **Modelo** | Publicación/suscripción (empuja) | Cola (el consumidor extrae) |
| **Destinatarios** | Muchos, todos reciben copia | Uno por mensaje (varios consumidores se reparten) |
| **Persistencia** | No guarda mensajes para suscriptores desconectados | Guarda hasta 14 días |
| **Cuándo** | Difundir un evento | Procesar trabajo de forma fiable |

La regla práctica: **SNS para avisar, SQS para procesar**.

## El patrón fan-out

La combinación más útil. Un tema SNS con **varias colas SQS suscritas**:

```text
                    ┌─► Cola "inventario"  ─► procesador de inventario
Pedido creado ─► SNS├─► Cola "facturación" ─► procesador de facturas
                    └─► Cola "correos"     ─► envío de notificaciones
```

Cada equipo procesa a su ritmo, con sus propios reintentos y su cola de mensajes fallidos. Si uno falla, no afecta a los demás. Y agregar un nuevo consumidor es crear una cola y suscribirla.

## Filtrado de mensajes

No todos los suscriptores necesitan todos los mensajes. Con **políticas de filtrado** cada suscripción declara qué mensajes quiere, según **atributos** del mensaje o su contenido. Por ejemplo, la cola de "pedidos internacionales" solo recibe mensajes con `pais != MX`. Así evitas lógica de descarte en cada consumidor y reduces costos.

## Temas FIFO

Existen temas **FIFO**, que preservan el orden y evitan duplicados, y solo pueden entregar a colas SQS FIFO. Úsalos cuando el orden importe.

## Casos de uso

- **Arquitecturas orientadas a eventos:** difundir cambios de estado del negocio.
- **Alertas operativas:** CloudWatch y otros servicios publican en SNS para avisar por correo, SMS o chat.
- **Fan-out** a varios procesos.
- **Notificaciones a usuarios** (con consideraciones de normativa y consentimiento para SMS y correo).
- **Integración entre aplicaciones** y cuentas.

## Fiabilidad y reintentos

SNS reintenta la entrega según el tipo de destino. Puedes configurar una **cola de mensajes fallidos para las suscripciones**, y SNS enviará allí los mensajes que no pudo entregar tras agotar los reintentos. Los mensajes se entregan **al menos una vez**, así que los consumidores deben ser idempotentes.

## Seguridad

- **Políticas de acceso** del tema, para controlar quién publica y quién se suscribe (incluido entre cuentas).
- **Cifrado en reposo** con KMS.
- **HTTPS** en tránsito y validación de firmas en destinos HTTP.
- **Endpoints de VPC** para acceso privado.

## Costos

Pagas por **publicaciones** (por millón, con capa gratuita) y por **entregas** según el destino: SQS y Lambda son muy económicas o gratuitas dentro de ciertos límites; HTTP, correo y especialmente **SMS** tienen costos distintos, y el SMS varía mucho según el país.

## Buenas prácticas

1. **SNS + SQS** para procesos que necesitan fiabilidad.
2. **Filtra en la suscripción** en lugar de en el consumidor.
3. **Idempotencia** en los consumidores.
4. **DLQ en suscripciones** críticas y alarmas sobre ellas.
5. **Mensajes pequeños y con esquema estable;** versiona los cambios.
6. **No incluyas datos sensibles** innecesarios en los mensajes.
7. **Un tema por tipo de evento** de negocio, con nombres claros.

## Errores frecuentes

- **Confundir SNS con una cola** y esperar que guarde mensajes para suscriptores que no estaban.
- **Suscribir a Lambda directamente** para procesos largos sin buffer, perdiendo el control de la concurrencia.
- **Sin DLQ**, perdiendo mensajes que fallaron.
- **Esquemas de mensaje que cambian sin aviso** y rompen a los consumidores.
- **Usar SMS** sin revisar costos y consentimiento.

## Para finalizar

SNS permite que un evento llegue a muchos destinos sin que quien lo origina tenga que conocerlos. Combinado con SQS, es la base de muchas arquitecturas desacopladas y resilientes.

Piensa en SNS cuando la pregunta sea "¿quién más necesita saber esto?", y en SQS cuando sea "¿cómo me aseguro de que esto se procese?".
