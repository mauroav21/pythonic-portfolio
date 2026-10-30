---
title: "AWS Lambda a fondo: cómo funciona, qué cuesta y dónde muerde"
date: 2026-08-11
description: "Ciclo de vida del entorno de ejecución, concurrencia, cold starts, reintentos por tipo de disparador, idempotencia, costos con un ejemplo calculado y los gotchas que aparecen en producción."
tags: [AWS, Lambda, Serverless]
---

La primera función Lambda que despliegas funciona a la primera. Tres semanas después, alguien pregunta por qué una operación se ejecutó dos veces, por qué la base de datos se quedó sin conexiones un martes a las nueve de la mañana, o por qué la factura no se parece a la del mes pasado. Nada de eso es un bug de Lambda: es el modelo de ejecución haciendo exactamente lo que dice la documentación, que casi nadie leyó con calma.

Este artículo recorre ese modelo con el nivel de detalle que necesitas para operar Lambda en producción, no solo para desplegar un "hola mundo".

## El modelo mental: no es un servidor, es un entorno que se crea y se reutiliza

Lambda no ejecuta tu código "en una función" abstracta. Hace esto:

1. Cuando llega un evento y no hay un entorno libre, **crea un entorno de ejecución**: una microVM aislada (con Firecracker por debajo) con tu código, tu runtime y la memoria que configuraste.
2. **Ejecuta tu código de inicialización** (todo lo que está fuera del handler).
3. **Invoca el handler** con el evento.
4. Cuando termina, **congela el entorno** y lo conserva un tiempo por si llega otro evento. Si llega, lo reutiliza sin repetir los pasos 1 y 2.
5. Pasado un tiempo sin uso, lo destruye. Tú no controlas cuándo.

De ahí salen casi todas las reglas prácticas:

- **Un entorno atiende una invocación a la vez.** Si llegan 50 eventos simultáneos, Lambda necesita 50 entornos.
- **Lo que declares fuera del handler se reutiliza** entre invocaciones del mismo entorno (conexiones, clientes del SDK, modelos cargados en memoria).
- **Nada de lo que guardes en memoria o en `/tmp` es garantía de nada.** Puede estar o no, según te toque un entorno viejo o uno nuevo.

### Las tres fases

| Fase | Qué ocurre | Notas |
|---|---|---|
| **Init** | Descarga de código, arranque del runtime, ejecución del código fuera del handler | Tiene un límite de tiempo (del orden de 10 s). Solo ocurre en entornos nuevos |
| **Invoke** | Ejecución del handler | Limitada por el timeout de la función (máx. 15 min) |
| **Shutdown** | Se destruye el entorno | Hay una ventana breve para extensiones; no cuentes con ella para tareas críticas |

Un detalle de facturación que cambió: históricamente la fase Init de las funciones con runtimes administrados y zip no se cobraba de forma uniforme. AWS anunció en 2025 que la estandariza y pasa a facturarla. Verifica la política vigente en la página de precios, porque afecta cuánto te cuesta el cold start.

## Concurrencia: la única cuenta que importa

La concurrencia es cuántos entornos están ejecutando código **al mismo tiempo**. La fórmula es simple:

```text
concurrencia ≈ invocaciones por segundo × duración promedio (en segundos)
```

Ejemplos:

| Tráfico | Duración | Concurrencia |
|---|---|---|
| 10 req/s | 200 ms | ≈ 2 |
| 100 req/s | 200 ms | ≈ 20 |
| 100 req/s | 3 s | ≈ 300 |
| 1 000 req/s | 1 s | ≈ 1 000 |

Fíjate en la tercera fila: **una función lenta multiplica la concurrencia**. Un endpoint que "solo" tarda tres segundos porque espera a una API externa consume quince veces más concurrencia que uno de 200 ms con el mismo tráfico.

### Límites que debes conocer

