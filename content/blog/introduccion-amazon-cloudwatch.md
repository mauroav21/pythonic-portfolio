---
title: "Amazon CloudWatch a fondo: métricas, logs y alarmas que sirven (y no te arruinan)"
date: 2026-10-14
description: "Métricas y resolución, logs estructurados y Logs Insights, Embedded Metric Format, diseño de alarmas (datos faltantes, compuestas, burn rate), paneles, observabilidad entre cuentas y control de costos."
tags: [AWS, CloudWatch, Observabilidad]
---

Hay dos formas de fallar con CloudWatch. La primera: no mirar nada, y enterarte de los incidentes por los usuarios. La segunda, más sutil: registrarlo **todo**, crear cien alarmas y pagar una factura de logs mayor que la del cómputo, mientras el equipo silencia las alertas porque suenan cada noche. Observabilidad útil es un equilibrio: pocas señales buenas, estructuradas, con dueño y con costo conocido. Veamos cómo construirla.

## Tres señales y una pregunta

CloudWatch reúne tres tipos de datos:

| Señal | Qué es | Para qué sirve |
|---|---|---|
| **Métricas** | Series numéricas en el tiempo | Saber *si* hay un problema y *cuánto* |
| **Logs** | Eventos de texto con detalle | Saber *qué* pasó |
| **Trazas** (X-Ray / Application Signals) | El camino de una petición entre servicios | Saber *dónde* se pierde el tiempo |

Y una pregunta que organiza el diseño: **¿qué experimentaría un usuario si esto fallara?** Las alarmas deben nacer de ahí, no de qué métricas casualmente existen.

## Métricas

### Cómo están organizadas

- **Espacio de nombres (namespace):** `AWS/Lambda`, `AWS/ApplicationELB`, o el tuyo (`MiApp/Pedidos`).
- **Nombre de la métrica:** `Duration`, `Errors`.
- **Dimensiones:** pares clave-valor que identifican la serie (`FunctionName=procesar-pedido`). **Cada combinación única de nombre + dimensiones es una métrica distinta** (y se cobra como tal).
- **Estadísticas:** `Average`, `Sum`, `Minimum`, `Maximum`, `SampleCount`, y **percentiles** (`p50`, `p95`, `p99`).

### Resolución y retención

Las métricas estándar de AWS suelen publicarse cada **1 o 5 minutos** (depende del servicio; por ejemplo, EC2 envía cada 5 minutos por defecto y cada 1 con monitoreo detallado). Las métricas personalizadas pueden ser de **alta resolución (1 segundo)**. CloudWatch conserva y agrega los datos, con menor resolución a medida que envejecen:

| Resolución original | Retención aproximada |
|---|---|
| < 60 s | 3 horas |
| 60 s | 15 días |
| 5 min | 63 días |
| 1 hora | 455 días (15 meses) |

Consecuencia: **para análisis histórico a largo plazo y de detalle, exporta** (a S3, o a una herramienta de series de tiempo); no esperes poder ver el pico exacto de hace 6 meses.

### Lo que no se publica solo

- **Memoria y espacio en disco de EC2:** requieren el **agente de CloudWatch**.
- **Métricas dentro de contenedores y procesos:** Container Insights, o tu propia instrumentación.
- **Métricas de negocio** (pedidos por minuto, pagos rechazados): las publicas tú.

### Métrica matemática

Con **metric math** combinas series: tasa de error = `errores / invocaciones * 100`; suma de varios balanceadores; restas; percentiles ajustados. Es lo que convierte las métricas en **indicadores de servicio** (porcentajes, tasas) y no solo en contadores.

## Logs

### Estructura

- **Grupo de logs (log group):** un contenedor con configuración común (retención, cifrado, permisos) — normalmente uno por servicio o función.
- **Flujo de logs (log stream):** una secuencia de eventos de una fuente concreta (una instancia, un contenedor).
- **Evento:** una marca de tiempo y un mensaje.

