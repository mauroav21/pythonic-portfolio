---
title: "Amazon S3 a fondo: modelo, seguridad, costos y los errores que salen caros"
date: 2026-06-22
description: "Cómo funciona S3 por dentro (claves, consistencia, particiones), clases de almacenamiento, ciclo de vida, seguridad por capas, patrones de acceso, rendimiento y los errores de costo y seguridad más comunes, con ejemplos."
tags: [AWS, S3, Almacenamiento]
---

S3 es el servicio de AWS que casi todo el mundo usa desde el primer día y casi nadie revisa después. Funciona tan bien que se vuelve invisible, hasta que llega una factura por almacenamiento que nadie reconoce, un bucket que alguien dejó abierto o una aplicación que de pronto tarda segundos en listar un prefijo.

Este artículo es la versión larga: cómo está modelado S3, qué garantiza de verdad, cómo se paga, cómo se protege por capas y dónde están las trampas.

## Qué es S3 (y qué no es)

S3 es un **almacén de objetos**. Cada objeto es:

- Un **contenido** (de 0 bytes hasta 5 TB).
- Una **clave** que lo identifica dentro del bucket: `facturas/2026/10/factura-123.pdf`.
- **Metadatos** del sistema y definidos por ti, y hasta 10 **etiquetas**.
- Opcionalmente, un **identificador de versión**.

No existe una jerarquía de carpetas. La barra es un carácter más de la clave; la consola dibuja "carpetas" agrupando por prefijo para que sea cómodo. Esto importa porque **"renombrar una carpeta" en S3 significa copiar y borrar cada objeto**, y porque listar un prefijo con millones de objetos es una operación de lista, no de directorio.

Tampoco es un disco ni un sistema de archivos POSIX:

| Necesitas | Usa |
|---|---|
| Un disco para una instancia EC2 | EBS |
| Un sistema de archivos compartido entre instancias | EFS (o FSx) |
| Guardar y servir archivos, respaldos, data lakes, artefactos | **S3** |

Los objetos son **inmutables**: para cambiar un byte, subes el objeto completo de nuevo. Nada de editar por partes.

## Qué garantiza

### Durabilidad vs. disponibilidad

- **Durabilidad (que el dato no se pierda):** S3 Standard está diseñado para **99.999999999 % (once nueves)**. Se logra replicando los datos en al menos tres zonas de disponibilidad (en las clases que no son de una sola zona).
- **Disponibilidad (que puedas leerlo ahora):** menor y distinta por clase. Standard está diseñada para 99.99 %.

Once nueves no significan que no puedas borrarlo tú. La mayor causa de pérdida de datos en S3 es **la propia cuenta**: un script que borra de más, un `aws s3 rm --recursive` en el bucket equivocado, una credencial comprometida. Por eso existen el versionado, Object Lock y la replicación.

### Consistencia

Desde diciembre de 2020, S3 ofrece **consistencia fuerte de lectura tras escritura** para todos los objetos, incluyendo listados. Si escribes un objeto y lo lees o lo listas de inmediato, ves la versión nueva. Esto eliminó una familia entera de parches (esperas, reintentos, capas de consistencia como S3Guard) que antes eran habituales.

Lo que **sigue sin ser transaccional** es el conjunto: no hay operaciones atómicas sobre varios objetos ni "commit de una carpeta". Si necesitas eso (por ejemplo, publicar un conjunto de archivos que debe verse completo o nada), usa un archivo marcador de "listo" o un formato de tabla como Apache Iceberg o Delta Lake, que lo resuelven a nivel de metadatos.

## Clases de almacenamiento: pagar según cómo accedes

No todo dato se toca igual, y S3 lo refleja en el precio. La regla: **cuanto más barato es guardar, más caro o lento es recuperar**.

| Clase | Pensada para | Lo que debes saber |
|---|---|---|
| **Standard** | Acceso frecuente | Sin cargo de recuperación ni duración mínima |
| **Intelligent-Tiering** | Patrón desconocido o cambiante | Mueve objetos automáticamente entre niveles según el acceso; cobra una pequeña tarifa de monitoreo por objeto |
| **Standard-IA** | Acceso poco frecuente, necesitas milisegundos | Cargo por GB recuperado, duración mínima de 30 días y tamaño mínimo facturable de 128 KB por objeto |
| **One Zone-IA** | Lo anterior, pero recreable y en una sola zona | Un fallo de la zona puede perder los datos |
| **Glacier Instant Retrieval** | Archivo que se lee una vez por trimestre, aun así en milisegundos | Duración mínima 90 días |
| **Glacier Flexible Retrieval** | Archivo con recuperación en minutos a horas | Duración mínima 90 días |
| **Glacier Deep Archive** | Retención a muy largo plazo | El más barato; recuperación en horas; mínimo 180 días |