- **Límite de concurrencia por cuenta y región:** 1 000 por defecto (las cuentas nuevas pueden empezar más abajo; se puede pedir aumento). Es **compartido por todas las funciones** de la región.
- **Ritmo de escalado:** cada función puede crear entornos nuevos a un ritmo limitado (la documentación actual habla de hasta 1 000 entornos adicionales cada 10 segundos por función; verifica la cifra vigente). Un pico muy abrupto puede recibir errores de *throttling* mientras Lambda escala.
- **Concurrencia reservada:** garantiza capacidad a una función **y a la vez la limita** a ese tope. Sirve en las dos direcciones: protege a una función crítica de que otras se coman el límite, y protege a un recurso aguas abajo (una base de datos) de que la función lo sature.
- **Concurrencia aprovisionada:** mantiene entornos ya inicializados. Elimina el cold start para ese volumen, a cambio de pagar por tenerlos.

El error clásico: una función poco importante que se dispara en bucle y consume toda la concurrencia de la cuenta, tumbando a las demás. La concurrencia reservada en las funciones críticas, o un tope en las ruidosas, es el seguro.

## Cold start: de dónde sale la latencia

Un cold start es el costo de crear un entorno nuevo. Se compone de:

1. **Descarga y descompresión del código** (más grande = más lento).
2. **Arranque del runtime** (cambia mucho entre lenguajes).
3. **Tu código de inicialización** (importar librerías, crear clientes, cargar configuración).

Lo que suele funcionar para reducirlo, en orden de impacto típico:

- **Menos dependencias.** Cada import que no usas en el camino caliente es tiempo de inicio gratis que pierdes. En Python y Node.js, importa dentro de la función lo que solo se usa en rutas poco frecuentes.
- **Paquetes pequeños.** Empaqueta solo lo necesario; evita subir `node_modules` completos o dependencias de desarrollo.
- **Runtime y arquitectura.** Los runtimes compilados o ligeros (Go, Rust, Node.js, Python) arrancan mucho más rápido que una JVM tradicional. Para Java hay **SnapStart**, que restaura una instantánea de un entorno ya inicializado.
- **arm64 (Graviton).** Suele ofrecer mejor relación precio/rendimiento; pruébalo con tu carga.
- **Más memoria.** Como la CPU escala con la memoria, una función con más memoria suele inicializar más rápido. Mide.
- **Concurrencia aprovisionada** si de verdad necesitas latencia estable para el primer usuario.

Y una verdad incómoda: en muchas cargas el cold start afecta a un porcentaje pequeño de invocaciones (las que crean entornos nuevos). Si tu API tiene tráfico constante, el p50 casi no lo ve; lo ve el p99. Decide con percentiles, no con intuición.

## Memoria, CPU y costo: configurar a ciegas sale caro

En Lambda eliges memoria (128 MB a 10 240 MB) y la CPU se asigna **proporcionalmente**. Como pagas **GB-segundo** (memoria × duración), subir memoria puede *reducir* el costo si la función termina bastante antes.

Un ejemplo ilustrativo con números inventados para mostrar la lógica (mide el tuyo):

| Memoria | Duración | GB-s por invocación | Costo relativo |
|---|---|---|---|
| 256 MB | 800 ms | 0.20 | 1.00× |
| 512 MB | 380 ms | 0.19 | 0.95× |
| 1024 MB | 190 ms | 0.19 | 0.95× |
| 2048 MB | 170 ms | 0.34 | 1.70× |

Hasta cierto punto, más memoria no cuesta más y responde en una cuarta parte del tiempo. Después de ese punto, la función ya no escala con CPU (porque espera I/O) y solo pagas de más. La herramienta **AWS Lambda Power Tuning** (de código abierto) automatiza esta búsqueda ejecutando tu función con varias configuraciones.

## Cómo se invoca importa: tres modelos, tres comportamientos de error

Esta es la sección que más problemas evita. Lambda puede invocarse de tres formas y **el manejo de errores es distinto en cada una**.

### 1. Invocación síncrona

Quien llama espera la respuesta (API Gateway, URL de función, invocación directa desde el SDK). Si la función falla, **el error vuelve al llamador** y es **él quien decide** si reintenta. Lambda no reintenta por su cuenta.

### 2. Invocación asíncrona

