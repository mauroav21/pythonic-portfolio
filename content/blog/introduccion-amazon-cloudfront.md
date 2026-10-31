---
title: "Amazon CloudFront a fondo: caché, orígenes, seguridad y por qué tu sitio sigue lento"
date: 2026-09-18
description: "Cómo funciona la caché de CloudFront (clave, TTL, invalidaciones), orígenes y OAC, comportamientos, funciones en el borde, seguridad con WAF y firmas, depuración de aciertos y fallos, y los errores de configuración que más cuestan."
tags: [AWS, CloudFront, CDN]
---

Poner CloudFront delante de un sitio es de las mejoras más baratas que existen: HTTPS, HTTP/2 y HTTP/3, compresión, caché y protección en el borde con unos pocos clics. Y, sin embargo, abundan los sitios con CloudFront que siguen lentos, o que sirven contenido viejo durante horas, o que cuestan más de lo esperado, o que mostraron los datos de un usuario a otro. Casi siempre es lo mismo: se activó la CDN sin entender la **caché**. Este artículo trata de entenderla.

## Qué hace una CDN y dónde vive la latencia

Un usuario lejos de tu servidor paga latencia de ida y vuelta por cada conexión y cada recurso. Una CDN coloca copias en **ubicaciones de borde** cercanas. Un acierto de caché ("hit") se sirve desde allí; un fallo ("miss") obliga a ir al origen. Además de las ubicaciones de borde, CloudFront tiene **cachés regionales** intermedias y, opcionalmente, **Origin Shield**, una capa central adicional que consolida las solicitudes al origen. Efecto: menos tráfico hacia tu origen y mayor tasa de aciertos. Incluso con contenido que **no se cachea** (APIs dinámicas), CloudFront ayuda: termina TLS cerca del usuario y reutiliza conexiones persistentes hacia el origen por la red troncal de AWS.

## Las piezas

| Elemento | Qué es |
|---|---|
| **Distribución** | La configuración completa, con su dominio `dxxxx.cloudfront.net` y dominios alternativos (CNAME) |
| **Origen** | De dónde se obtiene el contenido: bucket de S3, balanceador, API Gateway, un servidor HTTP cualquiera |
| **Grupo de orígenes** | Dos orígenes con conmutación automática ante ciertos códigos de error |
| **Comportamiento de caché** | Reglas por patrón de ruta (`/api/*`, `/static/*`, por defecto `*`): origen, métodos, políticas, funciones |
| **Política de caché** | Qué entra en la **clave de caché** y los TTL |
| **Política de solicitud al origen** | Qué se **envía** al origen sin formar parte de la clave |
| **Política de cabeceras de respuesta** | Cabeceras de seguridad, CORS |

Los comportamientos se evalúan **por orden de especificidad de patrón**; el comportamiento predeterminado (`*`) atrapa todo lo demás.

## La clave de caché: donde se gana o se pierde

Una respuesta cacheada se identifica por su **clave de caché**: por defecto, el nombre de host y la ruta. Todo lo que agregues a la clave (parámetros de consulta, cabeceras, cookies) **crea variantes distintas** del mismo objeto. Ejemplo del problema: tu sitio recibe `/imagen.jpg?utm_source=correo`, `/imagen.jpg?utm_source=redes`, `/imagen.jpg?utm_source=...`. Si la política incluye todos los parámetros de consulta, cada valor es una entrada distinta: **la tasa de aciertos cae y el origen recibe lo que debía absorber la caché**. Reglas prácticas:

1. **Mínima clave de caché.** Incluye solo lo que realmente cambia la respuesta.
2. **Separa lo que *envías* al origen de lo que *cacheas*:** usa una política de solicitud al origen para enviar cabeceras que necesita el origen sin multiplicar la caché.
3. **No reenvíes todas las cookies** a recursos estáticos: un `Set-Cookie` o una cookie de sesión en una imagen convierte cada usuario en una variante distinta.
4. **Normaliza**: por ejemplo, ordena y filtra parámetros con una función de borde si hace falta.
5. **Usa las políticas administradas** por AWS (`CachingOptimized`, `CachingDisabled`, `UseOriginCacheControlHeaders`) como punto de partida.

### Y lo contrario: no cachear lo personalizado

Si una ruta devuelve contenido que **depende del usuario** (un panel, `/mi-cuenta`, respuestas autenticadas) y su clave de caché no incluye la identidad, **el primer usuario "calienta" la caché y el siguiente recibe sus datos**. Es el incidente más grave que puede causar una CDN mal configurada. Protecciones:

- `Cache-Control: private` o `no-store` en el origen para respuestas personales.
- Comportamientos separados para rutas autenticadas con `CachingDisabled`.
- Incluir en la clave la cabecera o cookie que determina la identidad, solo si de verdad quieres cachear por usuario (rara vez conviene).
- **Pruebas explícitas** con dos usuarios distintos antes de lanzar.

## TTL: cuánto vive un objeto

Hay tres valores en una política de caché: **mínimo, predeterminado y máximo**. Su efecto depende de lo que diga el origen:

