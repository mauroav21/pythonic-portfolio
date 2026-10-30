---
title: "Introducción a Amazon DynamoDB: NoSQL con latencia de milisegundos"
date: 2026-07-30
description: "Claves de partición y ordenación, modos de capacidad, índices secundarios y por qué en DynamoDB se diseña a partir de los patrones de acceso."
tags: [AWS, DynamoDB, NoSQL]
---

DynamoDB es la base de datos NoSQL totalmente administrada de AWS. Está diseñada para ofrecer latencias de pocos milisegundos de forma consistente, sin importar si tienes mil o mil millones de registros, y sin que administres servidores.

Pero hay una advertencia: **DynamoDB no es una base relacional más sencilla**. Se usa y se diseña de forma muy distinta, y los problemas casi siempre vienen de tratarla como si fuera SQL.

## Qué es

Una base de datos de **clave-valor y documentos**. Los datos se guardan en **tablas** compuestas por **elementos** (items), cada uno con atributos. No hay un esquema fijo más allá de la clave: cada elemento puede tener atributos distintos.

Características principales:

- **Serverless:** sin servidores que administrar, con escalado automático.
- **Latencia baja y predecible**, a cualquier escala.
- **Alta disponibilidad:** replicación automática entre varias zonas.
- **Cifrado en reposo** por defecto.
- **Pago por uso** (o por capacidad aprovisionada).

## La clave lo es todo

Cada tabla tiene una **clave primaria**, de dos tipos:

| Tipo | Composición | Para qué |
|---|---|---|
| **Simple** | Clave de partición | Buscar elementos por un identificador único |
| **Compuesta** | Clave de partición + clave de ordenación | Agrupar elementos relacionados y consultarlos por rango |

Ejemplo: una tabla de pedidos con `cliente_id` como clave de partición y `fecha_pedido` como clave de ordenación te permite pedir "todos los pedidos del cliente 123 de este mes" de forma eficiente.

La **clave de partición** determina en qué partición física se guarda el dato. Si muchas solicitudes se concentran en pocas claves (una "partición caliente"), se limita el rendimiento. Una buena clave distribuye la carga.

## Operaciones básicas

- **GetItem / PutItem / UpdateItem / DeleteItem:** operaciones sobre un elemento por clave. Muy rápidas.
- **Query:** busca elementos con la misma clave de partición, filtrando por la clave de ordenación. Eficiente.
- **Scan:** recorre **toda** la tabla. Lento y costoso; evítalo en producción para consultas habituales.
- **Transacciones:** operaciones atómicas sobre varios elementos.
- Un elemento puede pesar hasta **400 KB**.

## Modos de capacidad

| Modo | Cómo funciona | Cuándo conviene |
|---|---|---|
| **Bajo demanda (on-demand)** | Pagas por cada lectura y escritura; escala sin planificación | Tráfico impredecible o nuevo |
| **Aprovisionado** | Defines unidades de lectura y escritura por segundo (puedes usar autoescalado) | Tráfico estable y predecible, para optimizar costos |

Empieza con bajo demanda si no conoces tu patrón; cambia a aprovisionado cuando lo entiendas y el ahorro lo justifique.

## Índices secundarios

Por defecto solo consultas por la clave primaria. Si necesitas otro patrón de acceso:

- **Índice secundario global (GSI):** una clave de partición y ordenación distintas. Se mantiene aparte y sus lecturas son eventualmente consistentes.
- **Índice secundario local (LSI):** misma clave de partición, otra de ordenación; se define al crear la tabla.

Cada índice consume capacidad y almacenamiento adicionales.

## Diseñar por patrones de acceso

En SQL modelas los datos y luego decides las consultas. En DynamoDB es al revés:

1. **Lista tus patrones de acceso:** "obtener un cliente por ID", "pedidos de un cliente por fecha", "pedidos pendientes".
2. **Diseña las claves e índices** para resolver cada uno con una consulta eficiente.
3. **Desnormaliza** si hace falta: es normal duplicar datos para evitar uniones, que DynamoDB no tiene.

Un patrón avanzado es el **diseño de tabla única**, donde varias entidades conviven en una misma tabla con claves bien pensadas. Es potente, pero más difícil de entender y de evolucionar; no es obligatorio para empezar.

## Funciones útiles

- **TTL:** elimina automáticamente elementos tras una fecha, sin costo de escritura.
- **DynamoDB Streams:** flujo de cambios que puede disparar funciones Lambda.
- **Tablas globales:** replicación multirregión activa-activa.
- **Respaldos y recuperación a un punto en el tiempo.**
- **DAX:** caché en memoria compatible con DynamoDB para lecturas de microsegundos.
- **Exportación a S3** para análisis.

## Consistencia

Las lecturas son **eventualmente consistentes** por defecto (pueden devolver un dato ligeramente anterior), o **fuertemente consistentes** si lo pides (con mayor costo y sin disponibilidad en índices globales).

## Cuándo es buena opción

- Cargas con **acceso por clave** y alto volumen.
- Aplicaciones **serverless** que necesitan una base de datos sin conexiones que administrar.
- **Sesiones, carritos, perfiles, configuración, inventarios, juegos, IoT.**
- Necesidad de **escala masiva y latencia predecible**.

## Cuándo no

- **Consultas ad hoc y analítica** con filtros arbitrarios y uniones complejas.
- Modelos con **muchas relaciones** que cambian de forma constante.
- Equipos sin tiempo para aprender el diseño por patrones de acceso.
- Cuando los patrones de acceso aún no están claros: cambiarlos después puede ser costoso.

## Errores frecuentes

- **Tratarla como una base SQL** con una tabla por entidad y sin pensar en accesos.
- **Usar Scan** para consultas normales.
- **Claves que concentran el tráfico** en pocas particiones.
- **Demasiados índices** sin necesidad real.
- **Elementos enormes**, cuando conviene guardar archivos en S3 y la referencia en DynamoDB.
- **Elegirla por moda** sin comparar con RDS.

## Para finalizar

DynamoDB entrega escala y velocidad impresionantes si se diseña a partir de los patrones de acceso. A cambio, exige pensar distinto que en bases relacionales y renunciar a la flexibilidad de consulta.

Antes de crear tu primera tabla, escribe en papel las consultas que necesitas. Si no puedes, probablemente es demasiado pronto para elegirla.
