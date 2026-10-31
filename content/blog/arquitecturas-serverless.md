---
title: "Arquitecturas serverless: patrones, orquestación y lo que nadie te cuenta del día dos"
date: 2026-09-30
description: "Qué es y qué no es serverless, patrones de arquitectura (API, eventos, fan-out, flujos con Step Functions, tuberías de datos), manejo de errores por capa, pruebas, observabilidad, costos con números y anti-patrones."
tags: [Serverless, AWS, Arquitectura]
---

Serverless se vende como "olvídate de los servidores". La parte cierta: no aprovisionas, no parchas y no escalas máquinas. La parte que se omite: sigues teniendo **sistemas distribuidos**, con sus fallos parciales, reintentos, duplicados y límites; solo que ahora cada pieza es una caja administrada con reglas propias y tú ensamblas el conjunto. Esta es una guía para ensamblarlo bien: qué patrones funcionan, cómo se maneja el error en cada capa, cómo se prueba y observa, y qué estropea la factura o la fiabilidad.

## Qué es serverless (con criterio)

Un servicio es serverless si reúne cuatro cosas:

1. **Sin servidores que administrar** (ni instancias, ni parches, ni clústeres que dimensionar).
2. **Escala automáticamente** con la demanda, incluyendo hasta cero.
3. **Pago por uso** (solicitudes, tiempo de ejecución, datos), no por capacidad ociosa.
4. **Alta disponibilidad integrada.**

En AWS: **Lambda** (cómputo), **Fargate** (contenedores), **API Gateway** y **AppSync** (APIs), **DynamoDB** (datos), **S3** (objetos), **SQS/SNS/EventBridge** (mensajería y eventos), **Step Functions** (orquestación), **Cognito** (identidad), **Aurora Serverless** y **Kinesis**, entre otros. La arquitectura serverless típica tiene **poco código propio** y **mucho pegamento entre servicios administrados**. Esa proporción es una señal de salud: si tu "arquitectura serverless" es una Lambda enorme con un framework web dentro, probablemente solo cambiaste el lugar donde corre un monolito.

## El cambio de mentalidad

| Antes (servidores) | Serverless |
|---|---|
| Capacidad = lo que aprovisionas | Capacidad = límites de cuenta y de cada servicio |
| Un proceso de larga vida con estado en memoria | Ejecuciones efímeras y sin estado |
| Escalas verticalmente o con un ASG | Escala por solicitud/evento |
| Fallo = una máquina cae | Fallo = reintentos, duplicados, *throttling* |
| Pago fijo por capacidad | Pago variable, ligado al uso |
| Observas hosts | Observas **solicitudes y eventos** |

De ahí salen las reglas: **idempotencia, estado externo, asincronía por defecto, límites explícitos.**

## Patrones que funcionan

### 1. API síncrona: la clásica

```text
Cliente → API Gateway (autorización, límites) → Lambda → DynamoDB
```

Para APIs de lectura/escritura con latencia moderada. Reglas: respuestas rápidas (decenas o cientos de ms), operaciones largas movidas a asíncrono, una función por recurso o grupo de rutas cohesivo (ni una por ruta ni un monolito), y protección de la base con concurrencia reservada.

### 2. Procesamiento asíncrono con cola

```text
Cliente → API → SQS → Lambda (lotes) → destino
                 └─ DLQ
```

La API valida y encola (`202 Accepted`); el trabajo ocurre después. La cola da **contrapresión, reintentos y aislamiento de fallos**. Es el patrón más rentable para cualquier trabajo que no necesite respuesta inmediata.

### 3. Orientado a eventos y fan-out

```text
Fuente → EventBridge / SNS ─┬─ SQS → Lambda (facturación)
                            ├─ SQS → Lambda (inventario)
                            └─ SQS → Firehose → S3 (analítica)
```

Quien emite el evento no conoce a los consumidores. Cada consumidor lleva su cola y DLQ. Cuidado con los **ciclos** (un consumidor que vuelve a publicar el evento que lo activa).

### 4. Procesamiento de archivos

```text
S3 (subida directa por URL prefirmada) → evento → Lambda / Step Functions → S3 + DynamoDB
```

El cliente sube **directo a S3**, sin pasar por tu API. La creación del objeto dispara el procesamiento. Usa prefijos distintos para entrada y salida (para no activarte a ti mismo).

### 5. Flujos de trabajo con Step Functions

