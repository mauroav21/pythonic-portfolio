---
title: "¿Qué son los agentes de IA? De responder preguntas a ejecutar tareas"
date: 2026-10-30
description: "Qué diferencia a un agente de un chatbot, cómo funciona su ciclo de razonamiento y herramientas, y qué riesgos conviene controlar."
tags: [Inteligencia Artificial, Agentes, LLM]
---

Un modelo de lenguaje, por sí solo, recibe texto y devuelve texto. Puede explicarte cómo se reserva un vuelo, pero no reservarlo. Un **agente** da el siguiente paso: usa el modelo como cerebro para decidir qué hacer y se conecta a herramientas para hacerlo.

Es una de las ideas más discutidas del momento, y vale la pena entenderla sin humo.

## Chatbot vs. agente

| | Chatbot / asistente | Agente |
|---|---|---|
| **Qué hace** | Responde a lo que le escribes | Persigue un objetivo con varios pasos |
| **Herramientas** | Normalmente ninguna | Puede buscar, leer archivos, llamar APIs, ejecutar código |
| **Control del flujo** | Tú, mensaje a mensaje | El propio agente decide los pasos siguientes |
| **Ejemplo** | "Explícame este error" | "Encuentra el error, corrígelo, ejecuta las pruebas y abre un pull request" |

No hay una frontera exacta; es un espectro de autonomía.

## Cómo funciona: el ciclo del agente

La mayoría de los agentes repite un ciclo parecido:

1. **Recibe un objetivo** ("investiga las tres mejores opciones y prepara un resumen").
2. **Razona:** decide cuál es el siguiente paso.
3. **Actúa:** llama a una herramienta (buscar en la web, leer un documento, ejecutar una consulta).
4. **Observa el resultado** de esa acción.
5. **Repite** hasta cumplir el objetivo o decidir que no puede.

Es un bucle de razonamiento, acción y observación. Con cada vuelta el agente acumula información en su contexto.

## Los componentes

- **Modelo (el cerebro):** un LLM que interpreta, planifica y decide.
- **Herramientas:** funciones que el modelo puede invocar, como buscar, calcular, consultar una base de datos, enviar un correo o ejecutar comandos. Se describen al modelo con su nombre, propósito y parámetros.
- **Memoria:** el contexto de la tarea actual, y a veces memoria a largo plazo guardada en bases de datos o archivos.
- **Instrucciones:** el prompt de sistema que define su rol, reglas y límites.
- **Orquestación:** el código que gestiona el bucle, aplica permisos y registra lo que ocurre.

## Un protocolo para conectar herramientas

Para no reescribir las integraciones en cada aplicación han surgido estándares. El **Model Context Protocol (MCP)**, propuesto por Anthropic, define una forma común para que una aplicación de IA se conecte a herramientas y fuentes de datos externas. Un servidor MCP expone capacidades (por ejemplo, acceso a un repositorio o a una base de datos) y cualquier cliente compatible puede usarlas.

## Patrones comunes

- **Un solo agente con herramientas:** el más sencillo y suficiente para muchas tareas.
- **Flujos fijos con pasos de IA:** tú defines la secuencia (extraer, clasificar, redactar) y el modelo resuelve cada paso. Más predecible y fácil de depurar.
- **Varios agentes especializados:** uno planifica, otro investiga, otro revisa. Aumenta la complejidad y el costo.
- **Humano en el bucle:** el agente propone y una persona aprueba acciones sensibles.

Un consejo de diseño que se repite entre quienes los construyen: **empieza por lo más simple**. Muchas tareas se resuelven mejor con un flujo fijo que con un agente completamente autónomo.

## Dónde ya se usan

- **Programación:** agentes que leen un repositorio, editan archivos, ejecutan pruebas y proponen cambios.
- **Soporte al cliente:** consultan pedidos, aplican políticas y escalan casos complejos.
- **Investigación y análisis:** reúnen información de varias fuentes y sintetizan.
- **Operaciones de TI:** diagnostican alertas, revisan registros y sugieren soluciones.
- **Tareas administrativas:** agenda, correo, documentos, con permisos limitados.

## Riesgos y cómo controlarlos

Dar herramientas a un modelo aumenta el impacto de sus errores:

| Riesgo | Mitigación |
|---|---|
| **Acciones equivocadas o destructivas** | Permisos mínimos; aprobación humana para acciones irreversibles; entornos de prueba |
| **Alucinaciones que se encadenan** | Verificar resultados con herramientas fiables; pruebas automáticas |
| **Inyección de instrucciones (prompt injection):** contenido externo (una página, un correo) con instrucciones ocultas que el agente podría obedecer | Tratar todo contenido externo como datos, no como órdenes; limitar herramientas sensibles; filtros y confirmaciones |
| **Bucles y costos descontrolados** | Límites de pasos, tiempo y presupuesto |
| **Fuga de datos** | Segmentar accesos; registrar y auditar; no darle más datos de los necesarios |
| **Falta de trazabilidad** | Registrar cada paso, herramienta usada y resultado |

La inyección de instrucciones merece atención especial: es un problema abierto de seguridad y hoy se mitiga con capas de defensa, no con una solución única.

## Cómo evaluar si necesitas un agente

Hazte estas preguntas:

1. ¿La tarea requiere varios pasos que dependen de resultados intermedios?
2. ¿Los pasos varían tanto que no puedo programarlos en un flujo fijo?
3. ¿Qué pasa si se equivoca? ¿Puedo revertirlo?
4. ¿Cómo mediré si lo hace bien?
5. ¿Compensa su costo y latencia frente a una solución más simple?

Si no puedes responder la cuarta pregunta, aún no estás listo para desplegarlo.

## Para finalizar

Un agente es un modelo de lenguaje con objetivos, herramientas y un bucle de acción. Amplía lo que la IA puede hacer, y también lo que puede salir mal. Empieza con tareas acotadas, permisos mínimos, supervisión humana en lo importante y buena trazabilidad.

En el siguiente artículo veo cómo se aplican agentes y asistentes al trabajo de programar.