Lambda, API Gateway, ECS (con el driver `awslogs`), RDS y muchos servicios envían aquí por su cuenta. Para instancias EC2 o servidores propios, usa el agente.

### Dos reglas de oro

1. **Define la retención.** Por defecto, **los logs nunca expiran** y se cobra el almacenamiento para siempre. Fija 7, 30, 90 días según el caso; archiva a S3 solo si necesitas conservar más.
2. **Escribe logs estructurados (JSON).**

```python
import json, logging, time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def log(evento, **campos):
    logger.info(json.dumps({"evento": evento, "ts": time.time(), **campos}))

log("pedido.procesado", pedido_id="A001", total=1250.0, duracion_ms=84, request_id="abc-123")
```

Con JSON, CloudWatch **descubre los campos automáticamente** y puedes filtrar y agregar por `pedido_id` o `duracion_ms` sin expresiones regulares. Incluye siempre un **identificador de correlación** (el `request_id`) para seguir una operación entre servicios. **No registres** contraseñas, tokens ni datos personales en claro. CloudWatch Logs ofrece **políticas de protección de datos** que enmascaran patrones sensibles, pero lo mejor es no escribirlos.

### Clases de log

Existen la clase **Standard** (todas las funciones) y la **Infrequent Access** (ingesta más barata, con menos funciones —por ejemplo, sin suscripciones en tiempo real ni alarmas por filtros de métricas—). Sirve para logs que casi nunca se consultan pero que debes conservar.

### Logs Insights

Un lenguaje de consulta para analizar logs:

```text
# Los 10 endpoints más lentos en la última hora (p95)
fields @timestamp, ruta, duracion_ms
| filter ispresent(duracion_ms)
| stats pct(duracion_ms, 95) as p95, count(*) as n by ruta
| sort p95 desc
| limit 10
```

```text
# Errores por tipo cada 5 minutos
filter nivel = "ERROR"
| stats count(*) by bin(5m), tipo_error
```

Se cobra **por GB escaneado**: acota el rango de tiempo y los grupos de logs, y filtra lo antes posible.

### De logs a métricas

- **Filtros de métricas (metric filters):** convierten patrones de log en una métrica (`ERROR` → `ErroresAplicacion`).
- **Embedded Metric Format (EMF):** emites un JSON con un bloque especial y CloudWatch **extrae la métrica automáticamente** del log. Una sola escritura da el log detallado y la métrica agregada, y evita llamar a la API de métricas desde cada petición.

```json
{
  "_aws": {
    "Timestamp": 1761800000000,
    "CloudWatchMetrics": [{
      "Namespace": "MiApp/Pedidos",
      "Dimensions": [["Servicio"]],
      "Metrics": [{ "Name": "PedidosProcesados", "Unit": "Count" }]
    }]
  },
  "Servicio": "checkout",
  "PedidosProcesados": 1,
  "pedido_id": "A001"
}
```

(Nota: `pedido_id` es una propiedad del log, **no** una dimensión; no la conviertas en dimensión.)

## Alarmas: donde la mayoría se equivoca

Una alarma evalúa una métrica (o una expresión) durante un periodo y entra en `OK`, `ALARM` o `INSUFFICIENT_DATA`.

### Los parámetros que importan

| Parámetro | Qué controla |
|---|---|
| **Período** | Ancho de cada punto de datos evaluado (60 s, 300 s...) |
| **Períodos de evaluación / puntos de datos para alarmar** | "M de N": alarma si M de los últimos N puntos incumplen. Reduce el ruido de picos aislados |
| **Umbral y operador** | Cuándo incumple |
| **Tratamiento de datos faltantes** | Qué hacer cuando no llegan datos |

### Datos faltantes: la trampa más frecuente

Si una función Lambda no recibe invocaciones, **no publica la métrica `Errors`** (no hay datos, no ceros). Una alarma de "errores > 0" con tratamiento predeterminado entra en `INSUFFICIENT_DATA` y queda confusa. Define el comportamiento:

