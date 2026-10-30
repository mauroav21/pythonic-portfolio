---
title: "El futuro de la web: datos propios, estándares abiertos e IA"
date: 2026-10-08
description: "Propuestas para una web más abierta: web semántica, Solid, identidad descentralizada y el efecto de la inteligencia artificial en la web."
tags: [Web, Futuro, Inteligencia Artificial]
---

*Tercero de tres artículos sobre la historia de la web y las preguntas que sigue abiertas.*

Si la web actual concentra datos y poder en pocas plataformas, ¿hay alternativas técnicas? Sí, varias. Algunas son experimentales, otras han avanzado poco y otras apenas empiezan. Vale la pena conocerlas, con espíritu crítico, para entender hacia dónde podría ir la web.

## La web semántica: datos que las máquinas entienden

La **web semántica** fue una idea temprana de Berners-Lee: además de páginas para humanos, publicar datos estructurados con significado explícito, de modo que las máquinas pudieran relacionarlos y razonar sobre ellos.

Piezas técnicas relacionadas:

- **RDF:** un modelo para describir cosas y sus relaciones como tripletas (sujeto, predicado, objeto).
- **Ontologías y vocabularios:** definen el significado de los términos.
- **Datos enlazados (Linked Data):** conectar datos de distintas fuentes mediante URL.
- **Schema.org:** un vocabulario común que los buscadores usan para entender páginas; es la parte de la web semántica que más se ha adoptado.

La visión completa no se materializó tal como se imaginó, pero sus ideas viven en grafos de conocimiento, buscadores y datos abiertos.

## Solid: que los datos sean tuyos

**Solid** (de "social linked data") es un proyecto liderado por Berners-Lee, impulsado también por la empresa Inrupt. La idea: separar los **datos** de las **aplicaciones**.

| Modelo actual | Modelo Solid |
|---|---|
| Cada aplicación guarda tus datos en sus servidores | Tus datos viven en un "pod" personal que tú controlas |
| Cambiar de servicio implica perder o migrar datos | Las aplicaciones piden permiso para leer o escribir en tu pod |
| La plataforma decide quién accede | Tú decides y puedes revocar |

La propuesta es atractiva: podrías usar varias aplicaciones con los mismos datos y cambiar de una a otra sin perder nada. Los retos son grandes: adopción, modelo de negocio, facilidad de uso, interoperabilidad real entre aplicaciones y quién aloja los pods. Es un proyecto vivo, aún lejos de ser masivo.

## Identidad descentralizada

Hoy muchas veces "iniciamos sesión con" una gran plataforma, que se convierte en dueña de nuestra identidad en línea. Varios estándares buscan que la identidad sea portable:

- **Identificadores descentralizados (DID)** y **credenciales verificables**, estándares del W3C.
- **Passkeys (FIDO2/WebAuthn):** autenticación sin contraseñas basada en criptografía, que reduce el phishing y no depende de que recuerdes claves.

Los passkeys sí están ganando adopción real y son una mejora concreta en seguridad y comodidad.

## Redes sociales federadas y protocolos abiertos

Otra línea de trabajo propone redes sociales basadas en **protocolos abiertos**, en las que varios servidores interoperan, algo parecido a cómo funciona el correo electrónico:

- **ActivityPub:** estándar del W3C, usado por Mastodon y otros servicios.
- **AT Protocol:** protocolo abierto detrás de Bluesky.

Ofrecen portabilidad de cuentas y variedad de servidores, con retos propios de moderación, financiamiento y experiencia de uso.

## Lo que hace la inteligencia artificial a la web

La IA generativa cambia el panorama en varias direcciones a la vez:

- **Más contenido generado**, con un riesgo creciente de ruido y de información poco fiable.
- **Asistentes que responden directamente** en lugar de enviar a sitios, lo que cambia el tráfico y los incentivos de quienes publican.
- **Debates sobre derechos:** uso de contenido público para entrenar modelos, atribución y compensación.
- **Agentes que navegan y actúan** en nombre de personas, lo que plantea preguntas de identidad, autorización y seguridad.
- **Autenticidad:** surgen iniciativas para certificar el origen del contenido, como estándares de procedencia.

No está claro cómo se resolverá. Lo seguro es que las decisiones sobre acceso abierto, datos de entrenamiento y atribución moldearán la web de la próxima década.

## Criterios para evaluar cualquier propuesta

Cuando aparezca otra "nueva web", sirven estas preguntas, inspiradas en los principios originales:

1. **¿Es abierta?** ¿Puede cualquiera implementarla sin pedir permiso?
2. **¿Es interoperable?** ¿Funciona entre distintos proveedores?
3. **¿Quién controla los datos y la identidad?**
4. **¿Es accesible y usable** para personas no técnicas?
5. **¿Tiene un modelo sostenible** que no dependa de explotar a los usuarios?
6. **¿Puede fallar con gracia,** sin un único punto de control?

## Para finalizar

El futuro de la web no está escrito. Las propuestas técnicas, como Solid, identidad descentralizada, protocolos federados o passkeys, tienen avances desiguales; ninguna es una solución mágica. Lo que sí es claro es que la apertura y la universalidad que hicieron grande a la web se defienden con decisiones concretas de diseño, de negocio y de política.

Quienes trabajamos con tecnología participamos en esa historia cada vez que elegimos un estándar, un modelo de datos o una forma de tratar a las personas usuarias. La historia de la web sigue inconclusa, y también nos toca escribirla.
