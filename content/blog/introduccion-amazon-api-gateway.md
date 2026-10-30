---
title: "Introducción a Amazon API Gateway: la puerta de entrada de tus APIs"
date: 2026-10-30
description: "Tipos de API (REST, HTTP y WebSocket), etapas, autorización, limitación de tasa e integración con Lambda: cómo exponer servicios con seguridad."
tags: [AWS, API Gateway, Serverless]
---

Una API pública necesita resolver varias cosas antes de ejecutar tu lógica: ¿quién llama?, ¿tiene permiso?, ¿está abusando?, ¿la petición es válida?, ¿cómo registramos lo que pasa? Hacerlo en cada servicio es repetitivo. **Amazon API Gateway** concentra ese trabajo en una puerta de entrada administrada, sin servidores.

## Qué hace

- **Recibe** solicitudes HTTP(S) o conexiones WebSocket.
- **Autentica y autoriza** a quien llama.
- **Valida** parámetros y cuerpo de la petición.
- **Limita** el ritmo de llamadas (throttling).
- **Enruta** hacia el backend: Lambda, servicios HTTP, otros servicios de AWS.
- **Transforma** solicitudes y respuestas (según el tipo).
- **Registra y mide** el tráfico.
- **Escala** automáticamente y se cobra por uso.

## Tres tipos de API

| Tipo | Rasgos | Cuándo |
|---|---|---|
| **HTTP API** | Más simple, más barata y con menor latencia; autorizadores JWT, integración con Lambda y HTTP | La opción por defecto para la mayoría de APIs nuevas |
| **REST API** | Más funciones: claves de API y planes de uso, validación de solicitudes, transformación con plantillas, caché, WAF, endpoints privados | Cuando necesitas esas capacidades adicionales |
| **WebSocket API** | Comunicación bidireccional persistente | Chats, notificaciones en tiempo real, paneles en vivo |

Compara las funciones actuales de cada tipo en la documentación antes de elegir, porque evolucionan.

## Conceptos clave

- **Recursos y métodos:** rutas y verbos (`GET /pedidos/{id}`).
- **Integración:** a dónde se envía la petición: una función Lambda, una URL HTTP, otro servicio de AWS.
- **Etapa (stage):** una versión desplegada de la API (`dev`, `prod`), con su propia configuración y URL.
- **Dominio personalizado:** usar `api.miempresa.com` con un certificado de ACM y un registro en Route 53.

## Un ejemplo típico

```text
Cliente ──HTTPS──► API Gateway ──► Lambda ──► DynamoDB
                    │
                    ├─ valida el token (autorizador)
                    ├─ aplica límite de tasa
                    └─ registra la solicitud
```

Una función Lambda recibe un evento con la información de la petición y devuelve un objeto con código de estado, cabeceras y cuerpo.

## Autenticación y autorización

Varias opciones, de menos a más flexibilidad:

- **IAM:** para llamadas entre servicios o clientes con credenciales de AWS (firma SigV4).
- **Cognito (autorizador de usuarios):** valida tokens de un grupo de usuarios de Amazon Cognito.
- **Autorizador JWT:** valida tokens JWT de cualquier proveedor compatible con OpenID Connect (HTTP API).
- **Autorizador Lambda:** tu propia función decide si permite la llamada (útil con esquemas personalizados).
- **Claves de API:** identifican a quien llama y permiten planes de uso y cuotas (REST API). **No son un mecanismo de autenticación seguro por sí mismas:** sirven para medir y limitar, no para proteger datos sensibles.

## Control de tráfico

- **Throttling:** límites de solicitudes por segundo y de ráfaga, por cuenta, por etapa o por método, para proteger tu backend.
- **Planes de uso y cuotas** (REST): límites por cliente.
- **AWS WAF** (en REST): reglas contra ataques web comunes.
- **CORS:** configura qué orígenes pueden llamar a tu API desde un navegador.
- **Caché** (REST): guarda respuestas para reducir la carga y la latencia, con costo adicional.

## Límites que conviene conocer

- **Tiempo máximo de integración:** históricamente alrededor de 29 segundos para REST y 30 para HTTP; consulta los límites vigentes, porque algunos son ajustables. Para procesos largos, responde rápido y trabaja de forma asíncrona (cola, Step Functions, notificación posterior).
- **Tamaño de carga útil:** hay un máximo por solicitud y respuesta (del orden de 10 MB); para archivos grandes usa URLs prefirmadas de S3.
- **Cuotas por cuenta y región** para solicitudes por segundo y número de recursos.

## Observabilidad

- **Registros de acceso** y de ejecución en CloudWatch.
- **Métricas:** número de solicitudes, latencia, errores 4XX y 5XX.
- **Trazas con X-Ray** para seguir una petición hasta el backend.
- Alarmas sobre tasa de errores y latencia.

## Costos

- **HTTP API:** precio por millón de solicitudes, significativamente menor que REST.
- **REST API:** precio mayor por millón; la caché y otras funciones tienen cargos adicionales.
- **WebSocket:** por mensajes y minutos de conexión.
- Más la transferencia de datos y los servicios que invoca.

Hay una capa gratuita para cuentas nuevas. Consulta la página de precios vigente.

## Buenas prácticas

1. **Elige HTTP API** salvo que necesites funciones de REST.
2. **Autentica siempre** las rutas que no sean públicas.
3. **Valida las entradas,** en la puerta y en el backend.
4. **Define límites de tasa** para proteger al backend.
5. **Configura CORS** solo para los orígenes necesarios.
6. **Usa dominio personalizado** y versiona tus APIs (por ruta o por etapa).
7. **Define la API como código** con OpenAPI, SAM, CDK o Terraform.
8. **Habilita registros y alarmas.**
9. **Devuelve errores consistentes** con códigos de estado HTTP correctos.
10. **Documenta con OpenAPI** para generar documentación y clientes.

## Errores frecuentes

- **Dejar rutas abiertas** "temporalmente".
- **Usar claves de API como única seguridad.**
- **Esperar respuestas largas** síncronas y toparse con el límite de tiempo.
- **CORS abierto a todos** (`*`) con credenciales.
- **Sin límites de tasa**, con un backend vulnerable a abuso y a facturas sorpresa.
- **Cambiar la API en producción sin versionar,** rompiendo a los clientes.
- **Elegir REST API por costumbre** cuando una HTTP API bastaba.

## Para finalizar

API Gateway convierte tu lógica en una API segura, escalable y observable sin que administres servidores. Con autenticación, validación, límites de tasa y una definición como código, tendrás una base sólida.

Junto con Lambda, DynamoDB, SQS y CloudWatch, cierra el círculo de una arquitectura serverless completa, y es un buen punto para terminar esta serie introductoria a los servicios principales de AWS.
