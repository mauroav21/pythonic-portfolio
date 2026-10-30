---
title: "Amazon API Gateway a fondo: elegir tipo, autorizar, limitar y diagnosticar errores"
date: 2026-08-25
description: "HTTP API, REST API y WebSocket: diferencias reales, integraciones con Lambda y servicios de AWS, autorizadores, throttling, CORS, límites de tiempo y tamaño, códigos de error frecuentes, costos y una plantilla de ejemplo."
tags: [AWS, API Gateway, Serverless]
---

API Gateway es la puerta de entrada de muchísimas arquitecturas serverless, y también la fuente de una cantidad desproporcionada de mensajes de error que no explican nada: `Missing Authentication Token`, `Internal server error`, `502`, `504`, un CORS que "funciona en Postman y no en el navegador". Casi todos tienen causas concretas y repetibles.

Este artículo cubre cómo decidir qué tipo usar, cómo se protege y limita una API, y cómo leer sus errores.

## Qué hace (y qué no)

API Gateway es un servicio administrado que recibe solicitudes, aplica controles y las **enruta a un backend**. En el camino puede:

- **Autenticar y autorizar** (IAM, Cognito, JWT, funciones Lambda).
- **Validar** la solicitud (REST).
- **Limitar tasa** (throttling) y aplicar cuotas.
- **Transformar** solicitudes y respuestas (REST).
- **Cachear** respuestas (REST).
- **Registrar y medir** el tráfico.
- **Terminar TLS**, con dominios propios y TLS mutuo.

No es un servidor de aplicaciones, no ejecuta lógica de negocio, y tiene límites de tiempo y tamaño que condicionan el diseño.

## Tres productos con el mismo nombre

| | **HTTP API** | **REST API** | **WebSocket API** |
|---|---|---|---|
| Precio | Bajo (más barata) | Más alto | Por mensajes y minutos de conexión |
| Latencia | Menor | Algo mayor | — |
| Autorizadores | IAM, **JWT** nativo, Lambda | IAM, **Cognito**, Lambda | IAM, Lambda |
| Validación de solicitudes | No | **Sí** (modelos JSON Schema) | — |
| Plantillas de mapeo (VTL) | No | **Sí** | Sí |
| Planes de uso y claves de API | No | **Sí** | — |
| Caché | No | **Sí** | — |
| AWS WAF | No (se puede poner CloudFront delante) | **Sí** | — |
| Endpoints privados (solo VPC) | Con ciertas limitaciones | **Sí** | — |
| Despliegues canary | No | **Sí** | — |
| Formato de carga útil Lambda | 1.0 o **2.0** | 1.0 | — |

La recomendación habitual: **HTTP API** para APIs nuevas de proxy a Lambda o servicios HTTP, y **REST API** cuando necesitas específicamente alguna de sus funciones (WAF directo, planes de uso para clientes externos, validación, caché, mapeo, endpoints privados). WebSocket para aplicaciones con comunicación bidireccional persistente (chats, paneles en vivo). Las funciones evolucionan; verifica la matriz vigente antes de decidir.

Alternativas que a veces bastan: **URL de función de Lambda** (para un endpoint sencillo sin controles) y **ALB** con Lambda o contenedores como destino (cuando el resto de tu aplicación ya está detrás de un ALB).

## Integraciones

- **Proxy a Lambda** (la más común): API Gateway entrega el evento HTTP completo a la función y devuelve lo que la función responda. La función decide el código de estado, las cabeceras y el cuerpo.
- **Proxy HTTP:** reenvía a otro servidor HTTP (un ALB, un servicio externo).
- **Integraciones directas con servicios de AWS** (sin Lambda): por ejemplo, `POST /pedidos` que escribe en una cola SQS, en DynamoDB o inicia una máquina de Step Functions. Menos piezas, menos latencia y menor costo, a cambio de configuración de plantillas/parámetros (más natural en REST).
- **Mock:** respuesta fija, útil para pruebas.

### Un handler correcto (formato 2.0 de HTTP API)

