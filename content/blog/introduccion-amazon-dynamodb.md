---
title: "Amazon DynamoDB a fondo: modelado por patrones de acceso, capacidad y trampas"
date: 2026-07-30
description: "Claves y particiones, capacidad (RCU/WCU, bajo demanda vs. aprovisionado), Query vs. Scan, índices, diseño con una o varias tablas con un ejemplo completo, transacciones, TTL, Streams y los errores que cuestan dinero."
tags: [AWS, DynamoDB, NoSQL]
---

DynamoDB tiene fama de ser rapidísima y de ser difícil. Las dos cosas son ciertas, y tienen la misma causa: está construida alrededor de una idea muy concreta —acceso por clave, a cualquier escala, con latencia predecible— y todo lo que no encaja con esa idea es costoso, torpe o imposible.

Si lo tratas como "una base SQL sin esquema", vas a sufrir. Si entiendes el modelo, es una de las herramientas más fiables de AWS.

## La idea central: se modela para las consultas, no para los datos

En una base relacional modelas las **entidades** y sus relaciones, normalizas, y después escribes las consultas que necesites (con `JOIN`, `WHERE`, `GROUP BY`). El motor las resuelve como pueda.

En DynamoDB es al revés:

1. **Primero listas los patrones de acceso:** exactamente qué preguntas hará tu aplicación.
2. **Después diseñas las claves** para que cada patrón sea una lectura directa y barata.

No hay `JOIN`, no hay agregaciones, no hay consultas arbitrarias. A cambio, cada operación sobre una clave tarda lo mismo con mil o con mil millones de elementos.

## Estructura básica

- **Tabla:** colección de elementos (items).
- **Elemento:** conjunto de atributos; tamaño máximo **400 KB**.
- **Atributos:** tipos escalares (`S`, `N`, `B`, `BOOL`, `NULL`), conjuntos y estructuras (`L` listas, `M` mapas).
- **Clave primaria** (obligatoria, inmutable para un elemento):
  - **Simple:** solo clave de partición (PK).
  - **Compuesta:** PK + **clave de ordenación (SK)**.

La clave de partición se pasa por una función hash que decide en qué **partición física** vive el elemento. Dentro de una partición, los elementos con la misma PK se almacenan **ordenados por SK**. Eso es lo que permite consultas por rango dentro de una PK.

### Qué hace buena a una clave de partición

- **Alta cardinalidad:** muchos valores distintos (ID de cliente, ID de pedido), para repartir.
- **Distribución uniforme del tráfico:** que no una sola clave reciba la mayoría de las solicitudes.

Una partición admite del orden de **3 000 unidades de lectura y 1 000 de escritura por segundo**. Si un solo valor de PK concentra mucho más (una "partición caliente"), obtienes *throttling* aunque la tabla tenga capacidad de sobra. DynamoDB tiene mecanismos adaptativos que alivian parte del problema, pero no sustituyen a un buen diseño.

## Operaciones y su costo

| Operación | Qué hace | Costo/Eficiencia |
|---|---|---|
| `GetItem` | Un elemento por clave completa | Mínimo |
| `PutItem` / `UpdateItem` / `DeleteItem` | Escribe, modifica o borra uno | Mínimo; admiten **condiciones** |
| `Query` | Elementos con la misma PK, filtrando por SK (`=`, `<`, `between`, `begins_with`) | Eficiente: solo lee lo que devuelve |
| `Scan` | **Recorre toda la tabla** | Caro y lento; evítalo en rutas de la aplicación |
| `BatchGetItem` / `BatchWriteItem` | Hasta 100 lecturas / 25 escrituras en una llamada | Reduce viajes; pueden devolver elementos sin procesar |
| `TransactGetItems` / `TransactWriteItems` | Operaciones atómicas sobre hasta 100 elementos | Cuestan el doble en capacidad |

Dos aclaraciones que evitan errores:

- **`Query` y `Scan` devuelven como máximo 1 MB por página.** Si hay más, devuelven `LastEvaluatedKey` y debes paginar.
- **Un `FilterExpression` se aplica después de leer.** Pagas la capacidad de lo **leído**, no solo de lo devuelto. Filtrar no reduce el costo: lo reduce una buena clave.

## Capacidad: RCU, WCU y dos modos

Las unidades de capacidad se definen así:

- **1 RCU (unidad de lectura):** una lectura **fuertemente consistente** de hasta 4 KB por segundo; **dos** lecturas eventualmente consistentes; o media lectura transaccional.
- **1 WCU (unidad de escritura):** una escritura de hasta 1 KB por segundo; las transaccionales cuestan el doble.

Los tamaños se redondean hacia arriba por operación. Un elemento de 1.1 KB cuesta **2** WCU al escribirlo. Eso hace que **elementos grandes y pequeñas actualizaciones** sean ineficientes: cada `UpdateItem` cobra según el tamaño completo del elemento.

### Los dos modos

| | **Bajo demanda (on-demand)** | **Aprovisionado** |
|---|---|---|
| Cómo pagas | Por cada solicitud de lectura/escritura | Por capacidad por hora, uses o no |
| Escalado | Automático, sin planificar | Manual o con Auto Scaling |
| Ideal | Tráfico impredecible, nuevo, esporádico | Tráfico estable y predecible |
| Riesgo | Más caro por solicitud a carga alta y constante | *Throttling* si subestimas; pago de más si sobrestimas |

Una práctica común: empieza **bajo demanda**, mide durante unas semanas y, si el tráfico es predecible y sostenido, evalúa el aprovisionado (con compromisos de capacidad reservada para reducir más). Se puede cambiar de modo con ciertas restricciones de frecuencia.

También existen dos **clases de tabla**: Standard y **Standard-IA** (menor costo de almacenamiento, mayor costo por operación), útil para tablas grandes que se acceden poco.

## Consistencia

- **Eventualmente consistente** (predeterminada): puede devolver un dato ligeramente anterior; cuesta la mitad.
- **Fuertemente consistente:** refleja todas las escrituras previas confirmadas; solo en la tabla base y en índices locales, **no** en índices globales.

## Índices secundarios

La clave primaria resuelve un solo patrón. Para otros:

| | **GSI (global)** | **LSI (local)** |
|---|---|---|
| Clave | PK y SK distintas de la tabla | Misma PK, otra SK |
| Cuándo se crea | En cualquier momento | **Solo al crear la tabla** |
| Consistencia | **Eventual** | Se puede elegir fuerte |
| Capacidad | Propia (se cobra aparte) | Comparte la de la tabla |
| Límite | ~20 por tabla (ajustable) | 5; limitan el tamaño de la colección a 10 GB por PK |

Con GSI recuerda:

- **Las escrituras se replican al índice** y consumen su capacidad. Un GSI con poca capacidad provoca *throttling* en la tabla base.
- **Proyecta solo los atributos necesarios** (`KEYS_ONLY`, `INCLUDE` o `ALL`): cada atributo proyectado cuesta almacenamiento y escritura.
- **Un GSI "disperso"** (sparse) solo contiene los elementos que tienen su atributo de clave: sirve, por ejemplo, para indexar solo los pedidos `PENDIENTE` y consultarlos sin recorrer los demás.

## Un ejemplo completo: pedidos de una tienda

**Patrones de acceso:**

1. Obtener un cliente por ID.
2. Listar los pedidos de un cliente, del más reciente al más antiguo.
3. Obtener un pedido con todas sus líneas.
4. Listar los pedidos pendientes de todos los clientes.
5. Buscar un cliente por correo.

Un diseño de **tabla única** posible:

