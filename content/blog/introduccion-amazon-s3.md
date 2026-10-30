---
title: "Introducción a Amazon S3: almacenamiento de objetos bien explicado"
date: 2026-10-30
description: "Qué es S3, cómo funcionan buckets y objetos, las clases de almacenamiento, la seguridad por defecto y los errores de costo más comunes."
tags: [AWS, S3, Almacenamiento]
---

Amazon S3 (Simple Storage Service) lleva desde 2006 en AWS y es probablemente el servicio que más se usa sin que la gente lo note: respaldos, sitios estáticos, datos de analítica, imágenes de aplicaciones, logs. Muchos otros servicios de AWS lo usan por debajo.

Pero entenderlo mal sale caro, en seguridad y en factura. Vamos por partes.

## Qué es (y qué no es)

S3 es almacenamiento de **objetos**. No es un disco que montas ni un sistema de archivos con carpetas reales. Cada objeto es:

- Un **archivo** de hasta 5 TB.
- Una **clave** (key) que lo identifica, por ejemplo `facturas/2026/10/factura-123.pdf`.
- **Metadatos** y, opcionalmente, etiquetas (tags).

Los objetos viven dentro de un **bucket**, y el nombre del bucket es único en todo el mundo dentro de una partición de AWS. Lo que en la consola parece una estructura de carpetas es solo un prefijo en la clave; la barra es parte del nombre.

| Servicio | Tipo | Úsalo para |
|---|---|---|
| S3 | Objetos | Archivos, respaldos, data lakes, sitios estáticos |
| EBS | Bloques | Discos de una instancia EC2 |
| EFS | Sistema de archivos | Archivos compartidos entre varias instancias |

Si necesitas editar un archivo por partes o tener un sistema de archivos POSIX, S3 no es la herramienta. Los objetos se reemplazan completos.

## Durabilidad y disponibilidad

AWS diseña S3 Standard para una durabilidad de **99.999999999 %** (once nueves): los datos se replican en al menos tres zonas de disponibilidad de la región. Esto es durabilidad, es decir, que el objeto no se pierda. No es lo mismo que disponibilidad, que es que puedas leerlo en este momento, y que es menor y depende de la clase.

Desde diciembre de 2020, S3 ofrece **consistencia fuerte de lectura después de escritura**: si subes un objeto y lo lees enseguida, ves la versión nueva. Antes algunos casos eran eventualmente consistentes y eso obligaba a diseñar con cuidado.

## Clases de almacenamiento

No todos los datos se tocan igual. S3 te deja pagar según qué tan seguido accedes:

| Clase | Pensada para | Nota |
|---|---|---|
| Standard | Acceso frecuente | Sin tarifa de recuperación |
| Intelligent-Tiering | Patrón de acceso desconocido o cambiante | Mueve objetos entre niveles solo |
| Standard-IA / One Zone-IA | Acceso poco frecuente | Cobro mínimo de tiempo y de tamaño; One Zone usa una sola zona |
| Glacier Instant Retrieval | Archivo con acceso en milisegundos | Para datos que se leen muy de vez en cuando |
| Glacier Flexible Retrieval | Archivo | Recuperación en minutos a horas |
| Glacier Deep Archive | Archivo a largo plazo | El más barato; recuperación en horas |

Los precios cambian por región y con el tiempo, así que revisa la página oficial antes de calcular. Lo importante es la lógica: cuanto más barato es guardar, más caro o lento es recuperar.

### Reglas de ciclo de vida

En lugar de mover datos a mano, defines una **política de ciclo de vida**: "a los 30 días pasa a Standard-IA, a los 180 a Glacier, a los 5 años elimina". Es la mejora de costo con mejor retorno en la mayoría de las cuentas.

## Seguridad: el servicio es seguro, tu configuración puede no serlo

Muchos incidentes famosos con S3 fueron buckets abiertos al público por error. Hoy AWS trae buenos valores por defecto:

- **Block Public Access** está activado en buckets nuevos.
- Todos los objetos nuevos se cifran en reposo por defecto con SSE-S3 (desde enero de 2023).
- Los buckets nuevos tienen las ACL desactivadas, y el control se hace con políticas.

Aun así, tú decides el resto:

1. **Políticas de IAM y de bucket** con mínimo privilegio. Evita `"Principal": "*"` salvo que sepas exactamente por qué.
2. **Mantén activo Block Public Access** a nivel de cuenta.
3. **Cifrado con KMS** si necesitas control y auditoría sobre las llaves.
4. **Versionado** para recuperar objetos borrados o sobrescritos, junto con **MFA Delete** en datos críticos.
5. **URLs prefirmadas** para dar acceso temporal a un objeto privado sin hacerlo público.

## Funciones que vale la pena conocer

- **Versionado:** guarda cada versión de un objeto. Ojo: las versiones viejas también se cobran, así que acompáñalo de una regla de ciclo de vida.
- **Replicación** entre regiones o cuentas, para recuperación ante desastres o cercanía.
- **Notificaciones de eventos:** cuando llega un objeto, puedes disparar una Lambda, un SQS o EventBridge. Es la base de muchas arquitecturas orientadas a eventos.
- **Hospedaje de sitios estáticos:** sirve HTML, CSS y JS directo desde un bucket. Para producción lo habitual es ponerle CloudFront delante para HTTPS, caché y dominio propio.
- **S3 Object Lock:** inmutabilidad tipo WORM para requisitos regulatorios.

## Un ejemplo práctico

Subir y listar objetos con la AWS CLI:

```bash
aws s3 cp reporte.pdf s3://mi-bucket-ejemplo/reportes/2026/reporte.pdf
aws s3 ls s3://mi-bucket-ejemplo/reportes/ --recursive
aws s3 presign s3://mi-bucket-ejemplo/reportes/2026/reporte.pdf --expires-in 3600
```

El último comando genera un enlace que funciona durante una hora sin abrir el bucket a nadie más.

## Errores de costo que se repiten

- **Cargas multiparte incompletas** que se quedan guardando partes sin que nadie las vea. Una regla de ciclo de vida las limpia.
- **Versionado sin expiración**, que hace crecer el bucket en silencio.
- **Muchísimas solicitudes sobre objetos diminutos.** S3 cobra por solicitud además de por almacenamiento.
- **Transferencia de datos hacia internet o entre regiones.** Subir es gratis; sacar datos no.
- **Mover a Glacier objetos muy pequeños**, donde los mínimos de cobro te cuestan más de lo que ahorras.

## Cuándo no usar S3

Si necesitas latencia de submilisegundo, escrituras parciales frecuentes o consultas relacionales sobre los datos, mira otras opciones: EBS, DynamoDB o una base de datos. S3 brilla en lo que no cambia seguido y se lee entero.

## Para finalizar

S3 es sencillo en concepto y profundo en detalles. Si te llevas tres ideas: elige la clase de almacenamiento según el acceso real, deja activo Block Public Access y define reglas de ciclo de vida desde el primer día. Con eso evitas la mayoría de los sustos de seguridad y de la factura.

En los siguientes artículos de la serie sigo con otros servicios principales de AWS.