- `notBreaching`: tratar faltantes como "bien" (adecuado para errores).
- `breaching`: tratarlos como incumplimiento (adecuado para **latidos**: si dejo de recibir datos, algo murió).
- `ignore` / `missing`: mantener el estado.

Elige a propósito en cada alarma.

### Alarmas compuestas

Una **alarma compuesta** combina otras con `AND`/`OR`/`NOT`. Úsalas para reducir ruido: avisa solo si "la tasa de error es alta **Y** la latencia es alta", o suprime la alarma de síntoma cuando ya está activa la de causa (por ejemplo, un despliegue en curso).

### Detección de anomalías

Alarmas basadas en una banda aprendida del comportamiento normal (con estacionalidad diaria y semanal), útiles cuando "normal" cambia con la hora y el día y un umbral fijo da falsos positivos.

### Qué alarmar (y qué no)

Prioriza **síntomas que sienten los usuarios** y que requieren una acción:

| Categoría | Ejemplos |
|---|---|
| **Disponibilidad** | Tasa de errores 5XX del balanceador/API, fallos de verificación de salud |
| **Latencia** | p95/p99 por encima del objetivo |
| **Saturación** | Disco casi lleno, conexiones de BD cerca del límite, *throttles*, profundidad/antigüedad de colas |
| **Trabajo atascado** | Mensajes en una DLQ, antigüedad del mensaje más viejo, `IteratorAge` en streams |
| **Presupuesto** | Facturación estimada, con AWS Budgets |

Lo que **no** debería despertar a nadie: CPU al 80 % durante 2 minutos si el servicio sigue sano. Úsalo como panel, no como alerta de pager. **Cada alarma de pager debería responder tres cosas:** ¿qué ve el usuario?, ¿qué hago ahora?, ¿quién es el responsable? Si no, es ruido.

### Alarmas basadas en objetivos de nivel de servicio (SLO)

Un esquema más maduro es alarmar por **consumo del presupuesto de errores** (*burn rate*): si a este ritmo agotarás el presupuesto de errores del mes en unas horas, avisa. Application Signals de CloudWatch ofrece SLOs con este enfoque. Reduce las alertas por picos breves y se centra en lo que amenaza tu compromiso.

### Qué hace una alarma

- **SNS:** notificar a un tema (correo, chat, sistemas de guardia).
- **Auto Scaling:** escalar.
- **EC2:** reiniciar, recuperar o detener una instancia.
- **Systems Manager:** crear un OpsItem o un incidente (Incident Manager).
- **EventBridge:** los cambios de estado de alarmas son eventos que puedes enrutar.

Define también la acción de **OK**, para cerrar el ciclo.

## Paneles (dashboards)

Un buen panel responde "¿está sano el servicio?" en segundos. Una organización útil:

1. **Arriba, las señales de usuario:** tráfico, tasa de errores, latencia (p50/p95/p99).
2. **En medio, saturación:** CPU, memoria, conexiones, colas.
3. **Abajo, dependencias:** base de datos, APIs externas, colas.

Con **widgets de texto** documenta qué significa cada gráfica y enlaza a la guía de operación (*runbook*). Los paneles pueden abarcar varias cuentas y regiones.

## Observabilidad entre cuentas

En organizaciones con muchas cuentas, **CloudWatch Observability Access Manager** permite designar una **cuenta de monitoreo** que ve métricas, logs y trazas de las cuentas de origen sin copiar datos. Es la base para un panel único y una guardia que no salte entre consolas.

## Otras piezas útiles

- **Synthetics (canarios):** scripts que prueban tu aplicación desde fuera cada minuto (un login, un flujo de compra) y alarman si falla. Detectan problemas que las métricas internas no ven (certificado vencido, DNS roto).
- **RUM:** monitoreo de usuarios reales en el navegador.
- **Contributor Insights:** descubre quién genera más tráfico/errores (IP, usuario, ruta).
- **Evidently / alarmas sobre Logs, Lambda Insights, Container Insights**: métricas y detalles por tipo de carga.
- **X-Ray / OpenTelemetry (ADOT):** trazas distribuidas.

