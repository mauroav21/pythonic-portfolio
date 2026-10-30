---
title: "Las tres vías de DevOps: flujo, retroalimentación y aprendizaje continuo"
date: 2026-10-30
description: "El marco de principios detrás de DevOps: acelerar el flujo de trabajo, amplificar la retroalimentación y construir una cultura de experimentación."
tags: [DevOps, Cultura, Principios]
---

Cuando se habla de DevOps, la conversación suele irse a herramientas: Docker, Kubernetes, Terraform, Jenkins. Pero hay un conjunto de principios debajo de todas ellas que explica **por qué** funcionan. Se conocen como **las tres vías de DevOps**, y se popularizaron con la novela *The Phoenix Project* y *The DevOps Handbook*.

Aquí las explico en mis palabras y con ejemplos.

## Primera vía: el flujo

**Idea:** acelerar el camino que recorre el trabajo desde que se pide (desarrollo) hasta que llega al cliente (operaciones).

Piensa en el trabajo como un río. El objetivo es que fluya sin presas.

### Cómo se logra

- **Hacer visible el trabajo.** Tableros que muestren qué hay, en qué etapa y dónde se estanca.
- **Reducir el tamaño de los lotes.** Cambios pequeños se prueban, revisan y despliegan más rápido y con menos riesgo que un cambio gigante.
- **Limitar el trabajo en curso.** Hacer menos cosas a la vez para terminarlas.
- **Reducir los traspasos** entre equipos: cada uno es una espera y una pérdida de contexto.
- **Eliminar cuellos de botella y desperdicio:** esperas, aprobaciones innecesarias, trabajo manual repetitivo, defectos que obligan a rehacer.
- **Automatizar** compilación, pruebas, despliegue e infraestructura.

### Una regla útil

Nunca pases un defecto conocido al siguiente paso. Detenerlo donde nace es más barato que encontrarlo en producción.

## Segunda vía: la retroalimentación

**Idea:** crear canales rápidos y constantes de información de derecha a izquierda, es decir, de producción hacia desarrollo, para detectar y corregir problemas pronto.

Si el flujo es el río hacia adelante, la retroalimentación es la señal de regreso que te dice si vas bien.

### Cómo se logra

- **Pruebas automáticas** en cada cambio: sabes en minutos si algo se rompió.
- **Monitoreo y observabilidad** de producción, con métricas, registros y alertas útiles.
- **Revisión por pares** del código antes de integrarlo.
- **Detener la línea:** cuando algo falla en el pipeline, el equipo se detiene a corregirlo antes de seguir.
- **Acercar a desarrollo a las consecuencias de lo que construye:** participar en la operación, atender guardias, leer los incidentes.
- **Escuchar al cliente:** datos de uso, soporte, encuestas.

### El efecto

Los problemas se detectan **cerca de su causa**, cuando son pequeños y baratos. Cuanto más tarda en llegar la señal, más cuesta corregir.

## Tercera vía: aprendizaje continuo y experimentación

**Idea:** construir una cultura que fomente la experimentación, la asunción de riesgos razonables y el aprendizaje de los errores y el éxito, con práctica constante.

### Cómo se logra

- **Cultura sin culpables:** los fallos se analizan para aprender, no para castigar.
- **Dedicar tiempo a mejorar el trabajo diario:** reducir deuda técnica y mejorar procesos es tan importante como las funcionalidades nuevas.
- **Experimentar a propósito:** pruebas de caos, ejercicios de recuperación ante fallos, pruebas A/B.
- **Compartir conocimiento:** documentación, charlas internas, retrospectivas, post-mortems accesibles.
- **Convertir los aprendizajes locales en mejoras globales.**

### Por qué importa

Los sistemas complejos fallan de formas imprevisibles. Los equipos que practican la recuperación y aprenden de los incidentes se vuelven resilientes, y los que ocultan sus errores repiten los mismos.

## Cómo se relacionan

| Vía | Pregunta clave | Prácticas típicas |
|---|---|---|
| **Flujo** | ¿Qué tan rápido llega el valor al cliente? | CI/CD, lotes pequeños, límites de WIP |
| **Retroalimentación** | ¿Qué tan pronto sabemos que algo falla? | Pruebas, monitoreo, revisiones |
| **Aprendizaje** | ¿Qué hacemos con lo que aprendemos? | Post-mortems, experimentos, mejora continua |

Las tres se refuerzan: un flujo rápido sin retroalimentación te lleva más rápido al error; retroalimentación sin aprendizaje solo te informa de los mismos problemas.

## Cómo usarlas en la práctica

Hazte tres preguntas sobre tu equipo:

1. **Flujo:** ¿cuánto tarda un cambio desde que se pide hasta producción? ¿Dónde espera más tiempo?
2. **Retroalimentación:** ¿cuánto tardamos en enterarnos de que un cambio causó un problema?
3. **Aprendizaje:** ¿qué cambió en nuestra forma de trabajar tras el último incidente?

Con las respuestas ya sabes por dónde empezar.

## Errores frecuentes

- **Adoptar herramientas sin entender el principio:** instalar un pipeline que no mejora el flujo.
- **Optimizar una sola etapa** (por ejemplo, programar más rápido) sin ver el sistema completo; el cuello de botella simplemente se mueve.
- **Ignorar la tercera vía**, la más difícil y la que más cuesta mantener.
- **Culpar a personas** y destruir la retroalimentación honesta.

## Para finalizar

Las tres vías son una forma de pensar: acelerar el flujo, escuchar pronto lo que dice la realidad y convertir cada experiencia en aprendizaje. Las herramientas cambian cada pocos años, estos principios se mantienen.

Si tuviera que quedarme con una sola idea sería esta: mejora el sistema donde trabajas, no solo el trabajo que haces dentro de él.