El llamador entrega el evento y se va (S3, SNS, EventBridge, invocación con tipo `Event`). Lambda pone el evento en una cola interna y lo ejecuta:

- Si la función falla, **reintenta hasta 2 veces más** (configurable de 0 a 2), con esperas entre intentos.
- Descarta el evento si supera su **edad máxima** (configurable, hasta 6 horas).
- Puedes configurar un **destino de fallo** o una **DLQ** para no perder los eventos que se agotaron.

Consecuencia: **tu función puede ejecutarse más de una vez para el mismo evento.**

### 3. Disparadores por sondeo (SQS, Kinesis, DynamoDB Streams)

Lambda sondea la fuente y te entrega **lotes**. Aquí el reintento lo gobierna la fuente:

- **SQS:** si la función falla, el lote **no se elimina** y vuelve a ser visible tras el *visibility timeout*. Recomendación de AWS: que sea **al menos 6 veces el timeout de la función**, para no entregar el mismo mensaje a dos entornos a la vez.
- **Streams (Kinesis, DynamoDB):** un lote que falla **bloquea el fragmento** y se reintenta hasta que funcione o expire. Un solo registro "venenoso" puede detener el procesamiento de todo un shard si no configuras límites de reintento, partición del lote y destino de fallos.

### Fallos parciales en lotes

Si un lote de 10 mensajes tiene 1 malo, por defecto **fallan los 10** y se reintentan los 10. Con `ReportBatchItemFailures` devuelves a Lambda solo los identificadores que fallaron:

```python
def handler(event, context):
    fallidos = []
    for registro in event["Records"]:
        try:
            procesar(json.loads(registro["body"]))
        except Exception:
            logger.exception("Falló el mensaje %s", registro["messageId"])
            fallidos.append({"itemIdentifier": registro["messageId"]})
    return {"batchItemFailures": fallidos}
```

Con esto, los 9 buenos se eliminan y solo el malo vuelve a la cola (y tras *maxReceiveCount* intentos, a la DLQ).

## Idempotencia: no es opcional

Dado que cualquier invocación asíncrona o de cola puede repetirse, **cada handler debe tolerar ejecutarse dos veces con el mismo evento** sin efectos dobles (doble cobro, dos correos, dos filas).

El patrón habitual: una **clave de idempotencia** derivada del evento y una tabla (DynamoDB con escritura condicional) que registra lo ya procesado.

```python
def procesar_una_vez(clave, accion):
    try:
        tabla.put_item(
            Item={"pk": clave, "estado": "EN_CURSO", "ttl": int(time.time()) + 86400},
            ConditionExpression="attribute_not_exists(pk)",
        )
    except tabla.meta.client.exceptions.ConditionalCheckFailedException:
        return  # ya se procesó o se está procesando
    accion()
    tabla.update_item(
        Key={"pk": clave},
        UpdateExpression="SET estado = :s",
        ExpressionAttributeValues={":s": "COMPLETADO"},
    )
```

Este esquema deja un hueco: si la función muere entre la reserva y la acción, la clave queda en `EN_CURSO` para siempre. Por eso conviene un TTL corto en el estado `EN_CURSO` o usar una librería probada. **Powertools for AWS Lambda** incluye una utilidad de idempotencia que maneja estos casos.

## Conexiones y estado: lo que se declara fuera del handler

```python
import os, boto3

# Se ejecuta una vez por entorno (fase Init) y se reutiliza
tabla = boto3.resource("dynamodb").Table(os.environ["TABLA"])

def handler(event, context):
    ...  # aquí solo lo que cambia por invocación
```

Reutilizar clientes evita reconectar en cada invocación. Pero ojo con dos cosas:

- **Conexiones a bases relacionales.** Cada entorno abre sus propias conexiones. Con 300 entornos concurrentes tienes 300 conexiones o más. Un `max_connections` de unos cientos se agota rápido. Soluciones: **RDS Proxy**, limitar la concurrencia de la función, o usar una base pensada para este modelo.
- **Estado que no debería compartirse.** Una variable global con datos de un usuario puede filtrarse a la siguiente invocación del mismo entorno. Reinicia lo que sea por petición.

