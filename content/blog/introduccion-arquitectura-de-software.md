---
title: "Introducción a la arquitectura de software: decisiones que cuestan cambiar"
date: 2026-10-30
description: "Qué es la arquitectura de software, atributos de calidad, estilos comunes (monolito, microservicios, eventos) y cómo documentar decisiones."
tags: [Arquitectura, Software, Diseño]
---

Hay decisiones de software que se corrigen en una tarde: el nombre de una variable, el orden de unos parámetros. Y hay otras que, si resultan equivocadas, cuestan meses: cómo se dividen los componentes, dónde viven los datos, cómo se comunican los servicios. A estas últimas se les llama **decisiones de arquitectura**.

## Qué es arquitectura de software

Una definición práctica: la arquitectura son las **decisiones importantes y difíciles de cambiar** sobre la estructura de un sistema, los componentes principales, cómo se relacionan y los principios que guían su evolución.

No es un diagrama bonito ni un puesto. Es el resultado de decidir, de forma consciente o no, cómo se organiza el sistema. Si no decides, la arquitectura ocurre igual, solo que por accidente.

## El punto de partida: los atributos de calidad

Un sistema no solo debe "hacer cosas" (requisitos funcionales). También debe cumplir cualidades, que son las que más influyen en la arquitectura:

| Atributo | Pregunta |
|---|---|
| **Rendimiento** | ¿Qué tan rápido responde? |
| **Escalabilidad** | ¿Soporta más usuarios o datos? |
| **Disponibilidad** | ¿Cuánto tiempo está funcionando? |
| **Seguridad** | ¿Protege datos y accesos? |
| **Mantenibilidad** | ¿Qué tan fácil es cambiarlo? |
| **Facilidad de prueba** | ¿Se puede verificar con facilidad? |
| **Costo** | ¿Cuánto cuesta construirlo y operarlo? |

Casi nunca puedes maximizarlos todos a la vez. La arquitectura es el arte de elegir **compromisos** (trade-offs) conscientes: optimizar lo que importa para este sistema y aceptar menos en el resto.

## Estilos arquitectónicos comunes

### Monolito

Una sola aplicación desplegable que contiene todo. Sencillo de desarrollar, probar y desplegar al inicio. Con el tiempo, si no se cuida su estructura interna, se vuelve difícil de cambiar. Un **monolito modular**, con límites internos claros, es una opción poco valorada y muy razonable para muchos equipos.

### Capas

Se separan responsabilidades (presentación, lógica de negocio, acceso a datos) con dependencias en un solo sentido. Es el patrón más conocido y fácil de entender.

### Microservicios

El sistema se divide en servicios pequeños, independientes, cada uno con su propio despliegue y normalmente sus propios datos. Permite que equipos distintos avancen y escalen por separado. A cambio, aparecen problemas de sistemas distribuidos: latencia, fallas parciales, consistencia de datos, observabilidad y complejidad operativa.

### Orientada a eventos

Los componentes se comunican publicando y consumiendo eventos ("pedido creado"). Reduce el acoplamiento y facilita reaccionar a cambios, pero hace más difícil seguir el flujo completo y razonar sobre el orden.

### Serverless

Delegas la gestión de servidores y te enfocas en funciones y servicios administrados. Excelente para cargas variables, con sus propios límites que conviene conocer.

| Estilo | Ventaja principal | Costo principal |
|---|---|---|
| Monolito | Simplicidad | Se complica al crecer sin disciplina |
| Microservicios | Independencia de equipos | Complejidad operativa |
| Orientada a eventos | Desacoplamiento | Difícil de seguir y depurar |

**No hay un estilo superior.** Los microservicios no son una meta; son una solución a ciertos problemas de escala de equipos y de sistemas.

## Principios que ayudan en cualquier estilo

- **Separa responsabilidades:** cada componente con un propósito claro.
- **Bajo acoplamiento y alta cohesión:** que las piezas dependan poco entre sí y que lo relacionado viva junto.
- **Oculta los detalles:** expón interfaces estables y esconde la implementación.
- **Decide lo más tarde que puedas** lo que sea difícil de revertir, hasta tener información.
- **Diseña para cambiar:** lo único seguro es que los requisitos cambiarán.
- **Mantenlo simple:** la complejidad innecesaria es el costo más común.

## Documentar decisiones: los ADR

Una práctica sencilla y valiosa son los **registros de decisiones de arquitectura** (Architecture Decision Records). Un documento breve por decisión, con:

1. **Contexto:** qué problema y qué restricciones había.
2. **Decisión:** qué se eligió.
3. **Alternativas** consideradas.
4. **Consecuencias:** qué se gana y qué se pierde.

Seis meses después, nadie recuerda por qué se eligió algo; el ADR evita discutir lo mismo otra vez o cambiar sin entender el contexto.

## Representar la arquitectura

Un modelo muy usado es el **C4**, que describe el sistema en cuatro niveles de zoom: contexto, contenedores, componentes y código. No necesitas todos: con los dos primeros se explica casi todo a casi cualquier audiencia.

## Errores frecuentes

- **Sobrediseñar:** construir para una escala que quizá nunca llegue.
- **Elegir tecnología por moda**, no por el problema.
- **Arquitectura solo en diagramas**, desconectada del código real.
- **El arquitecto en una torre de marfil**, sin escribir código ni escuchar al equipo.
- **No registrar las decisiones.**
- **Ignorar la arquitectura** hasta que el dolor es enorme.

## Para finalizar

La arquitectura de software se trata de decidir bien las cosas difíciles de cambiar, con claridad sobre qué atributos importan y qué compromisos aceptas. Empieza simple, documenta tus decisiones y deja que el sistema evolucione con base en lo que aprendes.

Una buena arquitectura rara vez es la más sofisticada; suele ser la más adecuada para el problema y el equipo que la sostiene.
