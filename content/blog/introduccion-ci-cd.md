---
title: "Introducción a CI/CD: del commit a producción sin sustos"
date: 2026-10-30
description: "Qué son integración continua, entrega continua y despliegue continuo, cómo se ve un pipeline y qué prácticas lo vuelven confiable."
tags: [CI/CD, DevOps, Automatización]
---

Imagina que desplegar es un evento: se reserva una noche, se avisa a todos, alguien sigue una lista de pasos manuales y se cruzan los dedos. Si ese es tu proceso, despliegas poco, y como despliegas poco, cada despliegue es grande y arriesgado. Un círculo vicioso.

CI/CD rompe ese círculo haciendo que llevar cambios a producción sea algo **rutinario, pequeño y automático**.

## Las tres siglas

Se usan juntas pero significan cosas distintas:

| Práctica | Qué significa | Resultado |
|---|---|---|
| **Integración continua (CI)** | Integrar cambios a la rama principal con frecuencia, verificándolos automáticamente | Detectas errores de integración pronto |
| **Entrega continua (CD)** | Mantener el software siempre listo para desplegar; el despliegue a producción se decide con un botón | Puedes liberar cuando quieras |
| **Despliegue continuo (CD)** | Todo cambio que pasa las pruebas se despliega automáticamente | Cero intervención manual |

La mayoría de los equipos empieza por CI, avanza a entrega continua y solo algunos llegan al despliegue continuo completo, y está bien: no todos los productos lo requieren.

## Integración continua

La idea original es que cada persona integre su trabajo en la rama principal **al menos una vez al día**. En cada integración, un servidor ejecuta automáticamente:

1. **Compilación** del código.
2. **Pruebas automáticas** (unitarias y de integración).
3. **Análisis de calidad** y seguridad (lint, escaneo de dependencias).

Si algo falla, se corrige de inmediato: una rama principal rota es prioridad del equipo. El beneficio principal es que los problemas se detectan cuando el cambio es pequeño y está fresco en la memoria.

## Un pipeline típico

```text
commit → build → pruebas unitarias → análisis estático
       → empaquetado (artefacto/imagen)
       → despliegue a pruebas → pruebas de integración / E2E
       → (aprobación) → despliegue a producción → verificación
```

Cada etapa actúa como una **compuerta**: si falla, el cambio no avanza.

## Conceptos clave

- **Pipeline como código:** la definición vive en el repositorio (por ejemplo, un archivo YAML), versionada y revisada como cualquier código.
- **Artefacto inmutable:** construyes **una vez** y despliegas ese mismo artefacto en todos los entornos. Reconstruir por entorno introduce diferencias.
- **Entornos parecidos a producción:** reduce sorpresas.
- **Configuración y secretos fuera del código**, inyectados en el despliegue.
- **Infraestructura como código:** el pipeline también puede aplicar cambios de infraestructura.

## Estrategias de despliegue seguras

Desplegar con frecuencia exige poder hacerlo sin riesgo:

| Estrategia | Cómo funciona | Ventaja |
|---|---|---|
| **Rolling** | Reemplaza instancias gradualmente | Sencillo, sin tiempo de inactividad |
| **Blue/Green** | Dos entornos; cambias el tráfico de uno al otro | Reversión inmediata |
| **Canary** | Envías el cambio a un pequeño porcentaje de usuarios | Detectas problemas con poco impacto |
| **Feature flags** | Despliegas el código apagado y lo activas después | Separas despliegue de lanzamiento |

Además, necesitas **monitoreo** que detecte rápido si algo salió mal y una forma clara de **revertir**.

## Herramientas comunes

Hay muchas: GitHub Actions, GitLab CI, Jenkins, CircleCI, AWS CodePipeline, Azure DevOps y otras. Lo esencial no es la herramienta, sino las prácticas. Si tus pruebas son malas o lentas, cambiar de herramienta no lo arreglará.

## Lo que hace falta para que funcione

CI/CD no es solo configurar un servidor. Se apoya en:

- **Control de versiones** disciplinado, con ramas cortas.
- **Pruebas automáticas confiables:** sin ellas, automatizas el envío de errores a producción.
- **Cambios pequeños y frecuentes.**
- **Cultura:** el equipo se compromete a mantener el pipeline en verde.

## Errores frecuentes

- **Pipelines lentos:** si tarda 45 minutos, la gente deja de esperarlo y de confiar en él.
- **Pruebas inestables** que fallan al azar y se ignoran.
- **Secretos en el repositorio.**
- **Ramas de larga vida** que integran tarde y con dolor.
- **Pasos manuales ocultos** que solo conoce una persona.
- **Despliegue automático sin monitoreo ni plan de reversión.**

## Para finalizar

CI/CD convierte el despliegue en una rutina de bajo riesgo: cambios pequeños, verificados automáticamente y liberados con frecuencia. Los beneficios se notan en la velocidad y, sobre todo, en la tranquilidad.

Si estás empezando, automatiza primero la compilación y las pruebas en cada cambio. Con eso ya ganaste más de lo que parece, y todo lo demás se construye encima.