## Redes: ¿meter la función en una VPC?

Por defecto, Lambda corre fuera de tu VPC con acceso a internet y a los servicios de AWS por sus endpoints públicos. Si necesitas llegar a algo **dentro** de tu VPC (una base de datos privada), configuras la función con subredes y grupos de seguridad. Entonces:

- La función **pierde el acceso a internet** a menos que haya NAT Gateway (y su costo por hora y por GB) o endpoints de VPC para los servicios de AWS que uses.
- Las ENI se comparten (Hyperplane), así que el cold start extra por VPC es mucho menor que hace años, pero la configuración de rutas sigue siendo la causa número uno de funciones que "se quedan colgadas" hasta el timeout.

Regla práctica: **no la metas en una VPC si no hace falta.** Si la metes, usa endpoints de VPC para S3 y DynamoDB (los de tipo Gateway no cuestan) y revisa las rutas.

## Empaquetado

| Formato | Límite | Cuándo |
|---|---|---|
| **Zip** | 50 MB comprimido (directo) y 250 MB descomprimido, incluyendo capas | Casi todo |
| **Imagen de contenedor** | Hasta 10 GB | Dependencias grandes (ML, binarios), toolchains propios |
| **Capas (layers)** | Hasta 5 por función | Compartir dependencias; ojo, **no** evitan el límite descomprimido |

Las capas son cómodas pero mezclan ciclos de vida: actualizar una capa no actualiza las funciones que la usan hasta que republicas, y debuggear versiones cruzadas es incómodo.

## Seguridad en tres líneas que sí cuentan

1. **Un rol por función**, con solo los permisos que usa (la sección de IAM de esta serie lo explica).
2. **Secretos en Secrets Manager o Parameter Store**, no en variables de entorno de texto plano. Las variables de entorno están limitadas en tamaño (4 KB en total) y son visibles para quien pueda leer la configuración.
3. **Cuidado con los permisos del disparador:** quién puede invocar la función se controla con una política basada en recursos. Una invocación pública accidental es un clásico.

## Observabilidad desde el primer día

- **Registros estructurados (JSON)** con un identificador de correlación. En CloudWatch Logs Insights eso convierte buscar en consultar.
- **Métricas útiles:** `Errors`, `Throttles`, `Duration` (p95/p99), `ConcurrentExecutions`, `IteratorAge` (para streams) y, en colas, la antigüedad del mensaje más viejo.
- **Alarmas sobre síntomas**, no solo sobre errores de la función: la profundidad de la DLQ y la antigüedad de la cola suelen avisar antes.
- **Trazas con X-Ray** o con OpenTelemetry para seguir una petición a través de API Gateway, Lambda y DynamoDB.

## Un despliegue reproducible: plantilla SAM mínima

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Resources:
  ProcesarPedido:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.12
      Architectures: [arm64]
      Handler: app.handler
      CodeUri: src/
      MemorySize: 512
      Timeout: 30
      ReservedConcurrentExecutions: 20
      Environment:
        Variables:
          TABLA: !Ref TablaPedidos
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TablaPedidos
      Events:
        Cola:
          Type: SQS
          Properties:
            Queue: !GetAtt ColaPedidos.Arn
            BatchSize: 10
            FunctionResponseTypes: [ReportBatchItemFailures]

  ColaPedidos:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 180        # ≥ 6 × el timeout de la función
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt ColaPedidosDLQ.Arn
        maxReceiveCount: 5

  ColaPedidosDLQ:
    Type: AWS::SQS::Queue
    Properties:
      MessageRetentionPeriod: 1209600   # 14 días

  TablaPedidos:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - { AttributeName: pk, AttributeType: S }
      KeySchema:
        - { AttributeName: pk, KeyType: HASH }
