---
title: "Introducción a Amazon SQS: colas para desacoplar tus sistemas"
date: 2026-09-04
description: "Colas estándar y FIFO, visibilidad de mensajes, reintentos, colas de mensajes fallidos y patrones para procesar trabajo de forma confiable."
tags: [AWS, SQS, Mensajería]
---

Imagina un restaurante donde el mesero entrega cada pedido directamente al cocinero y espera de pie hasta que termine. Si llegan muchos clientes a la vez, el mesero se bloquea, y si el cocinero se enferma, todo se detiene. La solución: una **comanda** que se deja en un riel. El mesero sigue atendiendo y la cocina trabaja a su ritmo.

Eso es una **cola de mensajes**. **Amazon SQS (Simple Queue Service)** es la cola administrada de AWS.

## Qué problema resuelve

Cuando un componente llama directamente a otro:

- Si el segundo está lento o caído, el primero también falla.
- Un pico de tráfico puede saturar al segundo.
- Ambos deben escalar al mismo tiempo.

Con una cola en medio:

- **Desacoplamiento:** el productor deja mensajes y sigue; el consumidor los procesa cuando puede.
- **Absorción de picos:** la cola actúa de amortiguador.
- **Resiliencia:** si el consumidor falla, los mensajes esperan.
- **Escalado independiente** de cada lado.

## Cómo funciona

1. Un **productor** envía un mensaje a la cola.
2. SQS lo almacena de forma redundante.
3. Un **consumidor** lo solicita (*poll*), lo recibe y lo procesa.
4. Al terminar, el consumidor **elimina** el mensaje de la cola.

Si el consumidor no lo elimina (por ejemplo, porque falló), el mensaje vuelve a estar disponible y se reintenta.

## Tipos de cola

| | Estándar | FIFO |
|---|---|---|
| **Orden** | Mejor esfuerzo, sin garantía | Se respeta el orden (por grupo de mensajes) |
| **Entrega** | **Al menos una vez** (pueden repetirse) | **Exactamente una vez** (con deduplicación) |
| **Rendimiento** | Prácticamente ilimitado | Alto, pero con límites por cola y por grupo |
| **Cuándo** | Mayoría de casos | Cuando el orden y la deduplicación importan |

Con la cola estándar debes diseñar consumidores **idempotentes**, porque un mensaje puede llegar más de una vez.

## Parámetros importantes

- **Tiempo de visibilidad (visibility timeout):** cuando un consumidor recibe un mensaje, SQS lo oculta temporalmente a los demás (por defecto, 30 segundos). Si no se elimina en ese tiempo, reaparece. Debe ser mayor al tiempo de procesamiento.
- **Retención:** cuánto tiempo guarda los mensajes, de 1 minuto a 14 días (por defecto, 4 días).
- **Tamaño máximo del mensaje:** 256 KB. Para cargas mayores, guarda el contenido en S3 y envía solo la referencia.
- **Retraso de entrega (delay):** pospone la visibilidad de los mensajes nuevos.
- **Sondeo largo (long polling):** el consumidor espera hasta unos segundos por mensajes, reduciendo respuestas vacías y costos.

## Cola de mensajes fallidos (DLQ)

Algunos mensajes nunca se podrán procesar (datos inválidos, errores permanentes). Si siguen reapareciendo, bloquean recursos y generan costos. Una **cola de mensajes fallidos** recibe los mensajes que superaron un **número máximo de reintentos**, para que los inspecciones sin perderlos ni afectar a la cola principal.

Configura alarmas sobre la DLQ: que haya mensajes allí es una señal de problema.

## Patrones comunes

### Procesamiento de trabajos

Una API recibe una solicitud, la encola y responde de inmediato. Trabajadores (Lambda, contenedores, instancias) procesan en segundo plano.

### Nivelación de carga

Una cola protege a una base de datos o a un servicio externo con capacidad limitada de picos de tráfico.

### Fan-out con SNS

Un tema de SNS publica un mensaje y varias colas SQS lo reciben, una por cada consumidor interesado. Cada uno procesa a su ritmo.

### Integración con Lambda

Lambda puede leer de SQS automáticamente, en lotes, y escalar según la profundidad de la cola. Si la función falla, los mensajes vuelven a la cola, y tras los reintentos configurados van a la DLQ.

## Seguridad

- **Políticas de IAM** y **políticas de cola** (para dar acceso entre cuentas o a servicios).
- **Cifrado en reposo** (administrado por SQS o con KMS).
- **Cifrado en tránsito** con HTTPS.
- **Endpoints de VPC** para acceso privado.

## Costos

Pagas por **solicitudes** (con una capa gratuita mensual); cada solicitud cubre hasta 64 KB de carga y se cuenta en múltiplos por mensajes mayores. Para reducir costos:

- Usa **envío y recepción por lotes**.
- Usa **sondeo largo**.
- No dejes consumidores sondeando sin necesidad.

## Buenas prácticas

1. **Consumidores idempotentes.**
2. **DLQ en todas las colas** de trabajo importante, con alarmas.
3. **Tiempo de visibilidad mayor** que el máximo de procesamiento, con margen.
4. **Procesa por lotes** cuando tenga sentido.
5. **Monitorea** la antigüedad del mensaje más viejo y la profundidad de la cola.
6. **Mensajes pequeños;** referencias a S3 para datos grandes.
7. **No uses SQS como base de datos:** es transporte, no almacenamiento duradero a largo plazo.

## Errores frecuentes

- **Asumir que cada mensaje llega una sola vez** en una cola estándar.
- **Visibilidad demasiado corta**, con mensajes procesados varias veces simultáneamente.
- **Sin DLQ**, con mensajes venenosos que se reintentan sin fin.
- **Tamaño de lote o concurrencia** que saturan una base de datos.
- **Esperar orden estricto** en una cola estándar.

## Para finalizar

SQS es sencillo, económico y muy confiable, y es una de las herramientas más útiles para construir sistemas resilientes. Piensa en colas siempre que un componente necesite hacer trabajo que no debe bloquear a otro.

Con consumidores idempotentes, una DLQ configurada y buenas alarmas, tendrás pocas sorpresas.
