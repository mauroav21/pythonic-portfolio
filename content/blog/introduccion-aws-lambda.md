---
title: "Introducción a AWS Lambda: ejecuta código sin administrar servidores"
date: 2026-10-30
description: "Cómo funciona Lambda, sus disparadores, límites, cold starts, modelo de costos y buenas prácticas para funciones confiables."
tags: [AWS, Lambda, Serverless]
---

AWS Lambda te permite subir una función y que AWS la ejecute cuando ocurra un evento, sin que aprovisiones ni administres servidores. Pagas por solicitud y por tiempo de ejecución, y si no hay tráfico, no pagas cómputo.

Es el corazón de muchas arquitecturas serverless y uno de los servicios más versátiles de AWS.

## Cómo funciona

1. Escribes una **función** (en Python, Node.js, Java, .NET, Ruby, Go u otros mediante entornos de ejecución personalizados) o empaquetas una imagen de contenedor.
2. Configuras **memoria**, **tiempo máximo** y **permisos** (un rol de IAM).
3. Defines qué la **dispara**.
4. Cuando llega un evento, Lambda crea un entorno de ejecución, corre tu código y devuelve el resultado.

Si llegan muchos eventos a la vez, Lambda crea muchos entornos en paralelo y escala solo.

## Disparadores comunes

| Origen | Ejemplo |
|---|---|
| **API Gateway / URL de función** | Una petición HTTP |
| **S3** | Se sube un archivo |
| **SQS** | Llegan mensajes a una cola |
| **SNS / EventBridge** | Un evento o una regla programada |
| **DynamoDB Streams / Kinesis** | Cambios en datos o flujos |
| **Programación (cron)** | Tarea periódica con EventBridge Scheduler |

## La función más simple

```python
import json

def handler(event, context):
    nombre = event.get("nombre", "mundo")
    return {
        "statusCode": 200,
        "body": json.dumps({"mensaje": f"Hola, {nombre}"}),
    }
```

El `handler` recibe un `event` con los datos del disparador y un `context` con información de la ejecución.

## Configuración que importa

- **Memoria:** de 128 MB hasta 10 240 MB. La CPU se asigna **proporcionalmente** a la memoria, así que más memoria también da más CPU. Puede ser más barato subir memoria si la función termina antes.
- **Tiempo máximo:** hasta **15 minutos** por invocación.
- **Almacenamiento temporal (`/tmp`):** configurable hasta 10 GB; no persiste entre entornos distintos.
- **Concurrencia:** hay un límite por región (por defecto, 1000 ejecuciones simultáneas, ampliable). Puedes reservar concurrencia para una función o limitarla.
- **Variables de entorno**, **capas (layers)** para compartir dependencias, y empaquetado como zip o imagen de contenedor.

## Cold start (arranque en frío)

La primera invocación en un entorno nuevo debe descargar el código, iniciar el entorno de ejecución y ejecutar tu código de inicialización. Eso añade latencia (de decenas de milisegundos a algunos segundos según el lenguaje, tamaño y configuración). Las invocaciones siguientes que reutilizan el entorno son rápidas.

Cómo mitigarlo:

- Reduce el tamaño del paquete y de las dependencias.
- Mueve la inicialización costosa **fuera del handler**, para que se reutilice.
- Elige entornos de ejecución de arranque rápido.
- **SnapStart** (disponible para ciertos entornos como Java) acelera el inicio.
- **Concurrencia aprovisionada** mantiene entornos listos, con un costo adicional.

## Modelo de costos

Pagas por:

1. **Número de solicitudes.**
2. **Duración**, medida en milisegundos y multiplicada por la memoria configurada (GB-segundo).

Hay una capa gratuita mensual. Lambda suele ser muy económica con cargas intermitentes; con tráfico alto y constante, compara con contenedores o instancias. Revisa los precios vigentes en la página oficial.

## Buenas prácticas

1. **Una función, una responsabilidad.**
2. **Hazla idempotente:** los eventos pueden entregarse más de una vez.
3. **Mínimo privilegio** en el rol de IAM de cada función.
4. **Usa colas con reintentos y DLQ** (colas de mensajes fallidos) para no perder eventos.
5. **Controla la concurrencia** hacia bases de datos y servicios externos.
6. **Registros estructurados** y métricas en CloudWatch, y trazas con X-Ray.
7. **Infraestructura como código** (SAM, CDK, Terraform).
8. **Prueba localmente y en la nube:** el comportamiento real incluye permisos y límites.
9. **Reutiliza conexiones** declarándolas fuera del handler, y usa un proxy para bases relacionales (RDS Proxy).

## Errores frecuentes

- **Funciones gigantes** con todo dentro.
- **Funciones que se invocan entre sí de forma síncrona,** sumando latencia y costos.
- **Bucles recursivos** (una función que dispara el mismo evento que la activa) con facturas sorpresa.
- **Saturar la base de datos** con cientos de conexiones simultáneas.
- **Olvidar el tiempo máximo** y que la función se corte a la mitad.
- **Dependencias innecesarias** que hacen lento el arranque.

## Cuándo no es la mejor opción

- Procesos que duran más de 15 minutos.
- Cargas muy altas y constantes donde el costo por invocación supera al de cómputo dedicado.
- Aplicaciones con requisitos estrictos de latencia que no toleran arranques en frío.
- Software que necesita estado en memoria entre peticiones.

## Para finalizar

Lambda es una de las formas más rápidas de convertir código en un servicio con escala y alta disponibilidad. Entender sus límites, el arranque en frío y la concurrencia te evita casi todos los sustos.

Úsala para eventos, automatizaciones, APIs y procesamiento, y mide costos y latencias desde el principio.