```python
import json

def handler(event, context):
    metodo = event["requestContext"]["http"]["method"]
    ruta = event["rawPath"]
    cuerpo = json.loads(event["body"]) if event.get("body") else {}

    if metodo == "POST" and ruta == "/pedidos":
        pedido = crear_pedido(cuerpo)
        return {
            "statusCode": 201,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(pedido),
        }
    return {"statusCode": 404, "body": json.dumps({"mensaje": "No encontrado"})}
```

Lo que **debe** devolver: un objeto con `statusCode` y `body` (cadena). Si devuelves otra forma —por ejemplo, un diccionario sin `statusCode` o un `body` que no es cadena—, API Gateway responde **`502 Bad Gateway`** ("Malformed Lambda proxy response").

## Autorización: opciones y cuándo cada una

| Mecanismo | Cómo funciona | Cuándo |
|---|---|---|
| **IAM (SigV4)** | El cliente firma con credenciales de AWS | Servicio a servicio, clientes internos |
| **Cognito (REST) / JWT (HTTP)** | Valida un token (de Cognito o de cualquier proveedor OIDC) | Aplicaciones de usuario final |
| **Autorizador Lambda** | Tu función decide y devuelve una política | Esquemas propios (tokens opacos, claves, lógica por inquilino) |
| **Claves de API** | Identifican al consumidor para cuotas | Medición y límites; **no son autenticación** |

Detalles que importan:

- **Las claves de API no protegen nada por sí solas:** viajan en una cabecera y se filtran. Sirven para planes de uso, no para seguridad.
- **Los autorizadores Lambda cachean** su resultado (TTL configurable, por defecto 300 s) según la identidad que extraigas. Un TTL largo reduce llamadas y latencia, pero retrasa la revocación. Si la política devuelta cubre solo la ruta pedida y el caché se comparte entre rutas, puedes ver `403` intermitentes en rutas distintas: devuelve una política **que cubra todas las rutas** que ese token puede usar.
- **Valida siempre en el backend** lo que depende del usuario: el gateway autentica, tu código autoriza recursos concretos (que el pedido pertenezca a quien pregunta).
- Para **autorización por ámbito** con JWT, exige `scopes` por ruta en HTTP API.

## Control de tráfico

- **Throttling a nivel de cuenta y región:** por defecto del orden de **10 000 solicitudes por segundo** con una ráfaga de **5 000** (límites ajustables). Todas tus APIs de la región los comparten, así que una API ruidosa puede afectar a otra.
- **Throttling por etapa y por ruta/método:** configúralo para proteger backends frágiles.
- **Planes de uso (REST):** tasa, ráfaga y cuota diaria/mensual por clave de API, para clientes externos.
- **Respuesta al exceso:** `429 Too Many Requests`. Los clientes deben reintentar con **espera exponencial y jitter**.
- **Protege lo de atrás:** el throttling limita *entradas*; la concurrencia reservada de Lambda y los límites de la base de datos limitan *efectos*.

## CORS: el error que "solo ocurre en el navegador"

Los navegadores envían una solicitud previa `OPTIONS` (preflight) a otros orígenes. Para que funcione:

1. La API debe **responder al `OPTIONS`** con `Access-Control-Allow-Origin`, `-Methods` y `-Headers`.
2. **Las respuestas reales** también deben incluir `Access-Control-Allow-Origin`.
3. Con credenciales (cookies), el origen **no puede ser `*`**.

En HTTP API, activa la **configuración de CORS** de la API y el gateway lo maneja. En REST con proxy de Lambda, tu función debe devolver las cabeceras y debes tener un método `OPTIONS` (o habilitar CORS en la consola, que lo crea). Un error clásico: CORS bien configurado en la ruta, pero la respuesta de **error** (4XX/5XX del gateway) no lleva las cabeceras, así que el navegador muestra "error de CORS" cuando el problema real es otro.

## Límites que condicionan el diseño

| Límite | Valor aproximado | Qué implica |
|---|---|---|
| **Tiempo de integración** | ~29 s (REST; con posibilidad de aumentarlo en ciertos tipos de API según cuotas) y ~30 s (HTTP) | Nada de procesos largos de forma síncrona |
| **Tamaño de carga útil** | 10 MB por solicitud/respuesta en API Gateway; **6 MB** para la carga síncrona de Lambda | Archivos grandes: URL prefirmada de S3 |
| **Rutas y recursos por API, etapas, claves** | Cuotas por cuenta | Revisa en Service Quotas |

