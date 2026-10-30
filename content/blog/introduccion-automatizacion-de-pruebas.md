---
title: "Introducción a la automatización de pruebas: qué automatizar y qué no"
date: 2026-08-05
description: "La pirámide de pruebas, tipos de pruebas, herramientas comunes y errores frecuentes al empezar a automatizar."
tags: [Pruebas, QA, Automatización]
---

Probar manualmente cada cambio funciona mientras el sistema es pequeño. Luego el producto crece, los despliegues se aceleran y nadie tiene tiempo de repetir cien verificaciones antes de cada entrega. Ahí aparece la automatización de pruebas, y también el riesgo de automatizarlo todo mal.

## Qué es y para qué sirve

Automatizar pruebas es escribir código que verifica que otro código se comporta como debe, y ejecutarlo de forma repetible, sin intervención humana. Los beneficios:

- **Retroalimentación rápida:** sabes en minutos si un cambio rompió algo.
- **Confianza para cambiar:** puedes refactorizar sin miedo.
- **Repetibilidad:** la misma verificación, cada vez, sin cansancio.
- **Documentación viva:** las pruebas muestran cómo debería funcionar el sistema.
- **Base para CI/CD:** sin pruebas automáticas no puedes desplegar con frecuencia y seguridad.

Automatizar no reemplaza a las personas que prueban: las libera de lo repetitivo para dedicar su criterio a lo exploratorio.

## La pirámide de pruebas

Un modelo muy conocido propone tener muchas pruebas rápidas y baratas en la base, y pocas lentas y costosas en la punta:

| Nivel | Qué verifica | Velocidad | Cantidad ideal |
|---|---|---|---|
| **Unitarias** | Una función o clase aislada | Milisegundos | Muchas |
| **Integración** | Que varias piezas funcionen juntas (con base de datos, API) | Segundos | Moderadas |
| **De extremo a extremo (E2E)** | El flujo completo como un usuario | Minutos | Pocas |

Las pruebas E2E dan mucha confianza pero son lentas, frágiles y difíciles de depurar. Si tu suite es casi solo E2E (la llamada "pirámide invertida" o cono de helado), tendrás ciclos lentos y pruebas que fallan sin razón clara.

## Otros tipos de pruebas

- **De contrato:** verifican que dos servicios respeten su acuerdo de interfaz.
- **De rendimiento y carga:** cómo responde el sistema bajo uso intenso.
- **De seguridad:** análisis de dependencias, escaneo de vulnerabilidades.
- **De regresión:** aseguran que lo que funcionaba sigue funcionando.
- **De humo (smoke):** un conjunto breve para confirmar que lo esencial vive tras un despliegue.
- **Exploratorias:** manuales, guiadas por la curiosidad y la experiencia. Siguen siendo necesarias.

## Qué conviene automatizar

- Lo que se repite en cada entrega.
- Lógica de negocio crítica y casos límite.
- Flujos principales del usuario.
- Errores ya encontrados antes (una prueba por cada bug corregido).
- Verificaciones que serían tediosas o propensas a error humano.

## Qué no conviene automatizar

- Lo que cambia constantemente y no se ha estabilizado.
- Pruebas que se ejecutarán una sola vez.
- Evaluaciones subjetivas, como si algo "se siente bien" o es usable.
- Casos tan costosos de mantener que superan su valor.

## Herramientas comunes

Existen muchas opciones y la mejor depende de tu stack; por citar algunas conocidas:

- **Unitarias:** JUnit (Java), pytest (Python), Jest o Vitest (JavaScript).
- **API:** Postman/Newman, REST Assured, herramientas de pruebas de contrato como Pact.
- **E2E en web:** Playwright, Cypress, Selenium.
- **Carga:** k6, JMeter, Locust.

Elige por la facilidad de integrarlas a tu pipeline y por la experiencia del equipo, más que por la moda.

## Un ejemplo sencillo de prueba unitaria

```python
def calcular_iva(subtotal, tasa=0.16):
    return round(subtotal * tasa, 2)

def test_calcular_iva_con_tasa_general():
    assert calcular_iva(100) == 16.0

def test_calcular_iva_en_cero():
    assert calcular_iva(0) == 0
```

Es corta, rápida y falla con claridad si alguien rompe la función.

## Prácticas que ayudan

- **Pruebas independientes:** que no dependan del orden ni del estado dejado por otras.
- **Datos controlados:** crea los datos que necesitas en cada prueba en lugar de depender de una base compartida.
- **Nombres descriptivos:** el nombre debe decir qué se verifica y en qué condición.
- **Mantenlas rápidas:** si la suite tarda mucho, la gente deja de ejecutarla.
- **Trata las pruebas como código**: revisión, refactorización y mantenimiento.
- **Corre las pruebas en el pipeline** en cada cambio.

## Errores frecuentes

- **Perseguir el 100 % de cobertura.** La cobertura mide qué líneas se ejecutan, no si se verifican bien.
- **Pruebas frágiles** que fallan aleatoriamente y terminan ignoradas.
- **Automatizar la interfaz como primer paso**, en lugar de empezar por lo más barato.
- **Dejar las pruebas solo al equipo de QA**, al final del proceso. Construir calidad es tarea de todo el equipo.
- **No mantener la suite:** una prueba rota que nadie arregla invita a ignorarlas todas.

## Para finalizar

Automatizar pruebas es una inversión que se paga con cada cambio que haces con confianza. Empieza por muchas pruebas unitarias, añade integración donde hay riesgo, deja pocas E2E para los flujos esenciales y mantén todo en tu pipeline.

Esta es una introducción; en el artículo sobre CI/CD veo cómo estas pruebas se integran en el camino hacia producción.
