---
title: "Métricas de proyectos de TI: qué medir para tomar mejores decisiones"
date: 2026-10-20
description: "Métricas útiles para proyectos y equipos de TI, desde las de entrega (DORA) hasta las de valor, y cómo evitar los indicadores de vanidad."
tags: [Gestión de proyectos, Métricas, DORA]
---

Lo que no se mide no se puede mejorar, dice el dicho. Y lo que se mide mal se empeora, podríamos añadir. Un tablero con métricas mal elegidas produce decisiones erróneas con aparente respaldo en datos.

## Para qué medimos

Antes de elegir métricas, define la pregunta que quieres responder:

- ¿Estamos entregando valor a los usuarios?
- ¿Qué tan rápido y con qué calidad entregamos?
- ¿Vamos a cumplir lo comprometido?
- ¿El equipo trabaja de forma sostenible?

Una métrica que no ayuda a decidir algo es ruido.

## Métricas de entrega: el modelo DORA

El programa de investigación DORA (DevOps Research and Assessment) identificó cuatro métricas que se relacionan con el desempeño de entrega de software:

| Métrica | Qué mide |
|---|---|
| **Frecuencia de despliegue** | Cada cuánto llevas cambios a producción |
| **Tiempo de entrega de cambios** | Desde el commit hasta producción |
| **Tasa de fallo de cambios** | Porcentaje de despliegues que causan un problema |
| **Tiempo de recuperación** | Cuánto tardas en restablecer el servicio tras un fallo |

Las dos primeras miden **velocidad** y las dos últimas **estabilidad**. Lo valioso del hallazgo de DORA es que los mejores equipos no sacrifican una por la otra: logran ambas. Los números concretos de referencia cambian en cada informe anual, así que consulta el más reciente en lugar de fiarte de cifras viejas.

## Métricas de flujo

Vienen de Kanban y sirven en cualquier equipo:

- **Lead time y cycle time:** cuánto tarda el trabajo en atravesar el proceso.
- **Throughput:** cuántos elementos se terminan por periodo.
- **Trabajo en curso:** cuántas cosas están abiertas a la vez.
- **Antigüedad del trabajo:** qué tarjetas llevan demasiado tiempo abiertas.

## Métricas de calidad

- **Defectos escapados:** errores que llegan a producción.
- **Cobertura y estabilidad de pruebas:** útil si se interpreta con criterio. Cobertura alta no garantiza buenas pruebas.
- **Deuda técnica:** difícil de medir con un número, pero se puede seguir con una lista visible y su impacto.
- **Incidentes y alertas** por servicio.

## Métricas de valor y resultado

Las más importantes y las más olvidadas:

- **Adopción:** ¿lo usan?
- **Satisfacción:** encuestas breves, NPS, comentarios.
- **Impacto en el negocio:** reducción de costos, tiempo ahorrado, ingresos, menos llamadas a soporte.
- **Cumplimiento de objetivos** definidos al inicio del proyecto.

Entregar muchas funcionalidades que nadie usa tiene un costo y no es éxito.

## Métricas del equipo

- **Previsibilidad:** ¿cumplimos lo que prometemos en cada ciclo?
- **Carga y sostenibilidad:** horas extra, guardias, rotación.
- **Clima del equipo:** encuestas periódicas anónimas y sencillas.

## Indicadores de vanidad y trampas

Algunos números lucen bien y no ayudan:

- **Líneas de código o número de commits:** miden actividad, no valor.
- **Horas trabajadas:** premian estar ocupado, no ser efectivo.
- **Velocidad usada para comparar equipos:** cada uno estima distinto.
- **Porcentaje de avance por impresión.**
- **Cantidad de funcionalidades entregadas** sin saber si se usan.

Existe una ley conocida, la de Goodhart: cuando una medida se convierte en objetivo, deja de ser una buena medida. Si premias el número de despliegues, tendrás muchos despliegues pequeños y vacíos.

## Cómo elegir y usar métricas

1. **Parte de las preguntas**, no de las herramientas.
2. **Pocas y claras:** con 4 o 5 bien escogidas basta.
3. **Úsalas para conversar**, no para castigar.
4. **Mira tendencias**, no solo el valor de hoy.
5. **Combina números con contexto:** la cifra dice qué pasó; las personas explican por qué.
6. **Revísalas con regularidad** y descarta las que ya no sirven.

## Para finalizar

Una buena métrica te ayuda a tomar una decisión que antes no podías. Mide resultados además de actividad, equilibra velocidad con estabilidad y úsalas para aprender, no para vigilar.

Si solo vas a empezar con algo, empieza por el tiempo que tarda un cambio en llegar a producción y por cuántos fallan. Con esas dos cifras ya sabrás mucho de cómo funciona tu equipo.