Verifica los valores vigentes: AWS ha ido ajustando algunos.

**Para operaciones largas, no esperes:**

```text
POST /informes  →  202 Accepted + { "id": "r-123", "estado": "EN_COLA" }
                   └─ encola o inicia Step Functions
GET  /informes/r-123  →  { "estado": "COMPLETADO", "url": "<URL prefirmada>" }
```

## Etapas, despliegues y dominios

- **Etapa (stage):** una versión desplegada (`dev`, `prod`) con su configuración (variables, throttling, logs). La URL base incluye el nombre de etapa (`/prod`) salvo con dominio propio.
- **REST requiere un "despliegue"** explícito para que los cambios aparezcan en una etapa; los cambios de la consola o de IaC sin redeploy no se ven. HTTP API puede desplegar automáticamente.
- **Dominio personalizado:** certificado de ACM (en la **región** de la API para endpoints regionales; en **us-east-1** para los optimizados para borde de REST), registro alias en Route 53 y **asignación de ruta base** (base path mapping) para colgar varias APIs bajo un mismo dominio.
- **Tipos de endpoint (REST):** *optimizado para borde* (usa CloudFront administrado), *regional* (recomendado si pones tu propia CloudFront o tus clientes están en la región) y *privado* (solo desde tu VPC).
- **TLS mutuo** disponible para dominios personalizados.

## Observabilidad

- **Logs de acceso:** qué solicitud, quién, estado, latencia, `requestId`. Define el formato (JSON) incluyendo `$context.requestId`, `$context.integrationLatency`, `$context.status`, `$context.error.message`.
- **Logs de ejecución (REST):** detalle del procesamiento; verbosos, úsalos para depurar y no de forma permanente a nivel de datos completos (pueden exponer datos sensibles y costar mucho).
- **Métricas:** `Count`, `4XXError`/`5XXError` (en REST también `Latency` e `IntegrationLatency`). La diferencia entre `Latency` e `IntegrationLatency` indica cuánto aporta el gateway frente al backend.
- **Trazas:** X-Ray (REST) y propagación de cabeceras.
- Alarma sobre **tasa de 5XX** y **latencia p95/p99**.

## Diagnosticar errores: qué significa cada uno

| Síntoma | Causa más probable |
|---|---|
| **`403 Missing Authentication Token`** | **La ruta o el método no existen** (este mensaje engaña: suele ser una URL mal escrita, una etapa omitida o falta de redeploy), o faltó la firma/token en un recurso con IAM |
| **`403 Forbidden` / `User is not authorized`** | El autorizador denegó (política que no cubre la ruta, caché del autorizador), clave de API inválida, WAF o política de recursos |
| **`401 Unauthorized`** | Token ausente o inválido en un autorizador JWT/Cognito |
| **`429 Too Many Requests`** | Throttling por cuenta, etapa, ruta o cuota del plan de uso |
| **`500 Internal server error`** | Error en el backend o en un mapeo/plantilla; revisa logs de la función o de ejecución |
| **`502 Bad Gateway`** | Respuesta del backend con formato inválido (Lambda proxy mal formada), o la función falló/lanzó una excepción, o no se pudo invocar (permisos) |
| **`503 Service Unavailable`** | El backend no está disponible (Lambda con *throttling* por concurrencia, por ejemplo) |
| **`504 Gateway Timeout`** | La integración superó el tiempo máximo del gateway |
| **`413 Request Entity Too Large`** | Carga útil mayor al límite |
| **Error de CORS en el navegador** | Falta preflight o cabeceras en la respuesta (incluidas las de error) |

Y un detalle de **permisos**: para que API Gateway pueda invocar tu función Lambda, la función necesita una **política basada en recursos** que lo permita (`lambda:InvokeFunction` para `apigateway.amazonaws.com`, con `SourceArn`). Si falla, verás `500` o `502` sin una causa visible en tu código.

