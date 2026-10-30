---
title: "Introducción a Amazon CloudFront: contenido rápido y seguro cerca del usuario"
date: 2026-09-18
description: "Qué es una CDN, cómo funcionan distribuciones, orígenes y cachés en CloudFront, y cómo protegerlo con HTTPS, OAC y WAF."
tags: [AWS, CloudFront, CDN]
---

Si tu servidor está en Virginia y tu usuario en Ciudad de México, cada archivo viaja miles de kilómetros en cada visita. La física no se negocia: la distancia añade latencia. Una **CDN (red de entrega de contenido)** resuelve esto copiando tu contenido en puntos cercanos a los usuarios. **Amazon CloudFront** es la CDN de AWS.

## Cómo funciona

CloudFront tiene una red global de **ubicaciones de borde** (edge locations). Cuando un usuario pide un recurso:

1. La solicitud llega a la ubicación de borde más cercana.
2. Si el contenido está en **caché**, se entrega de inmediato (acierto o *cache hit*).
3. Si no, CloudFront lo pide al **origen**, lo guarda en caché y lo entrega (fallo o *cache miss*).
4. Las siguientes solicitudes se sirven desde la caché.

Resultado: menos latencia para el usuario y menos carga para tu origen.

## Conceptos clave

| Concepto | Qué es |
|---|---|
| **Distribución** | La configuración de CloudFront, con su dominio `xxxx.cloudfront.net` |
| **Origen** | De dónde saca CloudFront el contenido: un bucket de S3, un balanceador, un servidor HTTP o API Gateway |
| **Comportamiento de caché (cache behavior)** | Reglas por ruta (por ejemplo, `/api/*` vs. `/static/*`): origen, métodos permitidos, políticas de caché |
| **TTL** | Cuánto tiempo permanece un objeto en caché |
| **Invalidación** | Eliminar objetos de la caché antes de que expiren |

## Casos de uso

- **Sitios estáticos** (HTML, CSS, JS, imágenes) alojados en S3 con HTTPS y dominio propio.
- **Aceleración de sitios y aplicaciones dinámicas:** aun sin caché, CloudFront usa la red troncal de AWS, que suele ser más rápida y estable que internet público.
- **Distribución de video y descargas grandes.**
- **Protección y filtrado de tráfico** en la entrada.
- **Personalización en el borde** con funciones.

## Un ejemplo clásico: sitio estático

1. Subes tu sitio a un bucket de S3 **privado**.
2. Creas una distribución de CloudFront con ese bucket como origen.
3. Usas **Origin Access Control (OAC)** para que **solo** CloudFront pueda leer el bucket.
4. Asocias un certificado de **AWS Certificate Manager (ACM)** y tu dominio.
5. Apuntas el DNS (por ejemplo, en Route 53) a la distribución.

Un detalle: el certificado de ACM para CloudFront debe crearse en la región **us-east-1 (Virginia del Norte)**.

## Caché: donde se gana (o se pierde) el valor

El rendimiento depende de cuántas solicitudes se atienden desde caché (**cache hit ratio**). Factores:

- **Políticas de caché:** qué partes de la solicitud (parámetros, cabeceras, cookies) forman la clave de caché. Cuantas más incluyas, más variantes y menos aciertos.
- **TTL adecuados:** archivos que cambian poco, TTL largo; contenido dinámico, corto o nulo.
- **Nombres versionados** (`app.3f9a1c.js`) en lugar de invalidar: así puedes poner TTL largos y cambiar el nombre al actualizar.

Las **invalidaciones** son útiles, pero cuestan después de cierto volumen mensual y no sustituyen una buena estrategia de versionado.

## Seguridad

- **HTTPS:** redirige HTTP a HTTPS y usa una política de seguridad TLS actual.
- **OAC** para S3, y restringir el origen para que no sea accesible directamente.
- **AWS WAF:** reglas contra ataques web comunes y limitación de tasa.
- **AWS Shield Standard:** protección básica contra DDoS, incluida sin costo adicional.
- **URL y cookies firmadas** para contenido de acceso restringido.
- **Restricciones geográficas** si las necesitas.
- **Cabeceras de seguridad** mediante políticas de respuesta.

## Cómputo en el borde

- **CloudFront Functions:** funciones muy ligeras y rápidas para reescribir URL, redirecciones, autenticación sencilla, cabeceras.
- **Lambda@Edge:** funciones más potentes, con más tiempo y capacidad, para lógica más compleja.

## Costos

Se paga principalmente por:

- **Transferencia de datos** hacia internet, según región.
- **Número de solicitudes** HTTP/HTTPS.
- Funciones y funciones de borde, invalidaciones fuera de la cuota gratuita, y extras como WAF.

Hay una capa gratuita mensual. La transferencia de S3 hacia CloudFront no se cobra, lo que puede abaratar servir contenido de S3 por esta vía. Revisa la página de precios vigente.

## Buenas prácticas

1. **Pon CloudFront delante de S3 y de tus aplicaciones web.**
2. **Mantén los orígenes cerrados** a accesos directos.
3. **Versiona los archivos estáticos** y usa TTL largos.
4. **Minimiza la clave de caché.**
5. **Activa compresión** (gzip y Brotli).
6. **Usa HTTP/2 y HTTP/3.**
7. **Registra y monitorea** con registros de acceso y métricas de CloudWatch.
8. **Aplica WAF** si expones aplicaciones al público.

## Errores frecuentes

- **Bucket público** en lugar de OAC.
- **Cachear contenido personalizado** y mostrar a un usuario datos de otro. Revisa muy bien qué se almacena en caché en rutas con sesión.
- **No pasar las cabeceras necesarias** al origen, o pasar demasiadas y matar el rendimiento de la caché.
- **Depender de invalidaciones** para cada despliegue.
- **Olvidar el certificado en us-east-1.**
- **Pruebas que sirven contenido viejo** por TTL largos sin versionado.

## Para finalizar

CloudFront acerca tu contenido a los usuarios, reduce la carga de tu origen y añade una capa de seguridad en la entrada. Con S3 privado, OAC, versionado de archivos y una clave de caché mínima, obtienes sitios rápidos, baratos y seguros con poco esfuerzo.

Es de los servicios con mejor retorno que puedes agregar a casi cualquier aplicación web.
