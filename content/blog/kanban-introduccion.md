---
title: "Introducción a Kanban: visualiza el trabajo y limita lo que haces a la vez"
date: 2026-08-19
description: "Tablero, límites de trabajo en curso y métricas de flujo: cómo funciona Kanban y cuándo usarlo en lugar de Scrum."
tags: [Gestión de proyectos, Kanban, Ágil]
---

Si en tu equipo hay muchas tareas a medias, entregas que se retrasan sin explicación y todo es "urgente", Kanban es probablemente la herramienta más sencilla para empezar a ver qué está pasando.

## De dónde viene

La palabra *kanban* significa "tarjeta" o "señal visual" en japonés. Se asocia al sistema de producción de Toyota, donde las tarjetas regulaban cuánto se producía según la demanda real. En el desarrollo de software lo adaptó David J. Anderson a mediados de los 2000.

## Las ideas centrales

### 1. Visualiza el trabajo

Un tablero con columnas que representan las etapas de tu proceso y tarjetas que representan trabajo. Un ejemplo:

| Por hacer | En desarrollo | En revisión | En pruebas | Hecho |
|---|---|---|---|---|

Con solo ponerlo a la vista, aparecen cosas que antes eran invisibles: tareas atoradas, cuellos de botella, trabajo sin dueño.

### 2. Limita el trabajo en curso (WIP)

Esta es la regla que distingue a Kanban de un simple tablero. Cada columna tiene un **límite**: por ejemplo, máximo 3 tarjetas en "En revisión". Si está llena, nadie empieza algo nuevo hasta que algo avance.

¿Por qué ayuda? Hacer muchas cosas a la vez parece productivo, pero:

- Cada cambio de tarea cuesta concentración.
- Las tareas tardan más en terminarse.
- Los problemas se descubren más tarde.

Limitar el WIP obliga a **terminar antes de empezar**, y a atacar los cuellos de botella en lugar de ignorarlos.

### 3. Gestiona el flujo

Observa cuánto tardan las tarjetas en pasar de principio a fin y trabaja para que fluyan de forma más predecible. Las métricas principales:

- **Lead time:** desde que se pide algo hasta que está entregado.
- **Cycle time:** desde que se empieza a trabajar hasta que se termina.
- **Throughput:** cuántas tarjetas se terminan por periodo.

Con el histórico puedes hacer previsiones basadas en datos ("el 85 % de las tareas se terminan en 6 días o menos") en lugar de estimar a ojo.

### 4. Haz explícitas las políticas

¿Cuándo una tarjeta pasa a "En revisión"? ¿Qué significa "Hecho"? Escribirlo en el tablero evita malentendidos.

### 5. Mejora de forma continua

Revisa el tablero, los indicadores y los cuellos de botella con regularidad y haz cambios pequeños.

## Kanban vs. Scrum

| | Scrum | Kanban |
|---|---|---|
| Cadencia | Sprints de duración fija | Flujo continuo |
| Roles | Definidos (PO, SM, Developers) | No prescribe nuevos roles |
| Límites | Por capacidad del Sprint | Por columna (WIP) |
| Cambios durante el ciclo | Se evitan en el Sprint | Se pueden incorporar cuando hay capacidad |
| Ideal para | Desarrollo de producto con metas por ciclo | Soporte, operaciones, flujo constante de peticiones |

No son excluyentes: muchos equipos usan Scrum con un tablero Kanban, o prácticas Kanban dentro de Scrum.

## Cómo empezar en una semana

1. **Dibuja tu proceso real**, tal como es hoy, no como debería ser.
2. **Pon todo el trabajo** actual en el tablero.
3. **Fija límites de WIP** iniciales sencillos y ajústalos con el tiempo.
4. **Reúnanse cada día** frente al tablero, de derecha a izquierda: primero lo que está más cerca de terminar.
5. **Mide** lead time y cycle time desde el primer día.

## Errores comunes

- **Tablero sin límites de WIP**: es solo una lista de tareas bonita.
- **Límites que se rompen sin consecuencias** ("solo esta vez").
- **Columnas que no reflejan el proceso real.**
- **Tarjetas eternas** que se quedan semanas sin movimiento y nadie las cuestiona.
- **Usar las métricas para presionar** a las personas.

## Para finalizar

Kanban no pide cambiar de golpe tu forma de trabajar: empieza donde estás, hace visible el trabajo y limita lo que se hace en paralelo. Esos dos hábitos bastan para reducir el caos y entregar con mayor regularidad.

Es un buen punto de partida para equipos de soporte, infraestructura u operaciones, donde el trabajo llega de forma constante y no cabe en ciclos fijos.