## Costos

- **HTTP API:** precio por millón de solicitudes, varias veces menor que REST (con tramos por volumen).
- **REST API:** más caro por millón; la **caché** se cobra por hora según su tamaño.
- **WebSocket:** por millón de mensajes y por minuto de conexión.
- Más transferencia de datos, **WAF**, logs y los servicios que invoca.

Hay capa gratuita para cuentas nuevas durante el primer año. Revisa los precios vigentes. A volúmenes muy altos, compara con un ALB o con CloudFront delante de una función; y no olvides que **los logs de ejecución con datos completos** pueden costar más que la propia API.

## Una plantilla de ejemplo (SAM): HTTP API con JWT y Lambda

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Resources:
  Api:
    Type: AWS::Serverless::HttpApi
    Properties:
      StageName: prod
      CorsConfiguration:
        AllowOrigins: ["https://app.ejemplo.com"]
        AllowMethods: ["GET", "POST", "OPTIONS"]
        AllowHeaders: ["authorization", "content-type"]
      Auth:
        DefaultAuthorizer: JwtAuth
        Authorizers:
          JwtAuth:
            JwtConfiguration:
              issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX"
              audience: ["mi-client-id"]
            IdentitySource: "$request.header.Authorization"
      DefaultRouteSettings:
        ThrottlingBurstLimit: 100
        ThrottlingRateLimit: 50
      AccessLogSettings:
        DestinationArn: !GetAtt AccessLogs.Arn
        Format: '{"requestId":"$context.requestId","ruta":"$context.routeKey","estado":"$context.status","latenciaIntegracion":"$context.integrationLatency","error":"$context.error.message"}'

  PedidosFn:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.12
      Handler: app.handler
      CodeUri: src/
      Timeout: 10
      Events:
        Crear:
          Type: HttpApi
          Properties: { ApiId: !Ref Api, Method: POST, Path: /pedidos }

  AccessLogs:
    Type: AWS::Logs::LogGroup
    Properties:
      RetentionInDays: 30
```

Incluye lo que importa: autorización por defecto, CORS acotado, throttling, logs de acceso en JSON con retención y un timeout de función mucho menor que el del gateway.

## Los gotchas, al punto

- **`Missing Authentication Token`** = revisa primero la **URL, la etapa y el método**.
- **Respuesta de Lambda mal formada** → 502.
- **Procesos largos en la ruta síncrona** → 504; usa patrón asíncrono.
- **CORS** configurado solo para éxitos, no para errores.
- **Claves de API tomadas como seguridad.**
- **Autorizador Lambda con caché** y política que no cubre otras rutas.
- **REST sin redeploy** tras un cambio.
- **Falta de permiso de invocación** de API Gateway sobre la función.
- **Logs de ejecución a nivel `INFO` con datos completos** en producción (costo y datos sensibles).
- **Sin límites de tasa**, un cliente puede agotar la concurrencia del backend.
- **Una cuenta, un límite compartido:** un consumidor ruidoso afecta a otras APIs de la región.
- **Carga útil de más de 6 MB** hacia Lambda.
- **Olvidar la versión del formato** de carga (1.0 vs 2.0) al migrar entre tipos de API.

## Cuándo no usar API Gateway

- Necesitas **latencia mínima y mucho tráfico** con lógica simple: un ALB, o CloudFront + Lambda, pueden ser más baratos.
- **Cargas útiles grandes o transmisión continua** (streaming): considera ALB, URL de función con streaming o conexiones directas a S3.
- Un **único endpoint interno sencillo**: una URL de función de Lambda puede bastar.

## Para finalizar

API Gateway hace bien el trabajo repetitivo de una API —autenticar, limitar, validar, medir— con muy poca operación. Su coste es entender sus tipos, sus límites de tiempo y tamaño y sus mensajes de error, que son crípticos pero previsibles.

Elige HTTP API por defecto, autoriza en el borde y en el backend, limita desde el primer día y diseña lo largo como asíncrono. Con eso, la mayoría de los errores que verás tendrán una causa que ya conoces.