Cuando hay **varios pasos con ramificaciones, esperas, reintentos y compensaciones**, una máquina de estados es mejor que Lambdas encadenadas.

| | **Standard** | **Express** |
|---|---|---|
| Duración | Hasta 1 año | Hasta 5 minutos |
| Semántica | Exactamente una vez por paso | Al menos una vez |
| Volumen | Miles por segundo (menor) | Cientos de miles por segundo |
| Costo | Por **transición de estado** | Por **solicitudes y duración** |
| Historial | Detallado, consultable | Registros en CloudWatch |
| Uso | Procesos de negocio largos, aprobaciones humanas | Alto volumen y corta duración (ingesta, transformaciones) |

Un fragmento de definición con **reintentos y captura de errores**:

```json
{
  "StartAt": "CobrarPago",
  "States": {
    "CobrarPago": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "cobrar-pago", "Payload.$": "$" },
      "Retry": [
        { "ErrorEquals": ["Lambda.ServiceException", "Lambda.TooManyRequestsException"],
          "IntervalSeconds": 2, "MaxAttempts": 4, "BackoffRate": 2.0, "JitterStrategy": "FULL" }
      ],
      "Catch": [
        { "ErrorEquals": ["PagoRechazado"], "Next": "NotificarRechazo" },
        { "ErrorEquals": ["States.ALL"], "Next": "CompensarYFallar" }
      ],
      "Next": "ReservarInventario"
    },
    "ReservarInventario": { "Type": "Task", "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "reservar-inventario", "Payload.$": "$" }, "End": true },
    "NotificarRechazo": { "Type": "Fail", "Error": "PagoRechazado" },
    "CompensarYFallar": { "Type": "Task", "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "reembolsar", "Payload.$": "$" }, "Next": "Fallo" },
    "Fallo": { "Type": "Fail" }
  }
}
```

Step Functions también se integra **directamente con más de 200 servicios** de AWS (DynamoDB, SQS, SNS, ECS, Glue...) **sin Lambda de por medio**, reduciendo código y costo. Y soporta el patrón **saga**: si un paso falla, ejecutas acciones de compensación de los anteriores. **Orquestación frente a coreografía.** Con *orquestación* (Step Functions) un coordinador explícito decide el orden: visible, fácil de depurar, con más acoplamiento al coordinador. Con *coreografía* (eventos) cada servicio reacciona por su cuenta: desacoplado, pero el flujo completo queda implícito y cuesta seguirlo. Para procesos de negocio con pasos y compensaciones, orquesta; para notificar cambios a quien le interese, coreografía.

### 6. Tuberías de datos

```text
Aplicaciones → Kinesis / Firehose → S3 → Glue / Athena → paneles
```

Ingesta con Kinesis o Firehose, almacenamiento en S3 en formato columnar (Parquet) y consulta con Athena. Sin clústeres que mantener y pagando por datos escaneados.

### 7. Aplicaciones de tiempo real

AppSync (GraphQL con suscripciones) o API Gateway WebSocket + Lambda + DynamoDB para conexiones y mensajes.

## Manejo de errores: capa por capa

La mayor diferencia entre un sistema serverless fiable y uno frágil es saber **quién reintenta, cuántas veces y qué pasa después**.

| Capa | Quién reintenta | Dónde terminan los fallos |
|---|---|---|
| **API Gateway → Lambda** (síncrono) | El cliente | Respuesta de error al cliente |
| **Lambda asíncrona** (S3, SNS, EventBridge) | Lambda (2 reintentos por defecto) | Destino de fallo / DLQ de la función |
| **SQS → Lambda** | La cola (por visibilidad), hasta `maxReceiveCount` | DLQ de la **cola** |
| **Streams → Lambda** | Lambda, reintentando hasta que pase o expire | Destino en caso de fallo; riesgo de bloquear el *shard* |
| **EventBridge → destino** | EventBridge (política de reintentos, hasta 24 h) | DLQ del destino |
| **Step Functions** | Reglas `Retry` y `Catch` del estado | Estados de compensación / `Fail` |

Principios comunes:

1. **Idempotencia en todo consumidor.** Todo puede llegar más de una vez.
2. **Una DLQ con alarma y dueño** en cada punto asíncrono.
3. **Reintentos con espera exponencial y jitter**, y límites claros.
4. **Distingue errores transitorios de permanentes:** reintenta los primeros; los segundos, a la DLQ de inmediato.
5. **Procedimiento de redrive** documentado: sin él, la DLQ es un cementerio.