```

Está pensada para ilustrar las decisiones: concurrencia reservada para proteger a la tabla, visibilidad de 6× el timeout, DLQ con retención larga, fallos parciales de lote y permisos acotados a la tabla.

## Costos: un ejemplo calculado

Lambda cobra por **solicitudes** y por **GB-segundo**. Precios de referencia en us-east-1 para x86 (verifícalos, cambian por región y arquitectura): alrededor de 0.20 USD por millón de solicitudes y 0.0000166667 USD por GB-segundo, con una capa gratuita mensual de 1 millón de solicitudes y 400 000 GB-segundo.

**Caso:** 5 millones de invocaciones al mes, 200 ms de duración promedio, 512 MB.

```text
GB-s = 5 000 000 × 0.2 s × 0.5 GB = 500 000 GB-s
  - gratis                              400 000
  = facturable                          100 000  × 0.0000166667 ≈ 1.67 USD
Solicitudes: (5 M − 1 M gratis) × 0.20 USD/M      ≈ 0.80 USD
Total aproximado                                   ≈ 2.47 USD / mes
```

Lo que suele costar más que Lambda en estos sistemas no es Lambda:

- **NAT Gateway** si metiste la función en una VPC (cobro por hora y por GB).
- **API Gateway**, que cobra por solicitud.
- **CloudWatch Logs**: ingesta y almacenamiento. Una función que registra mucho a gran volumen puede costar más en logs que en cómputo. Controla el nivel de log y la retención.
- **Reintentos y bucles:** una función que se dispara a sí misma (por ejemplo, escribe en el mismo bucket que la activa) es la causa clásica de facturas sorpresa. Evítalo con prefijos distintos, filtros de eventos y alarmas de presupuesto.

## Los gotchas, al punto

- **Ejecuciones duplicadas** en asíncrono y en colas: idempotencia, siempre.
- **Throttling por concurrencia** compartida: una función ruidosa afecta a las demás.
- **`visibility timeout` menor al timeout** de la función: mensajes procesados dos veces en paralelo.
- **Shard bloqueado** en streams por un registro venenoso.
- **Conexiones a base de datos** multiplicadas por la concurrencia.
- **Función en VPC sin salida** hasta el timeout.
- **Importaciones pesadas** en el camino de inicio.
- **Logs de más** que salen más caros que el cómputo.
- **Recursión accidental** entre una función y su propio disparador.
- **Timeout demasiado generoso**, que oculta fallos y alarga el costo: ajústalo a lo que realmente hace la función, con margen.

## Cuándo Lambda no es la herramienta

- Procesos de más de 15 minutos (usa Step Functions, Fargate o Batch).
- Cargas altas, estables y predecibles donde contenedores bien dimensionados cuestan menos. Haz la cuenta con tus números.
- Aplicaciones con estado en memoria o conexiones persistentes de larga duración.
- Latencias que no toleran ni el p99 de un cold start y donde la concurrencia aprovisionada no compensa.

## Cómo la uso yo

Lambda es el servicio de AWS que más uso. Buena parte de lo que construyo fuera del trabajo nace de querer hacerme la vida más sencilla: automatizar algo que me estorba y no tener que acordarme de mantenerlo. Trato de llevar esa misma idea a las empresas: que los procesos complejos sean fáciles de entender.

Una función pequeña, con una sola responsabilidad y un disparador claro, se le puede explicar a alguien que no la escribió en cinco minutos. Para mí eso vale tanto como lo que ahorra en infraestructura. Por eso insisto tanto en lo que ves arriba (idempotencia, DLQ, límites de concurrencia): no son detalles técnicos, son lo que hace que una automatización "sencilla" siga siendo sencilla el día que algo falla.

## Para finalizar

Lambda es sencilla de empezar y se vuelve fiable cuando asumes tres cosas: los entornos se reutilizan (y se destruyen), los eventos pueden repetirse y la concurrencia es un recurso compartido que hay que presupuestar. Con idempotencia, DLQ, límites de concurrencia en las funciones que tocan recursos frágiles y observabilidad desde el primer día, deja de dar sorpresas.

Si vas a medir una sola cosa antes de salir a producción, mide la concurrencia real bajo carga y lo que ocurre con tus dependencias cuando llega. Casi todos los incidentes con Lambda que se documentan públicamente empiezan ahí.