| PK | SK | Atributos | Entidad |
|---|---|---|---|
| `CLIENTE#123` | `PERFIL` | nombre, correo | Cliente |
| `CLIENTE#123` | `PEDIDO#2026-10-30#A001` | total, estado | Pedido (resumen) |
| `PEDIDO#A001` | `CABECERA` | clienteId, total, estado | Pedido |
| `PEDIDO#A001` | `LINEA#001` | sku, cantidad, precio | Línea de pedido |

- Patrón 1: `GetItem(PK=CLIENTE#123, SK=PERFIL)`.
- Patrón 2: `Query(PK=CLIENTE#123, SK begins_with PEDIDO#, ScanIndexForward=false)`: los pedidos del cliente ordenados por fecha (el formato `YYYY-MM-DD` en la SK ordena cronológicamente).
- Patrón 3: `Query(PK=PEDIDO#A001)`: devuelve la cabecera y todas las líneas en una sola llamada.
- Patrón 4: un **GSI disperso** con `GSI1PK = "ESTADO#PENDIENTE"` y `GSI1SK = fecha`, presente solo en pedidos pendientes. Al completar el pedido, se elimina ese atributo y sale del índice.
- Patrón 5: un GSI con `GSI2PK = CORREO#ana@ejemplo.com`.

```python
import boto3
from boto3.dynamodb.conditions import Key

tabla = boto3.resource("dynamodb").Table("tienda")

# Patrón 2: pedidos de un cliente, el más reciente primero
respuesta = tabla.query(
    KeyConditionExpression=Key("PK").eq("CLIENTE#123") & Key("SK").begins_with("PEDIDO#"),
    ScanIndexForward=False,
    Limit=20,
)
pedidos = respuesta["Items"]
siguiente = respuesta.get("LastEvaluatedKey")  # para paginar
```

### ¿Tabla única o varias tablas?

El **diseño de tabla única** (varias entidades en una tabla, con claves compuestas por prefijos) permite leer entidades relacionadas en una sola llamada y es muy eficiente, pero tiene costos: es menos legible, más difícil de evolucionar, complica la exportación y el análisis, y exige conocer los patrones de acceso de antemano.

**Varias tablas** (una por entidad) son más simples de entender y operar, y siguen siendo una buena elección cuando las entidades se consultan de forma independiente. No es un dogma: elige según la complejidad de tus patrones y la experiencia del equipo. Un camino honesto: empieza simple, y adopta la tabla única donde un patrón de acceso lo justifique claramente.

## Escrituras condicionales y concurrencia

Las condiciones evitan carreras sin necesidad de bloqueos:

```python
# Crear solo si no existe
tabla.put_item(
    Item={"PK": "CLIENTE#123", "SK": "PERFIL", "nombre": "Ana"},
    ConditionExpression="attribute_not_exists(PK)",
)

# Bloqueo optimista con un número de versión
tabla.update_item(
    Key={"PK": "PEDIDO#A001", "SK": "CABECERA"},
    UpdateExpression="SET estado = :nuevo, version = version + :uno",
    ConditionExpression="version = :actual",
    ExpressionAttributeValues={":nuevo": "ENVIADO", ":actual": 3, ":uno": 1},
)
```

Si la condición falla, obtienes `ConditionalCheckFailedException`: la señal para releer y reintentar o abortar. Es la base de la **idempotencia** (escribir una clave de operación solo una vez) y de contadores seguros (`ADD` atómico).

## Transacciones

`TransactWriteItems` permite hasta 100 operaciones atómicas (y con condiciones) incluso sobre tablas distintas de la misma región y cuenta. Útil para cosas como "descontar saldo en una cuenta y abonar en otra". Cuestan el doble de capacidad y tienen límites de tamaño total; no las uses como valor predeterminado, solo donde la atomicidad lo exige.

## Funciones que cambian el diseño