## Estado y datos

Las funciones son efímeras: el estado vive fuera.

- **DynamoDB** para acceso por clave y escala predecible (diseñada por patrones de acceso).
- **Aurora Serverless v2 / RDS + RDS Proxy** cuando necesitas SQL; cuida las conexiones con Lambda.
- **S3** para objetos y archivos.
- **ElastiCache / MemoryDB** (no serverless en el mismo sentido, aunque hay variantes) para caché de baja latencia.
- **Parameter Store / Secrets Manager / AppConfig** para configuración y secretos.

Evita guardar estado en `/tmp` o en variables globales como si fueran persistentes.

## Seguridad en pocas líneas

- **Un rol por función**, con permisos mínimos y acotados por recurso.
- **Autoriza en el borde y en el backend.**
- **Secretos en Secrets Manager**, no en variables de entorno.
- **Cifrado** en reposo y en tránsito en todos los servicios.
- **Valida entradas** de eventos como si fueran externas: un evento de S3 o SQS puede contener datos controlados por un atacante.
- **Dependencias:** las funciones heredan las vulnerabilidades de tus paquetes; escanea y actualiza.
- **Cuentas separadas por entorno** y despliegues desde una canalización, no desde portátiles.

## Pruebas: la parte difícil

Probar serverless es más difícil porque mucho del comportamiento está en la **configuración** y la **integración** (permisos, formatos de eventos, límites), no en el código.

| Nivel | Qué cubre | Cómo |
|---|---|---|
| **Unitarias** | Lógica de negocio pura | Funciones desacopladas de los servicios (separa la lógica del *handler*) |
| **Integración local limitada** | Forma de los eventos | Eventos de ejemplo, `sam local` (útil pero con diferencias) |
| **Integración en la nube** | Permisos, configuración, límites reales | Desplegar un entorno efímero por rama y ejecutar pruebas contra los servicios reales |
| **De extremo a extremo** | Flujos completos | Pocas, sobre el entorno real; verifica resultados observables |
| **De carga y resiliencia** | Concurrencia, *throttling*, fallos | Pruebas dirigidas; inyecta fallos en las dependencias |

Recomendación: **menos emulación, más pruebas contra la nube**, con entornos baratos y desechables. Los emuladores locales nunca reproducen del todo permisos, cuotas ni consistencia.

## Observabilidad

- **Un identificador de correlación** que viaja en eventos, mensajes y logs.
- **Logs JSON** con retención.
- **Trazas** con X-Ray u OpenTelemetry a través de API Gateway, Lambda, SQS y DynamoDB.
- **Métricas por flujo de negocio**, no solo por función: pedidos completados, tiempo de extremo a extremo.
- **Alarmas sobre síntomas:** errores 5XX, antigüedad de colas, DLQ, *throttles*, `IteratorAge`.
- **Paneles** que muestren el recorrido de un flujo, no una lista de funciones.

## Costos: modelo mental y números

El costo de una arquitectura serverless es la **suma de muchas partidas pequeñas**. Un ejemplo ilustrativo de un backend de API con 3 millones de solicitudes al mes, 150 ms promedio por función, 512 MB, con DynamoDB bajo demanda (precios de referencia; verifícalos):

| Partida | Cálculo aproximado |
|---|---|
| **API Gateway (HTTP API)** | 3 M × ~1 USD/M ≈ 3 USD |
| **Lambda** | 3 M solicitudes y 3 M × 0.15 s × 0.5 GB = 225 000 GB-s: dentro de la capa gratuita o céntimos–pocos dólares |
| **DynamoDB (bajo demanda)** | Unos pocos millones de lecturas/escrituras: pocos dólares |
| **CloudWatch Logs** | Depende del volumen de logs; **a menudo la mayor partida** |
| **Total** | Típicamente decenas de dólares como mucho a este volumen |

A este tamaño, serverless es muy barato. La pregunta de costo aparece **a gran escala y con carga estable**: con cientos de millones de solicitudes constantes, contenedores o instancias bien dimensionadas y comprometidas pueden salir más baratos. **Haz la cuenta con tu volumen, no con la intuición.** Costos que sorprenden:

- **Logs** excesivos o con retención infinita.
- **NAT Gateway** si metes funciones en una VPC.
- **Step Functions Standard** con muchas transiciones por ejecución.
- **Bucles** accidentales que se llaman a sí mismos.
- **Reintentos** que multiplican invocaciones ante un error persistente.
- **Concurrencia aprovisionada** olvidada.
- **Transferencia de datos** entre regiones y hacia internet.

