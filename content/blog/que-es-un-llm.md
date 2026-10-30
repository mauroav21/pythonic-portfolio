---
title: "¿Qué es un LLM? Cómo funcionan los modelos de lenguaje sin tanto misterio"
date: 2026-10-30
description: "Tokens, transformers, entrenamiento, ventana de contexto y alucinaciones: lo esencial para entender qué hay detrás de un asistente de IA."
tags: [Inteligencia Artificial, LLM, Fundamentos]
---

Hoy casi todos hemos escrito a un asistente de IA y recibido una respuesta que parece haber sido escrita por una persona. Usarlo es fácil. Entender qué es y qué no es, también ayuda mucho: te dice cuándo confiar, cuándo verificar y cómo pedir mejor.

## Qué es un LLM

LLM significa *Large Language Model*, modelo de lenguaje grande. Es un modelo de aprendizaje automático entrenado con enormes cantidades de texto para una tarea que suena modesta: **predecir cuál es el siguiente fragmento de texto** dado lo que ya hay.

Si le das "El cielo está", el modelo asigna probabilidades a lo que puede seguir: "azul", "despejado", "nublado". Elige uno, lo añade y repite. Una respuesta larga es esa predicción hecha cientos de veces seguidas.

Parece poco, pero para predecir bien el texto el modelo termina capturando gramática, hechos, estilos y patrones de razonamiento presentes en los datos con que se entrenó.

## Tokens: la unidad real

Los modelos no leen palabras ni letras, sino **tokens**: pedazos de texto, a veces una palabra completa, a veces una sílaba o un signo. En español una palabra suele ocupar uno o varios tokens.

Esto importa por tres razones:

- Los precios de las APIs se cobran por tokens de entrada y de salida.
- El límite de lo que el modelo "recuerda" se mide en tokens.
- Tareas que requieren ver letras individuales, como contar las "r" de una palabra, le salen mal porque el modelo no ve letras sino tokens.

## La arquitectura: transformers

Casi todos los LLM actuales usan la arquitectura **transformer**, presentada en 2017 en el artículo "Attention Is All You Need". Su idea central es la **atención**: al procesar una palabra, el modelo pondera qué otras partes del texto son relevantes para interpretarla.

En "El banco cerró temprano, así que no pude retirar dinero", la atención ayuda a relacionar "banco" con "dinero" y no con un asiento de parque. Esto se hace en paralelo sobre todo el texto, lo que permitió entrenar modelos mucho más grandes que con técnicas anteriores.

## Cómo se entrena

En términos generales hay etapas:

1. **Preentrenamiento.** El modelo aprende a predecir texto sobre una cantidad enorme de datos. Es la etapa más costosa y le da el conocimiento general.
2. **Ajuste fino (fine-tuning) con instrucciones.** Se entrena con ejemplos de pregunta y buena respuesta, para que se comporte como asistente y no solo como completador de texto.
3. **Alineación con retroalimentación humana u otras técnicas.** Se refuerzan respuestas útiles, seguras y honestas, y se desalientan las dañinas.

Los detalles exactos varían entre proveedores y, en muchos casos, no son públicos.

## Ventana de contexto

La **ventana de contexto** es la cantidad de tokens que el modelo puede considerar a la vez: tu mensaje, el historial de la conversación, documentos adjuntos y su propia respuesta. Lo que queda fuera, el modelo no lo "ve".

Dos consecuencias prácticas:

- Un modelo **no tiene memoria entre conversaciones** por sí mismo. Si parece recordarte, es porque la aplicación le reenvía información o usa una función de memoria aparte.
- Contexto más largo no significa que use bien todo el contexto. Si el dato clave está enterrado en medio de muchísimo texto, puede pasarlo por alto.

## Parámetros que verás en las herramientas

- **Temperatura:** controla el grado de aleatoriedad. Baja, para respuestas más predecibles; alta, para más variedad y creatividad.
- **Máximo de tokens de salida:** corta la respuesta en cierto punto.
- **Prompt de sistema:** instrucciones de fondo que definen el rol y las reglas del asistente.

## Lo que hacen bien

- Redactar, resumir, traducir y reescribir texto.
- Explicar conceptos y adaptarlos al nivel de quien pregunta.
- Generar borradores de código y ayudar a depurarlo.
- Extraer información estructurada de texto desordenado.
- Servir de interlocutor para pensar un problema.

## Lo que hacen mal (y por qué)

### Alucinaciones

Un LLM genera texto **plausible**, no necesariamente **verdadero**. Puede inventar una cita, una función de una librería que no existe o un dato con total seguridad. No miente a propósito: simplemente produce lo que estadísticamente encaja.

### Datos desactualizados

Su conocimiento termina en una fecha de corte. Sobre lo posterior, o no sabe o improvisa, salvo que tenga acceso a búsqueda o a tus documentos.

### Cálculos y razonamiento exacto

Puede equivocarse en aritmética o lógica con muchos pasos, aunque los modelos recientes mejoran bastante, sobre todo cuando se les da una herramienta de cálculo o tiempo para razonar paso a paso.

### Sesgos

Reflejan los sesgos presentes en los datos con que fueron entrenados.

## Cómo reducir errores

1. **Dale contexto.** Cuanto más específico sea tu pedido y más información pongas, mejor la respuesta.
2. **Pide fuentes o razonamiento** y verifica lo importante.
3. **Fundamenta con tus propios datos.** La técnica de RAG (generación aumentada por recuperación) busca los documentos relevantes y se los entrega al modelo para responder con base en ellos.
4. **Usa herramientas** para lo que necesita exactitud: calculadoras, bases de datos, ejecución de código.
5. **Mantén a una persona revisando** en decisiones con consecuencias.

## LLM no es sinónimo de IA

La inteligencia artificial es un campo amplio: visión por computadora, sistemas de recomendación, robótica. Los LLM son una familia dentro del aprendizaje automático, enfocada en lenguaje. Muchos productos actuales combinan un LLM con otras piezas, como búsqueda, herramientas y bases de conocimiento.

## Para finalizar

Un LLM no es un buscador ni una persona: es un modelo estadístico muy potente que predice texto. Esa descripción corta te sirve para casi todo: explica por qué redacta tan bien, por qué a veces inventa y por qué mejora cuando le das buen contexto.

Úsalo como un colega rápido que sabe de muchísimos temas pero necesita que lo revises. En los siguientes artículos de esta serie veo qué son los agentes y cómo se usan estos modelos en el trabajo de código.
