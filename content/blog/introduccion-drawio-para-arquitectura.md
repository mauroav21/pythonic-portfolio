---
title: "Introducción a draw.io para diagramar arquitectura"
date: 2026-10-30
description: "Cómo usar draw.io (diagrams.net) para crear diagramas de arquitectura claros: bibliotecas de AWS, capas, convenciones y buenas prácticas."
tags: [Arquitectura, Herramientas, Documentación]
---

Un buen diagrama de arquitectura vale más que diez párrafos, y un mal diagrama confunde más que ningún texto. La herramienta importa menos que el criterio, pero tener una herramienta gratuita, sencilla y que guarde archivos en formatos abiertos ayuda mucho. Ahí entra **draw.io**, hoy conocida también como **diagrams.net**.

## Qué es draw.io

Es un editor de diagramas gratuito y de código abierto que funciona en el navegador, como aplicación de escritorio y con integraciones para varios servicios. Lo que lo hace práctico para arquitectura:

- **Sin costo ni registro obligatorio.**
- **Control de dónde guardas:** tu computadora, Google Drive, OneDrive, GitHub y otros. Tus archivos son tuyos.
- **Bibliotecas de formas** para AWS, Azure, Google Cloud, redes, UML y más.
- **Formatos abiertos:** `.drawio` (XML), con exportación a PNG, SVG y PDF.
- **Complementos para editores:** extensión para VS Code que abre los archivos `.drawio` directamente en el repositorio.

## Primeros pasos

1. Abre la aplicación y elige dónde guardarás el archivo.
2. Crea un diagrama en blanco o parte de una **plantilla**.
3. Activa la biblioteca de **AWS** desde "Más formas" (*More Shapes*) en el panel izquierdo, y marca la que corresponda, por ejemplo "AWS Architecture 2021" o la más reciente que ofrezca tu versión.
4. Arrastra íconos al lienzo y conéctalos con flechas.

## Atajos que ahorran tiempo

- **Duplicar:** arrastrar con `Ctrl` presionado.
- **Conectar rápido:** pasa el cursor sobre una forma y arrastra desde las flechas azules.
- **Alinear y distribuir:** pestaña "Arrange", o las guías inteligentes que aparecen al mover.
- **Buscar formas:** el cuadro de búsqueda de la parte superior de las bibliotecas.
- **Agrupar:** `Ctrl+G`, para mover varios elementos como uno.

## Principios para un buen diagrama de arquitectura

### 1. Cada diagrama responde a una pregunta

No intentes mostrarlo todo en un solo lienzo. Un diagrama para explicar el flujo de una petición no es el mismo que uno para mostrar la red o la seguridad. Es mejor tener varios diagramas simples que uno ilegible.

### 2. Define la audiencia

Dirección necesita una vista general; el equipo técnico, más detalle. El modelo C4 sugiere niveles de zoom: contexto, contenedores, componentes.

### 3. Sigue un orden de lectura

De izquierda a derecha o de arriba hacia abajo. Pon al usuario o la fuente de datos al inicio y el almacenamiento al final. El ojo debe poder seguir el flujo sin buscar.

### 4. Agrupa con contenedores

Usa las formas de agrupación para **regiones, VPC, subredes y zonas de disponibilidad**. Estas fronteras comunican seguridad y red de un vistazo.

### 5. Etiqueta todo lo que importa

- Un nombre debajo de cada ícono.
- Un texto breve sobre las flechas: "HTTPS", "evento", "lectura".
- **Una leyenda** si usas colores o estilos con significado.

### 6. Sé consistente

Mismos íconos para lo mismo, mismo estilo de líneas, misma tipografía. Define: línea continua para flujo de datos, punteada para flujo asíncrono, por ejemplo, y escríbelo en la leyenda.

### 7. Reduce el ruido

- Evita cruces de líneas innecesarios.
- Elimina lo que no aporta.
- Deja espacio en blanco.
- No uses decenas de colores; pocos y con propósito.

## Un ejemplo de estructura

Para una aplicación web en AWS:

| Elemento | Cómo representarlo |
|---|---|
| Usuarios | Ícono al extremo izquierdo |
| Entrada | Route 53 → CloudFront → balanceador, en una columna |
| Red | Contenedor VPC con subredes públicas y privadas |
| Cómputo | Instancias o contenedores dentro de la subred correspondiente |
| Datos | Base de datos en subred privada, en otra zona para la réplica |
| Soporte | Monitoreo y seguridad en una franja aparte |

## Diagramas junto al código

Una práctica muy útil: guarda el archivo `.drawio` **en el repositorio**, junto al código que describe. Así:

- Los cambios al diagrama se revisan en el mismo pull request.
- El diagrama tiene historial y no se pierde.
- Evitas la imagen desactualizada pegada en un wiki.

Para que el diagrama se vea en un README, exporta a **PNG o SVG** y referéncialo. Hay una opción de exportar con los datos del diagrama incrustados, lo que permite volver a editar la propia imagen.

## Alternativas, para ser justos

Si prefieres **diagramas como código**, existen Mermaid, PlantUML y Structurizr, que versionan mejor con texto y se generan automáticamente. Para diagramas con estilo visual, draw.io es más flexible. Muchos equipos usan ambos según el caso.

## Errores frecuentes

- **Diagrama gigante con todo.**
- **Íconos sin etiqueta**, que obligan a adivinar.
- **Sin leyenda** cuando hay colores o líneas con significado.
- **Diagramas desactualizados** que nadie corrige: peor que no tenerlos.
- **Mezclar niveles de detalle** (una base de datos junto a una clase).
- **Sin fecha ni versión**, que impide saber si sigue vigente.

## Para finalizar

draw.io no te hará un buen arquitecto, pero elimina excusas: es gratuito, fácil y mantiene tus archivos en formatos abiertos. Lo importante es el criterio: una pregunta por diagrama, un orden de lectura claro, agrupaciones que comuniquen límites y etiquetas en todo.

Un diagrama es una forma de conversación; si alguien tiene que preguntarte qué significa, aún no está terminado.