- Si el origen manda `Cache-Control: max-age=N` o `Expires`, CloudFront lo respeta **limitado por el mínimo y el máximo**.
- Si no manda nada, usa el **TTL predeterminado**.
- Con `no-store`/`private`, y mínimo de 0, no se cachea.

Estrategia que funciona:

- **Archivos estáticos con nombre versionado** (`app.3f9a1c.js`, `logo.v2.png`): `Cache-Control: public, max-age=31536000, immutable`. Cuando cambian, cambia el nombre; no hay que invalidar nada.
- **HTML y APIs**: TTL corto (segundos) o `no-cache` con revalidación, según el caso.
- **Errores**: CloudFront cachea respuestas 4XX/5XX por un tiempo corto (10 s por defecto, configurable). Si tu origen devolvió un 500 transitorio, el usuario lo seguirá viendo ese tiempo: ajusta el TTL mínimo de errores.

## Invalidaciones

Una **invalidación** elimina objetos de la caché antes de tiempo. Sirven, pero:

- Tienen **cuota gratuita mensual** de rutas (las primeras 1 000) y luego se cobran por ruta. Un comodín (`/*`) cuenta como **una** ruta.
- No son instantáneas: tardan del orden de minutos en propagarse.
- Si inviertes en invalidar en cada despliegue, probablemente falta **versionar los archivos**. La invalidación de `index.html` (o un TTL corto para el HTML) con recursos versionados es el patrón estándar para aplicaciones de una sola página.

## Orígenes

### S3 como origen: usa OAC

**Origin Access Control (OAC)** permite que **solo CloudFront** lea un bucket **privado** (sustituye al antiguo OAI, que no soporta todas las funciones ni todas las regiones). La política del bucket autoriza al servicio y restringe a tu distribución:

```json
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::mi-sitio/*",
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/E1ABCDEF123456"
    }
  }
}
```

- **No uses el endpoint de "hosting de sitio web" de S3** como origen si puedes evitarlo: exige que el bucket sea público.
- Si usas **SSE-KMS** en el bucket, la llave debe permitir a CloudFront descifrar.
- Si quieres que una ruta inexistente muestre tu página de error o que una SPA enrute en el cliente, usa **respuestas de error personalizadas** (por ejemplo, 403/404 → `/index.html` con 200). Cuidado: así ocultas errores reales; limita el alcance.
- Define el **objeto raíz predeterminado** (`index.html`). Solo funciona en la raíz, no en subdirectorios: para `/docs/` → `/docs/index.html` necesitas una función de borde.

### Balanceadores, APIs y otros orígenes HTTP

- **Cifra el tramo CloudFront → origen** (HTTPS) y valida el certificado.
- Decide qué **cabecera `Host`** recibe tu origen: la de la distribución o la del origen. Un `Host` equivocado produce 404 o redirecciones infinitas con muchos servidores.
- **Restringe el origen** para que acepte solo tráfico de CloudFront: la lista de prefijos administrada de CloudFront en el grupo de seguridad, y/o una **cabecera secreta personalizada** que CloudFront añade y el origen verifica. Si no, cualquiera puede saltarse la CDN y su protección.
- Ajusta los **tiempos de espera** (por defecto 30 s de respuesta, ampliables mediante cuota) y los reintentos.
- Los **métodos POST/PUT/DELETE** se reenvían al origen; no se cachean.

## Funciones en el borde

| | **CloudFront Functions** | **Lambda@Edge** |
|---|---|---|
| Lenguaje | JavaScript (runtime ligero) | Node.js, Python |
| Ejecución | En las ubicaciones de borde, **submilisegundo** | En cachés regionales |
| Límites | Muy estrictos (tiempo, memoria, sin red) | Más amplios; permite llamadas de red |
| Eventos | Solicitud/respuesta del visitante | También solicitud/respuesta de origen |
| Costo | Mucho menor | Mayor |
| Usos | Redirecciones, reescritura de URL, normalizar claves de caché, cabeceras, autorización con tokens simples | Lógica más compleja, acceso a servicios |

Ejemplo: reescribir `/docs/` a `/docs/index.html`:

```javascript
function handler(event) {
  var request = event.request;
  if (request.uri.endsWith("/")) {
    request.uri += "index.html";
  }
  return request;
}
```

Lambda@Edge se crea en **us-east-1** y se replica. Si una función no necesita más que CloudFront Functions, prefiérelas.

## Seguridad

1. **HTTPS obligatorio** (redirigir HTTP a HTTPS) con una política TLS moderna. El certificado de **ACM** para CloudFront **debe estar en us-east-1**.
2. **OAC** en S3 y **origen restringido** en balanceadores.
3. **AWS WAF** en la distribución: reglas administradas (inyección SQL, XSS, reputación de IP), limitación de tasa, bloqueo por país. Es la primera línea de defensa contra bots y abuso.
4. **Shield Standard** (DDoS capa 3/4) incluido sin costo; **Shield Advanced** para protección y soporte adicionales.
5. **URL y cookies firmadas** para contenido restringido (cursos, descargas de pago). Usa **grupos de claves** (*key groups*) en lugar de la antigua cuenta raíz.
6. **Cabeceras de seguridad** con una política de cabeceras de respuesta (HSTS, `X-Content-Type-Options`, `Content-Security-Policy`...).
7. **Restricción geográfica** si tu negocio lo requiere (con consideraciones legales).
8. **Registro de acceso** (estándar a S3 o en tiempo real a Kinesis) para investigar.

