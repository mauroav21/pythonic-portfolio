---
title: "Estimar tareas de software sin mentirle a nadie"
date: 2026-09-16
description: "Por qué estimamos mal, qué técnicas ayudan (rangos, puntos de historia, datos históricos) y cómo comunicar incertidumbre sin perder credibilidad."
tags: [Gestión de proyectos, Estimación, Ágil]
---

"¿Cuánto tardas en esto?" Es una pregunta inocente que ha provocado más malos ratos que cualquier bug. Estimar software es difícil porque casi siempre estamos haciendo algo que no habíamos hecho exactamente antes.

## Por qué estimamos mal

- **Optimismo.** Imaginamos el camino sin tropiezos.
- **Lo desconocido.** Hay trabajo que no descubrimos hasta que empezamos.
- **Presión.** Si el jefe espera "dos semanas", la estimación tiende hacia ese número.
- **Trabajo invisible.** Revisiones, reuniones, pruebas, despliegue, interrupciones.
- **Efecto ancla.** La primera cifra que se dice condiciona las demás.

Nada de esto es falta de profesionalismo. Es la naturaleza del trabajo creativo.

## La estimación es un rango, no un punto

Decir "5 días" transmite una certeza que no tienes. Dar un rango comunica la verdad:

- "Probablemente entre 3 y 8 días; lo más probable, 5."
- "Tengo alta confianza en el backend, baja en la integración con el proveedor."

Un truco útil, el **estimado de tres puntos**: optimista (O), más probable (M) y pesimista (P). Una forma común de combinarlos es (O + 4M + P) / 6. El rango se estrecha conforme aprendes. Al inicio es normal que sea amplio; exigir precisión cuando falta información solo da cifras falsas.

## Estimar en tiempo o en tamaño relativo

Hay dos enfoques:

**Tiempo absoluto (horas o días):** intuitivo, pero depende de quién lo haga y de cuántas interrupciones tenga. **Tamaño relativo (puntos de historia, tallas de camiseta):** se compara una tarea con otras ya conocidas. "Esto es el doble de complejo que aquella." Evita discutir horas exactas y funciona mejor en equipo. Las tareas se miden en una escala como Fibonacci (1, 2, 3, 5, 8, 13), donde los saltos crecientes reflejan la incertidumbre creciente. Con el tiempo, el equipo descubre cuántos puntos termina por ciclo (su **velocidad**), y con eso proyecta.

## Planning Poker

Técnica común en equipos ágiles:

1. Se presenta la tarea y se aclaran dudas.
2. Cada persona elige en secreto su estimación.
3. Todos las revelan a la vez.
4. Si hay diferencias grandes, quienes dieron los extremos explican su razonamiento.
5. Se repite hasta converger.

El valor está en la **conversación**: las diferencias revelan supuestos distintos, requisitos poco claros o riesgos que alguien vio y los demás no.

## Usa datos, no solo intuición

Lo que mejor predice el futuro es el pasado:

- ¿Cuánto tardó la última tarea parecida?
- ¿Cuántas tareas termina el equipo normalmente por semana?
- ¿Cuánto se desvían habitualmente tus estimaciones?

Si históricamente terminas en 1.5 veces lo estimado, eso es información útil, y no un defecto que se corrige con voluntad.

## Dividir para estimar

Las tareas grandes tienen más incertidumbre. Divídelas hasta que cada pieza sea de unos pocos días. Si no puedes dividirla porque no sabes qué implica, es señal de que necesitas **investigar primero**; incluso puedes estimar una exploración de tiempo limitado (un *spike*) para reducir la incertidumbre.

## Comunicar estimaciones

- Aclara **qué incluye**: ¿solo programar, o también pruebas y despliegue?
- Explica los **supuestos**: "si la API del proveedor está disponible".
- Da el **grado de confianza**.
- Actualiza cuando aprendas algo nuevo, y avisa antes del retraso.

## Estimado, objetivo y compromiso no son lo mismo

- **Estimado:** lo que creemos que probablemente pasará.
- **Objetivo:** lo que el negocio quisiera.
- **Compromiso:** lo que prometemos entregar.

Muchos conflictos nacen de confundir estas tres cosas. Si el objetivo es más ambicioso que el estimado, eso es una conversación sobre alcance o recursos, no una orden de "estimar menos".

## Errores comunes

- **Convertir la estimación en promesa** sin margen ni condiciones.
- **Estimar a solas** quien no hará el trabajo.
- **Castigar las estimaciones altas**: la gente aprenderá a dar números cómodos.
- **Ignorar el tiempo de revisión, pruebas y despliegue.**
- **Obsesionarse con la precisión**: perder horas estimando a detalle algo que ni siquiera se sabe si se hará.

## Una estimación que "cumplió" y me dejó pensando

En un proyecto con tiempos muy ajustados, cumplimos la fecha pero a costa de no mapear todos los procesos ni identificar a todas las áreas involucradas. El cliente quedó satisfecho, que era el objetivo, pero yo me quedé con la sensación de haber entregado algo por debajo de mis estándares. Lo que faltaba se resolvió en funcionalidades futuras. Desde entonces, cuando estimo, pregunto dos cosas además del tiempo: **¿qué parte del problema aún no entendemos?** y **¿qué estamos dejando fuera para llegar a la fecha, y quién lo sabe?** Una estimación honesta no es solo un número: es el número más la lista de lo que no se está considerando.

## Para finalizar

Estimar bien no es adivinar mejor, sino ser honesto con la incertidumbre. Usa rangos, compara con el pasado, estima en equipo y divide el trabajo grande. Y recuerda que una estimación es información para decidir, no una promesa grabada en piedra.