- **TTL (Time To Live):** marcas un atributo con una fecha de expiración (en segundos desde época) y DynamoDB elimina el elemento después, **sin costo de escritura**. La eliminación no es instantánea (puede tardar hasta unos días tras la fecha), así que las lecturas deben filtrar los expirados si te importa.
- **DynamoDB Streams:** registro ordenado de cambios por elemento, retenido 24 horas. Dispara Lambda para mantener vistas derivadas, enviar eventos o replicar. También existe la integración con **Kinesis Data Streams**.
- **PITR y respaldos:** recuperación a un punto en el tiempo hasta 35 días atrás, y respaldos bajo demanda, sin afectar el rendimiento. La restauración crea una **tabla nueva**.
- **Tablas globales:** replicación multirregión activa-activa, con resolución de conflictos por "gana la última escritura".
- **DAX:** caché en memoria compatible con la API, con latencias de microsegundos para lecturas repetidas. Útil en cargas de lectura intensiva; añade un clúster que mantener.
- **Exportación a S3** para análisis (con Athena, por ejemplo) sin consumir capacidad de la tabla.

## Cuándo es buena opción

- Acceso por clave con alto volumen: perfiles, sesiones, carritos, inventarios, configuración.
- Sistemas **serverless**: sin conexiones que administrar, escala sin intervención.
- Cargas con picos impredecibles (con el modo bajo demanda).
- Latencia predecible como requisito.

## Cuándo no lo es

- **Consultas ad hoc y analítica** con filtros arbitrarios y agregaciones: usa una base relacional, un almacén de datos, o exporta a S3 y consulta con Athena.
- **Modelos muy relacionales** con consultas que cruzan muchas entidades de formas imprevisibles.
- **Patrones de acceso aún inciertos** en un equipo sin tiempo de rediseñar: un cambio de patrón puede significar migrar los datos.
- **Elementos muy grandes** (guarda los archivos en S3 y la referencia en DynamoDB).

## Los gotchas, al punto

- **`Scan` en la ruta caliente** de una aplicación.
- **Partición caliente** por una clave de baja cardinalidad o un patrón temporal (todos escribiendo en "hoy"). Soluciones: añadir un sufijo de fragmentación (*write sharding*) a la PK.
- **Filtros que no reducen costo** (se cobra lo leído).
- **GSI infraaprovisionado** que provoca *throttling* en la tabla base.
- **Olvidar paginar** y asumir que el resultado está completo.
- **Elementos grandes con actualizaciones pequeñas** que cobran el tamaño completo.
- **TTL asumido como instantáneo.**
- **LSI creado por costumbre**, limitando la colección a 10 GB por PK.
- **Contadores no atómicos** (leer, sumar, escribir) en lugar de `ADD`.
- **Cambiar de modo de capacidad** con la frecuencia que molesta a AWS (hay un límite de cambios por periodo).
- **Atributos reservados** en expresiones (`name`, `status`...) que requieren `ExpressionAttributeNames`.

## Un orden de trabajo sensato

1. Escribe los **patrones de acceso** con volumen y latencia esperados.
2. Diseña **PK/SK** para los principales y **GSI** para el resto.
3. Define **TTL**, **PITR** y **cifrado** (siempre cifrada en reposo; elige llave administrada por AWS o por ti).
4. Empieza **bajo demanda**; instrumenta consumo de capacidad y *throttling*.
5. Crea la tabla con **infraestructura como código**.
6. Prueba con **datos de volumen realista** y patrones de acceso reales, no con tres elementos.
7. Alarmas: errores de *throttling*, latencia, errores de usuario del sistema, edad del iterador de Streams.

## Para finalizar

DynamoDB premia a quien piensa antes de crear la tabla. Con patrones de acceso claros, claves bien repartidas e índices justos, la tabla responde en milisegundos y escala sola. Con patrones vagos, termina como un almacén caro del que solo se sabe sacar datos recorriéndolo entero.

Antes de elegirla, hazte una pregunta honesta: ¿puedo escribir ahora mismo, en una lista, todas las consultas que va a necesitar mi aplicación? Si la respuesta es sí, DynamoDB probablemente encaja. Si es "ya veremos", empieza con una base relacional.