Controles: presupuestos con alertas, etiquetas de costos por flujo, límites de concurrencia, y revisiones mensuales de las partidas principales.

## Anti-patrones

| Anti-patrón | Por qué falla | En su lugar |
|---|---|---|
| **Lambda llama a Lambda de forma síncrona** | Doble facturación mientras esperan, latencia acumulada, fallos en cascada | Cola, evento o Step Functions |
| **Función monolítica** con un framework web dentro | Arranque lento, permisos amplios, despliegues grandes | Funciones cohesivas por responsabilidad (o un monolito modular si el equipo lo prefiere, con conocimiento de sus costos) |
| **Sondeo (polling)** desde una función programada para "esperar" algo | Costo y latencia | Eventos, SQS, Step Functions con espera |
| **Compartir una base relacional sin proxy** con cientos de funciones | Agotan conexiones | RDS Proxy, límites de concurrencia, o DynamoDB |
| **Procesos largos en la ruta síncrona** | Timeouts | `202` + procesamiento asíncrono + consulta de estado |
| **Sin idempotencia** | Duplicados en producción | Claves de idempotencia |
| **Ciclos de eventos** | Costos desbocados | Prefijos/filtros distintos, alarmas de presupuesto |
| **Todo en una cuenta, desplegado a mano** | Riesgo y deriva | Cuentas por entorno, IaC, CI/CD |
| **Ignorar los límites** (concurrencia, tamaño, tiempo) | Fallos bajo carga | Conocerlos y pruebas de carga |

## Cuándo serverless **no** es la mejor opción

- **Carga alta y constante** donde el cálculo favorece a contenedores o instancias comprometidas.
- **Procesos de larga duración o con estado en memoria** (más de 15 minutos por unidad de trabajo, sesiones persistentes).
- **Latencias que no toleran** ni el p99 de un arranque en frío y no compensa la concurrencia aprovisionada.
- **Dependencia de software con requisitos especiales** (GPU, licencias por máquina, kernel específico).
- **Equipos sin experiencia en sistemas distribuidos asíncronos** y sin tiempo para aprenderlos.
- **Requisitos de portabilidad entre nubes** muy estrictos.

No es una religión: muchas arquitecturas sólidas **mezclan** (API en contenedores, eventos y procesamiento en Lambda, datos en DynamoDB y S3).

## Por qué me gusta este enfoque

Mucho de lo que construyo en serverless empezó como soluciones para facilitarme la vida: automatizaciones, integraciones, pequeñas herramientas que no quería volver a hacer a mano. Con el tiempo descubrí que la misma idea sirve en las empresas: **cuanto más fácil es entender un proceso, más fácil es mantenerlo**. Un flujo con eventos claros, una cola con su DLQ y un par de funciones pequeñas se explica en una pizarra; un sistema donde todo depende de un servidor que "solo conoce una persona" no. El mejor ejemplo propio son los runners de CI/CD efímeros sobre contenedores sin servidores: menos costo, menos mantenimiento y más libertad para desplegar. Esa solución resume lo que busco con este estilo de arquitectura.

## Una forma sensata de empezar

1. **Elige un flujo acotado** y de bajo riesgo (un procesamiento de archivos, una integración, un endpoint nuevo).
2. **Defínelo como código** (SAM, CDK o Terraform), con un entorno efímero por rama.
3. **Pon desde el inicio:** DLQ, alarmas, logs estructurados, trazas, idempotencia y un presupuesto.
4. **Mide** latencia, errores y costo reales durante unas semanas.
5. **Decide con datos** si ampliar el enfoque o no.
6. Para sistemas existentes, aplica el **patrón estrangulador**: extrae funcionalidades una a una detrás de la misma API.

## Para finalizar

Serverless cambia dónde se acumula la complejidad: menos en operar máquinas, más en entender eventos, reintentos, límites y configuración. Cuando respetas esas reglas —idempotencia, estado externo, asincronía, DLQ con dueño, observabilidad desde el día uno—, entregas rápido con poca operación. Cuando no, descubres el "día dos": duplicados, atascos silenciosos y facturas que nadie puede explicar. La buena noticia es que casi todo eso se previene en el diseño. La pregunta no es "¿serverless sí o no?", sino "¿qué piezas de mi sistema se benefician de no tener servidores, y cuáles no?".