(Los mínimos de duración y de tamaño, y los precios, cambian; confírmalos en la documentación antes de decidir.)

### Las dos trampas de las clases baratas

1. **Objetos pequeños.** El tamaño mínimo facturable de las clases IA (128 KB) hace que guardar millones de objetos de 5 KB en Standard-IA te cueste **más** que en Standard. Antes de mover por ciclo de vida, revisa la distribución de tamaños.
2. **Eliminación anticipada.** Si borras o mueves un objeto antes de su duración mínima, **pagas lo que faltaba**. Mover algo a Glacier Deep Archive y borrarlo a los 20 días no es un ahorro.

Intelligent-Tiering es una apuesta razonable cuando **no sabes** cómo se accede, porque evita el cargo de recuperación y tiene un nivel automático de ahorro. No conviene para una enorme cantidad de objetos pequeños, donde la tarifa de monitoreo por objeto pesa.

## Ciclo de vida: la optimización con mejor retorno

Una **regla de ciclo de vida** mueve o elimina objetos según su edad y filtros (prefijo, etiqueta, tamaño). Un ejemplo con intención:

```json
{
  "Rules": [
    {
      "ID": "logs-a-frio-y-limpieza",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [
        { "Days": 30,  "StorageClass": "STANDARD_IA" },
        { "Days": 180, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 1825 },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 30 },
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 }
    }
  ]
}
```

Las dos últimas líneas son las que casi todos olvidan:

- **`NoncurrentVersionExpiration`:** con versionado activo, las versiones anteriores se acumulan y **se cobran**. Sin esta regla, un bucket que se sobrescribe a diario crece sin límite.
- **`AbortIncompleteMultipartUpload`:** una carga multiparte que falla deja partes almacenadas e invisibles en la consola normal, y cobrando. Esta regla las limpia.

## Seguridad: capas, no una casilla

La mayoría de los incidentes públicos de S3 fueron **buckets expuestos por configuración**, no fallas del servicio. AWS ha endurecido los valores por defecto:

- **Block Public Access** viene activado en buckets nuevos.
- Los buckets nuevos tienen las **ACL desactivadas** (Object Ownership: "bucket owner enforced"): el acceso se gobierna con políticas.
- Todos los objetos nuevos se **cifran en reposo** por defecto con SSE-S3 (desde enero de 2023).

Pero la seguridad real se construye por capas:

### 1. Block Public Access a nivel de cuenta

Actívalo en toda la cuenta, no solo por bucket. Es el freno de emergencia contra la exposición accidental, y se puede aplicar con una política de control de servicios para que nadie lo desactive.

### 2. Políticas con mínimo privilegio