## Depurar: ¿hit o miss?

La primera herramienta es mirar las cabeceras de respuesta:

```bash
curl -sI https://www.ejemplo.com/static/app.3f9a1c.js | grep -i -E "x-cache|age|via|cache-control|x-amz-cf-pop"
```

- `X-Cache: Hit from cloudfront` / `Miss from cloudfront` / `RefreshHit` / `Error from cloudfront`.
- `Age`: segundos que lleva en caché.
- `X-Amz-Cf-Pop`: la ubicación de borde que respondió.

Si ves siempre `Miss`:

1. ¿El origen manda `Cache-Control: no-store/private` o `Set-Cookie`?
2. ¿La política tiene TTL máximo 0?
3. ¿La clave de caché incluye algo que varía en cada solicitud (parámetro, cabecera, cookie)?
4. ¿El método es GET/HEAD?
5. ¿La respuesta es demasiado grande o lleva `Vary: *`?

Para medir de forma continua, mira las métricas de la distribución: **tasa de aciertos de caché** (`CacheHitRate`), tasas de error 4xx/5xx, y bytes descargados. Las métricas adicionales (con costo) incluyen la tasa de aciertos y la latencia del origen.

## Costos

CloudFront cobra por:

- **Transferencia hacia internet**, por GB y por región, con tarifas decrecientes por volumen.
- **Solicitudes** HTTP/HTTPS, por cada 10 000.
- **Funciones** (por invocación), WAF, invalidaciones sobre la cuota, registros en tiempo real, Origin Shield, métricas adicionales.

Hay una **capa gratuita permanente** mensual (del orden de 1 TB de transferencia y 10 millones de solicitudes; verifica los valores vigentes). Además, **la transferencia desde S3 u otros orígenes de AWS hacia CloudFront no se cobra**, de modo que servir desde S3 a través de CloudFront suele ser **más barato** que servir directamente desde S3. Para controlar el gasto:

- **Sube la tasa de aciertos**: menos tráfico al origen y más barato.
- **Comprime** (gzip y Brotli) respuestas de texto.
- Elige la **clase de precio** (limitar las ubicaciones de borde usadas) si tu audiencia es regional.
- Evita **invalidaciones masivas** frecuentes.
- Considera los **planes de ahorro** si tu volumen es alto y estable.
- Vigila **WAF** (cobra por reglas y por solicitudes inspeccionadas).

## Los gotchas, al punto

- **Clave de caché demasiado amplia** (todos los parámetros, cabeceras y cookies): sin aciertos.
- **Contenido personalizado cacheado** y mostrado a otro usuario.
- **Cookies reenviadas a recursos estáticos.**
- **Dependencia de invalidaciones** en lugar de archivos versionados.
- **Bucket público** en vez de OAC; o endpoint de sitio web de S3.
- **Origen accesible directamente**, saltándose WAF y CDN.
- **Certificado de ACM en una región distinta de us-east-1.**
- **Cabecera `Host`** que el origen no reconoce.
- **Errores 5XX cacheados** unos segundos de más.
- **Sin compresión** de texto.
- **CORS** roto porque no se envía la cabecera `Origin` al origen (usa una política de solicitud adecuada y `Vary: Origin`).
- **El objeto raíz predeterminado** no funciona en subdirectorios.
- **Respuestas de error personalizadas** que convierten errores reales en 200.
- **Propagación**: un cambio de configuración de la distribución tarda unos minutos en desplegarse en todos los bordes.

## Una configuración sólida para un sitio estático

1. Bucket de S3 **privado**, cifrado, con **versionado** si importa.
2. Distribución con **OAC**, política de caché `CachingOptimized`, compresión, HTTP/2 y HTTP/3.
3. Archivos de la aplicación **con hash en el nombre** y `immutable`; `index.html` con TTL corto.
4. **Certificado de ACM** (us-east-1) y dominio en Route 53 con registro alias.
5. **Función de CloudFront** para reescrituras y cabeceras de seguridad.
6. **WAF** con reglas administradas básicas y limitación de tasa.
7. Alarmas: tasa de error 5xx, tasa de aciertos, y presupuesto.
8. Todo como **infraestructura como código**.

## Para finalizar

CloudFront rinde mucho cuando entiendes que es, sobre todo, una caché con reglas. Mide la tasa de aciertos, mantén mínima la clave de caché, versiona los recursos estáticos, protege el origen y nunca cachees lo que depende de quién pregunta. Y si algún día tu sitio sigue lento tras ponerle CDN, no empieces por cambiar de proveedor: empieza por `curl -I` y mira `X-Cache`.
