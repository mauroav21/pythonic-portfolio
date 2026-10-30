---
title: "Arquitecturas serverless: qué son, cuándo convienen y qué cuestan de verdad"
date: 2026-10-30
description: "Funciones, servicios administrados y eventos: cómo se ve una arquitectura serverless, sus ventajas reales, sus límites y los errores más comunes."
tags: [Serverless, AWS, Arquitectura]
---

"Serverless" es un nombre engañoso: hay servidores, solo que no los administras tú. La promesa es dejar de preocuparte por aprovisionar, parchar y escalar infraestructura para enfocarte en el código y en los datos.

Es una propuesta potente, y como toda propuesta, funciona muy bien en unos casos y mal en otros.

## Qué define a un servicio serverless

En general, un servicio es serverless si cumple estas características:

- **Sin servidores que administrar:** no eliges ni parchas instancias.
- **Escala automáticamente**, incluso hasta cero.
- **Pago por uso:** pagas por solicitudes, tiempo de ejecución o datos procesados, no por capacidad inactiva.
- **Alta disponibilidad incorporada**, sin que la diseñes tú.

En AWS entran en esta categoría Lambda (cómputo), Fargate (contenedores sin servidores), DynamoDB (base de datos), S3 (almacenamiento), SQS y SNS (mensajería), API Gateway, EventBridge, Step Functions y Cognito, entre otros.

## Dos ideas: FaaS y servicios administrados

Muchos piensan que serverless es solo "funciones Lambda". Es más amplio:

- **FaaS (Function as a Service):** ejecutas funciones en respuesta a eventos.
- **BaaS / servicios administrados:** bases de datos, colas, autenticación y almacenamiento que consumes por API.

Una buena arquitectura serverless usa **pocas líneas de código propias y muchos servicios administrados** que se conectan entre sí.

## Un ejemplo: API para procesar pedidos

```text
Cliente → API Gateway → Lambda (valida y guarda) → DynamoDB
                                   ↓ publica evento
                              EventBridge / SNS
                              ↓            ↓
                       Lambda (correo)   SQS → Lambda (inventario)
```

Cada pieza escala sola, y si la facturación baja a cero tráfico, el costo también.

## El modelo mental: eventos

Serverless funciona mejor cuando piensas en **eventos**: algo ocurre (se sube un archivo, llega una solicitud, se escribe un registro) y una función reacciona. Esto da pie a arquitecturas desacopladas, donde cada componente hace una cosa y se comunica por colas y eventos.

## Ventajas reales

- **Menos operación:** sin parches, sin gestión de capacidad.
- **Escalado automático**, útil con tráfico variable o impredecible.
- **Costo proporcional al uso:** ideal para cargas intermitentes y para prototipos.
- **Velocidad de entrega:** un equipo pequeño puede lanzar mucho.
- **Disponibilidad integrada** en varias zonas.

## Limitaciones que conviene conocer

| Tema | Qué debes saber |
|---|---|
| **Arranque en frío (cold start)** | La primera invocación puede tardar más al crear un entorno nuevo; hay formas de mitigarlo |
| **Límites de ejecución** | Lambda tiene un máximo de 15 minutos por invocación |
| **Sin estado local persistente** | Cada invocación debe asumir que parte de cero; el estado va a servicios externos |
| **Depuración y pruebas locales** | Más difíciles que en una aplicación tradicional |
| **Dependencia del proveedor** | Los servicios y eventos son específicos de cada nube |
| **Observabilidad** | Hay que seguir una petición a través de muchas piezas |
| **Costo a gran escala** | Con cargas altas y constantes, puede salir más caro que cómputo dedicado |

## Cuándo conviene

- Cargas **variables o intermitentes**: picos ocasionales, procesos por lotes.
- **APIs y backends** de aplicaciones web y móviles.
- **Procesamiento de eventos y archivos:** imágenes, documentos, flujos de datos.
- **Automatización e integraciones** entre sistemas.
- **Equipos pequeños** que quieren enfocarse en el producto.
- **Prototipos y validación de ideas.**

## Cuándo pensarlo dos veces

- Cargas **altas y constantes**, donde servidores o contenedores dimensionados cuestan menos.
- Procesos de **larga duración** o con estado en memoria.
- Latencias extremadamente estrictas.
- Software existente no preparado para dividirse en funciones.
- Requisitos que impiden usar servicios de un proveedor específico.

## Buenas prácticas

1. **Funciones pequeñas con una responsabilidad.**
2. **Idempotencia:** los eventos pueden entregarse más de una vez; procesarlos dos veces no debe causar daños.
3. **Colas y reintentos con colas de mensajes fallidos (DLQ)** para no perder trabajo.
4. **Mínimo privilegio** en los permisos de cada función.
5. **Infraestructura como código** (SAM, CDK, Terraform, Serverless Framework).
6. **Observabilidad desde el inicio:** registros estructurados, métricas y trazas.
7. **Controla la concurrencia** para no abrumar a bases de datos o servicios externos.
8. **Vigila costos** con alertas y revisa las configuraciones de memoria.

## Errores frecuentes

- **Una función enorme que hace todo**: pierdes las ventajas de modularidad.
- **Cadenas de funciones que se llaman entre sí** de forma síncrona: más latencia, más costo y fallas en cascada.
- **Conexiones a bases de datos relacionales sin cuidado**, que saturan el límite de conexiones.
- **No limitar la escala:** una función con bucle de llamadas puede generar una factura sorpresiva.
- **Elegir serverless por moda**, sin evaluar el patrón de carga.

## Para finalizar

Serverless cambia la pregunta de "¿cuántos servidores necesito?" a "¿qué eventos tengo y cómo reacciono a ellos?". Cuando la carga es variable y el equipo es pequeño, reduce muchísimo la operación; cuando la carga es constante y alta, evalúa con números.

No es una religión sino una herramienta: úsala donde sus características coincidan con tu problema. Lo he visto funcionar muy bien en eventos, automatizaciones e integraciones, siempre midiendo costos y límites desde el principio.