Una política de bucket que solo permite lo necesario, a quien lo necesita, desde donde debe:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SoloHTTPS",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::mi-bucket", "arn:aws:s3:::mi-bucket/*"],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    },
    {
      "Sid": "LecturaDesdeMiVPC",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/app-lectora" },
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::mi-bucket/datos/*",
      "Condition": { "StringEquals": { "aws:SourceVpce": "vpce-0abc1234567890def" } }
    }
  ]
}
```

La primera sentencia obliga a HTTPS. La segunda limita la lectura a un rol concreto **y** a un endpoint de VPC concreto. Un `Deny` explícito siempre gana a cualquier `Allow`.

### 3. Cifrado según el control que necesites

| Opción | Quién gestiona la llave | Cuándo |
|---|---|---|
| **SSE-S3** | S3 | Por defecto; suficiente para muchos casos |
| **SSE-KMS** | Tú, mediante KMS | Auditoría por uso de llave, control de quién puede descifrar, rotación y revocación |
| **SSE-C** | Tú, la envías en cada petición | Raro; tú custodias la llave |
| **Cifrado del lado del cliente** | Tú, antes de subir | Si los datos no deben llegar en claro a AWS |

Con SSE-KMS, cada operación llama a KMS, con **su costo y sus límites de solicitudes**. En cargas masivas conviene activar **S3 Bucket Keys**, que reduce de forma drástica las llamadas a KMS.

### 4. Protección contra borrado

- **Versionado:** cada sobrescritura o borrado crea una versión; "borrar" solo añade un marcador de borrado y puedes recuperar.
- **MFA Delete:** exige autenticación multifactor para eliminar versiones.
- **Object Lock:** inmutabilidad tipo WORM, por un periodo de retención o de forma indefinida. Es lo que usas para requisitos regulatorios y como defensa contra ransomware.
- **Replicación** a otra región o cuenta, para recuperación ante desastres y aislamiento.

### 5. Acceso privado y visibilidad

- **Endpoints de VPC de tipo Gateway** para S3: el tráfico no sale de la red de AWS y **no tienen costo adicional**; además evitan pagar el procesamiento de NAT Gateway por ese tráfico.
- **CloudTrail** con eventos de datos de S3 (si necesitas auditar lecturas y escrituras de objetos, que **no** se registran por defecto), y **registros de acceso del servidor** o eventos de datos para investigación.
- **IAM Access Analyzer for S3** para detectar buckets con acceso externo.
- **Amazon Macie** si necesitas descubrir datos sensibles a escala.

## Patrones de acceso que conviene conocer

### URLs prefirmadas

Das acceso temporal a un objeto privado sin abrir el bucket:

```python
import boto3

s3 = boto3.client("s3")
url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": "mi-bucket", "Key": "reportes/2026/reporte.pdf"},
    ExpiresIn=900,  # 15 minutos
)
```

Ten en cuenta que la URL **hereda los permisos de quien la firmó**. Si la firmas con credenciales temporales de un rol, la URL deja de funcionar cuando esas credenciales caducan, aunque `ExpiresIn` sea mayor. Para subidas directas desde el navegador usa **URLs prefirmadas de `put_object`** o **POST prefirmado**, con condiciones de tipo y tamaño.

### Subida directa del cliente

En lugar de que el archivo pase por tu API (y por tu cómputo y su timeout), la API genera una URL prefirmada y el cliente sube directo a S3. Es más barato, más rápido y escala sin esfuerzo.

### Sitio estático con CloudFront

Bucket **privado** + CloudFront con **Origin Access Control (OAC)**. El bucket no se hace público; CloudFront es el único con permiso de lectura. Obtienes HTTPS, caché y dominio propio. El **hospedaje de sitios web de S3** (el endpoint "website") solo sirve HTTP y exige bucket público, así que para producción es la peor opción.

### Eventos

S3 puede notificar la creación o eliminación de objetos a **Lambda, SQS, SNS o EventBridge**. EventBridge ofrece filtrado más rico. Cuidado con la **recursión**: una función que escribe en el mismo bucket y prefijo que la dispara se llama a sí misma indefinidamente. Usa prefijos distintos o filtros por sufijo.

## Rendimiento

S3 escala por prefijo: a cada **prefijo** le corresponde un rendimiento mínimo de **3 500 solicitudes de escritura (PUT/COPY/POST/DELETE) y 5 500 de lectura (GET/HEAD) por segundo**, y puedes usar tantos prefijos como quieras. El viejo consejo de "aleatoriza el inicio de las claves" ya no es necesario para la mayoría de los casos.

Para sacar rendimiento:

- **Cargas multiparte** para objetos grandes (recomendadas a partir de unos 100 MB; obligatorias por encima de 5 GB en una sola operación) y **en paralelo**.
- **Descargas por rangos** (`Range`) en paralelo para archivos grandes.
- **Transfer Acceleration** si subes desde lejos de la región (mide antes: no siempre compensa).
- **Muchas solicitudes pequeñas** son lo caro: agrupa cuando puedas.
- Los **listados** (`ListObjectsV2`) devuelven hasta 1 000 claves por llamada y son lentos a gran escala. Para inventarios masivos, usa **S3 Inventory** en lugar de listar.

## Costos: de dónde sale la factura

S3 cobra por varios conceptos, y el almacenamiento rara vez es el único:

| Concepto | Detalle |
|---|---|
| **Almacenamiento** | Por GB-mes según la clase |
| **Solicitudes** | Por cada 1 000 (PUT/COPY/POST/LIST cuestan más que GET) |
| **Recuperación** | En las clases IA y Glacier |
| **Transferencia** | Entrada gratuita; **salida a internet** y entre regiones se cobra |
| **Funciones extra** | Monitoreo de Intelligent-Tiering, replicación, inventario, análisis, Object Lambda, KMS |

### Causas habituales de factura sorpresa

- **Versiones no actuales** acumuladas sin regla de expiración.
- **Cargas multiparte abandonadas.**
- **Billones de objetos pequeños** con tarifas por solicitud y mínimos de las clases IA.
- **Transferencia de salida** por servir archivos directamente desde S3 a internet, en vez de a través de CloudFront (la salida de S3 hacia CloudFront no se cobra y la de CloudFront suele ser más barata).
- **Tráfico entre regiones** por replicación o por aplicaciones en otra región.
- **Solicitudes LIST** en bucles (una aplicación que lista constantemente un prefijo grande).
- **KMS** en cargas con muchísimas operaciones, sin Bucket Keys.
- **Datos en S3 que nadie usa**: bucket de pruebas de hace tres años. **S3 Storage Lens** te muestra qué hay y qué crece.

### Cómo encontrar a dónde se va el dinero

1. **Cost Explorer** filtrado por servicio S3 y agrupado por tipo de uso: te dice si el problema es almacenamiento, solicitudes o transferencia.
2. **S3 Storage Lens** para ver crecimiento por bucket y prefijo, versiones no actuales y cargas incompletas.
3. **Etiquetas de asignación de costos** por bucket para atribuir gasto a equipos.
4. **Alertas de presupuesto** (AWS Budgets) para enterarte antes de fin de mes.

## Los gotchas, al punto

- **Nombres de bucket únicos globalmente** y no reutilizables al instante tras borrar uno.
- **Los eventos de datos no se registran por defecto** en CloudTrail: si no los activas, no sabrás quién leyó un objeto.
- **Borrar un bucket versionado** exige eliminar todas las versiones y marcadores, no solo "vaciarlo" en el sentido habitual.
- **`aws s3 sync --delete`** con el origen y destino invertidos borra datos. Haz primero con `--dryrun`.
- **Las políticas de bucket mal escritas** pueden bloquear al propio administrador. Prueba con el simulador y mantén un camino de recuperación.
- **Las URLs prefirmadas heredan permisos** y caducan con las credenciales que las firmaron.
- **CORS**: si tu aplicación web sube o lee desde el navegador, necesitarás configurar CORS en el bucket.
- **Los metadatos y el tipo de contenido** (`Content-Type`) que subes son los que se sirven: un `Content-Type` incorrecto hace que el navegador descargue en lugar de mostrar.
- **Clases con duración mínima**: eliminar antes se paga igual.

## Cuándo S3 no es la herramienta

- Necesitas **escrituras parciales frecuentes** sobre un mismo archivo.
- Necesitas **latencia de submilisegundo** o semántica de sistema de archivos POSIX.
- Quieres **consultar registros individuales** con filtros arbitrarios: para eso, una base de datos, o S3 con Athena si el caso es analítico sobre archivos columnares.
- Transacciones sobre varios objetos.

## Lista de revisión para un bucket nuevo

1. Block Public Access **activado** (cuenta y bucket).
2. **Cifrado** definido (SSE-S3 o SSE-KMS con Bucket Keys).
3. **Política de bucket** con HTTPS obligatorio y acceso mínimo.
4. **Versionado** activado si los datos importan, con **expiración de versiones no actuales**.
5. **Regla de ciclo de vida** con transiciones razonables y **limpieza de cargas multiparte incompletas**.
6. **Etiquetas** de proyecto y responsable.
7. **Registro y auditoría** (CloudTrail con eventos de datos si hace falta).
8. **Endpoint de VPC** para accesos desde la red privada.
9. **Alerta de presupuesto** configurada.
10. **Infraestructura como código** para que nada de esto dependa de clics.

## Para finalizar

S3 es sencillo de usar y fácil de usar mal. La buena noticia es que casi todos los problemas se previenen con unas pocas decisiones tomadas el primer día: bloquear el acceso público a nivel de cuenta, elegir bien el cifrado, activar el versionado con su regla de limpieza, definir el ciclo de vida y vigilar el gasto con etiquetas y alertas.

Si recibes un bucket heredado, no empieces por optimizar: empieza por mirar qué hay, quién puede acceder y cuánto crece. Lo que encuentres en esa revisión casi siempre vale más que cualquier ajuste fino.