## Costos: de dónde sale la factura

| Concepto | Qué lo dispara |
|---|---|
| **Ingesta de logs** | Volumen en GB de lo que escribes; suele ser **el mayor costo** |
| **Almacenamiento de logs** | GB retenidos × tiempo (sin retención, crece para siempre) |
| **Logs Insights** | GB escaneados por consulta |
| **Métricas personalizadas** | Por métrica única al mes (nombre + dimensiones) |
| **Alarmas** | Por alarma al mes (más las de alta resolución y las compuestas) |
| **Paneles** | Por panel al mes sobre la cuota gratuita |
| **Synthetics, RUM, Application Signals** | Por ejecución o por evento |
| **Solicitudes a la API** (`GetMetricData`, etc.) | Por solicitudes de metrics, a menudo desde herramientas externas |

Consulta las tarifas vigentes. Cómo no pasarte:

1. **Fija la retención** de todos los grupos desde el principio.
2. **Controla el nivel de log:** `INFO` en producción, `DEBUG` solo por tiempo limitado. Una línea de debug por petición a gran volumen puede costar más que el cómputo.
3. **No registres cuerpos completos** de peticiones y respuestas.
4. **Cuida la cardinalidad de dimensiones:** un `UserId` o `RequestId` como dimensión crea millones de métricas. Esos valores van en el log, no en una dimensión.
5. **Usa la clase Infrequent Access** para logs de auditoría casi nunca consultados.
6. **Filtra antes de enviar** (el agente puede filtrar; Fluent Bit en contenedores también).
7. **Exporta a S3** lo que debes archivar, a un costo de almacenamiento mucho menor.
8. **Revisa periódicamente** qué grupos de logs ingieren más (`IncomingBytes`) y qué métricas y alarmas ya nadie mira.

## Los gotchas, al punto

- **Logs sin retención:** crecen y se cobran por siempre.
- **Alarmas con datos faltantes mal tratados** (siempre en `INSUFFICIENT_DATA` o que nunca saltan).
- **Dimensiones de alta cardinalidad** que disparan el costo de métricas.
- **Memoria y disco de EC2** sin agente: no tienes esa métrica.
- **Alarmas de CPU** que despiertan a la guardia sin impacto en usuarios.
- **Logs en texto libre** imposibles de consultar bien.
- **Permisos de logs** olvidados (el rol de la función necesita escribir en CloudWatch Logs).
- **Resolución de las métricas:** una alarma con período de 5 minutos tarda al menos eso en reaccionar; para detección rápida usa métricas de 1 minuto o alta resolución.
- **Consultas de Insights** sin acotar el tiempo ni los grupos.
- **Confiar en que alguien mira el panel:** si nada alarma, nadie lo mira.
- **Alarmas sin dueño** ni guía de acción.
- **Región incorrecta:** las métricas y los logs son regionales; en consola, revisar la región equivocada simula que "no hay datos".

## Un mínimo viable por servicio

1. **Logs en JSON**, con ID de correlación y retención definida.
2. **Cuatro señales de oro:** tráfico, errores, latencia (p95/p99) y saturación, en un panel.
3. **Tres alarmas de pager:** disponibilidad (errores), latencia, y trabajo atascado (DLQ/antigüedad de cola).
4. **Un canario** que pruebe el flujo principal desde fuera.
5. **Trazas** activadas en el camino crítico.
6. **Presupuesto** con alerta.
7. **Todo como código** (CloudFormation, CDK o Terraform): paneles y alarmas versionados.
8. **Revisión después de cada incidente:** ¿lo detectamos con una alarma? Si no, créala.

## Para finalizar

CloudWatch no te da observabilidad: te da los ladrillos. Lo que la construye son decisiones: logs estructurados con retención, métricas pensadas por usuario y no por recurso, alarmas con acción clara y dueño, y un ojo permanente en el costo. La mejor señal de que tu monitoreo funciona es esta: el último incidente lo detectó una alarma y no un cliente. Si no es así, ya sabes cuál es la siguiente alarma por escribir.
