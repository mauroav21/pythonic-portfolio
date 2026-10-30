---
title: "Introducción a Amazon CloudWatch: ver qué pasa en tus sistemas"
date: 2026-10-14
description: "Métricas, registros, alarmas y paneles en CloudWatch: cómo montar observabilidad básica en AWS y evitar sorpresas de costo."
tags: [AWS, CloudWatch, Observabilidad]
---

Un sistema sin observabilidad es una caja negra: solo sabes que algo falló cuando un usuario se queja. **Amazon CloudWatch** es el servicio de monitoreo y observabilidad de AWS: reúne métricas, registros y eventos de tus recursos y aplicaciones, y te permite reaccionar.

## Los componentes principales

| Componente | Qué hace |
|---|---|
| **Métricas** | Series de números en el tiempo (CPU, latencia, errores) |
| **Registros (Logs)** | Líneas de texto de tus aplicaciones y servicios, centralizadas |
| **Alarmas** | Vigilan una métrica y actúan al cruzar un umbral |
| **Paneles (Dashboards)** | Vistas personalizadas de métricas y registros |
| **Logs Insights** | Lenguaje de consulta para analizar registros |
| **Eventos / EventBridge** | Reaccionar a cambios y programar tareas |
| **Synthetics** | Pruebas automáticas que simulan usuarios |

## Métricas

Casi todos los servicios de AWS publican métricas automáticamente: uso de CPU de EC2, invocaciones y errores de Lambda, mensajes en una cola SQS, solicitudes de un balanceador.

Conceptos:

- **Espacio de nombres (namespace):** agrupa métricas (`AWS/Lambda`).
- **Dimensiones:** etiquetan una métrica (por ejemplo, el nombre de la función).
- **Estadísticas:** promedio, suma, máximo, mínimo, percentiles (p95, p99).
- **Resolución:** las métricas estándar suelen tener granularidad de un minuto (o cinco, según el servicio); las **métricas personalizadas** pueden tener resolución más fina.

Un detalle importante: **la memoria y el espacio en disco de una instancia EC2 no se publican por defecto.** Necesitas el **agente de CloudWatch** para enviarlos.

### Métricas personalizadas

Puedes publicar tus propias métricas (pedidos por minuto, tiempo de procesamiento) desde tu código. Son muy útiles para medir lo que importa al negocio, pero cada métrica personalizada tiene costo.

## Registros

Los registros de **Lambda**, y de muchos servicios, llegan solos a **grupos de registros** (log groups), organizados en **flujos** (log streams). Con el agente puedes enviar los de tus instancias o contenedores.

Prácticas clave:

- **Define la retención.** Por defecto los registros se guardan para siempre y cuestan; fija un periodo razonable.
- **Usa registros estructurados (JSON):** se consultan mucho mejor.
- **Incluye identificadores de correlación** (ID de petición) para seguir una operación entre servicios.
- **No registres datos sensibles:** contraseñas, tokens, datos personales.
- **Filtros de métricas:** convierte patrones de registro en métricas (por ejemplo, el número de líneas con `ERROR`).

### Logs Insights

Un ejemplo de consulta para ver los errores más frecuentes:

```text
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() as total by bin(5m)
| sort @timestamp desc
```

## Alarmas

Una alarma evalúa una métrica durante un periodo y cambia de estado: **OK**, **EN ALARMA** o **DATOS INSUFICIENTES**. Al cambiar, puede:

- Enviar una notificación mediante **SNS** (correo, SMS, chat).
- Disparar acciones de **Auto Scaling**.
- Reiniciar o recuperar una instancia EC2.
- Crear un incidente en herramientas de gestión de operaciones.

### Qué conviene alertar

- **Síntomas que sienten los usuarios:** tasa de errores, latencia, disponibilidad.
- **Recursos que se agotan:** disco, conexiones de base de datos, profundidad de colas.
- **Fallos de procesos:** mensajes en una cola de mensajes fallidos.
- **Costos:** facturación estimada por encima de un presupuesto (usa también AWS Budgets).

Evita alarmas por cualquier variación: la **fatiga de alertas** hace que la gente ignore las importantes. Cada alarma debería tener una acción clara asociada.

## Paneles

Un buen panel responde en segundos: "¿está bien el servicio?". Incluye pocas métricas clave (tráfico, errores, latencia, saturación) y ordénalas del síntoma a la causa. Los paneles se pueden compartir entre cuentas y regiones.

## Más allá de lo básico

- **CloudWatch Application Signals y X-Ray:** trazas distribuidas para seguir una petición a través de servicios.
- **Container Insights y Lambda Insights:** métricas y registros más detallados para contenedores y funciones.
- **Detección de anomalías:** alarmas basadas en el comportamiento habitual en lugar de umbrales fijos.
- **Observabilidad entre cuentas:** centraliza la visibilidad en una cuenta de monitoreo.

## Costos: la parte que sorprende

- **Ingesta y almacenamiento de registros** suelen ser el mayor gasto. Controla qué registras, el nivel de detalle y la retención.
- **Métricas personalizadas,** por cada combinación única de nombre y dimensiones. Dimensiones con valores muy variables (por ejemplo, un ID de usuario) pueden multiplicar el costo.
- **Alarmas, paneles y consultas de Logs Insights** tienen su tarifa.
- Hay una capa gratuita limitada.

## Buenas prácticas

1. **Define qué significa "estar sano"** para tu servicio y alerta sobre ello.
2. **Registros en JSON con retención definida.**
3. **Alarmas accionables,** con un responsable y, si es posible, un procedimiento asociado.
4. **Etiqueta recursos** para filtrar y asignar costos.
5. **Revisa alarmas y paneles** de forma periódica: elimina lo obsoleto.
6. **Prueba tus alertas:** una alarma que nunca se probó es una suposición.
7. **Define todo como código** (CloudFormation, Terraform, CDK).

## Errores frecuentes

- **No configurar la retención** de los registros.
- **Alertas ruidosas** que acaban silenciadas.
- **Monitorear solo infraestructura** (CPU) y no la experiencia del usuario.
- **Olvidar el agente** y no tener métricas de memoria o disco.
- **Dimensiones de alta cardinalidad** en métricas personalizadas.
- **Enterarte del problema por los usuarios.**

## Para finalizar

CloudWatch te da los ojos y los oídos para operar en AWS. Empieza por lo básico: métricas de los servicios que usas, registros estructurados con retención y unas pocas alarmas realmente importantes.

La observabilidad no se agrega al final: se construye junto con el sistema, y se ajusta con cada incidente.
