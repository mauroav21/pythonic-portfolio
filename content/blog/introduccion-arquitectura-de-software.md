---
title: "Arquitectura de software: cómo tomar decisiones que cuesta cambiar"
date: 2026-07-14
description: "Atributos de calidad como escenarios, estilos (monolito modular, microservicios, eventos, hexagonal), gestión de datos, evolución con funciones de aptitud, registros de decisiones (ADR), el modelo C4, deuda técnica y anti-patrones, con ejemplos."
tags: [Arquitectura, Software, Diseño]
---

Existe una definición clásica de arquitectura de software, atribuida a Martin Fowler: *"las decisiones que son difíciles de cambiar"*. Es útil porque no habla de diagramas ni de puestos. Habla de **costo de cambio**. Cambiar el nombre de una función cuesta cinco minutos; cambiar de base de datos, de estilo de comunicación entre servicios o de modelo de despliegue cuesta meses. A esas decisiones es a las que conviene dedicar atención.

Esta guía reúne lo que sirve de verdad para tomarlas: cómo traducir requisitos de calidad en decisiones, qué estilos existen y a qué costo, y cómo registrar y evolucionar lo decidido.

## Arquitectura como compromiso

Ningún sistema maximiza todas sus cualidades a la vez. Más seguridad suele costar facilidad de uso; más flexibilidad cuesta simplicidad; más rendimiento cuesta legibilidad o dinero. La arquitectura es el arte de elegir **qué cualidades importan en este sistema** y aceptar conscientemente lo que se sacrifica.

Por eso el primer paso no es elegir tecnología. Es entender **qué atributos de calidad gobiernan este sistema**.

## Atributos de calidad, como escenarios medibles

"Debe ser escalable" no sirve: no se puede diseñar ni probar. Un atributo se vuelve útil cuando se expresa como **escenario**:

> **Estímulo** + **contexto** → **respuesta esperada**, con una **medida**.

Ejemplos:

| Atributo | Escenario concreto |
|---|---|
| **Rendimiento** | "En hora pico (2 000 usuarios concurrentes), el 95 % de las búsquedas responde en menos de 400 ms" |
| **Disponibilidad** | "Ante la caída de una zona de disponibilidad, el servicio sigue atendiendo con menos de 1 minuto de degradación" |
| **Escalabilidad** | "El sistema soporta un aumento de 10× en pedidos con un incremento de costo inferior a 6×" |
| **Seguridad** | "Un usuario nunca accede a datos de otro inquilino; los intentos se registran y alertan" |
| **Modificabilidad** | "Añadir un nuevo medio de pago requiere cambiar un solo módulo y puede liberarse en menos de 2 semanas" |
| **Testabilidad** | "La lógica de precios se prueba sin base de datos en menos de 5 segundos" |
| **Operabilidad** | "Un incidente se diagnostica con logs y trazas sin acceder a los servidores" |
| **Costo** | "El costo por pedido procesado no excede 0.02 USD" |

Elige **tres o cuatro atributos dominantes**. Si todo es prioridad, nada lo es. Esos atributos (más las restricciones del negocio y la tecnología) son los **impulsores arquitectónicos** y justifican todo lo demás.

## Principios que sobreviven a las modas

1. **Separación de responsabilidades:** cada componente tiene una razón para cambiar.
2. **Alta cohesión, bajo acoplamiento:** lo que cambia junto vive junto; lo que no, depende poco.
3. **Ocultar información:** expón interfaces estables, esconde la implementación.
4. **Depender de abstracciones** en los límites (puertos), no de detalles concretos.
5. **Simplicidad:** la complejidad innecesaria es el costo más común y el más difícil de pagar.
6. **Diferir lo irreversible:** decide lo difícil de revertir lo más tarde que la información lo permita.
7. **Diseñar para el cambio** sin intentar predecirlo todo: la sobreingeniería es una apuesta perdida.

## Estilos arquitectónicos y su costo

### Monolito (y el monolito modular)

Una sola unidad de despliegue. Ventajas reales: **simplicidad** de desarrollo, pruebas, despliegue y depuración; transacciones sencillas; latencia de llamadas en proceso. Su problema no es ser monolito, sino ser un **"big ball of mud"** (todo conoce a todo).

El **monolito modular** impone límites internos claros (módulos con interfaces explícitas, sin acceso a las tablas de otros). Obtienes la mayor parte de la modularidad con un coste operativo mínimo, y deja abierta la puerta a extraer servicios después. Es una opción subestimada y una excelente base para la mayoría de equipos.

### Arquitectura en capas

Presentación → lógica de negocio → acceso a datos, con dependencias en un solo sentido. Es simple y conocida. Su riesgo: que la lógica de negocio se filtre a todas las capas, o que el acceso a datos dicte el modelo.

### Hexagonal / puertos y adaptadores / "limpia"

Pone el **dominio en el centro**, sin depender de frameworks, bases de datos ni interfaces. El dominio define **puertos** (interfaces) y la infraestructura los implementa con **adaptadores**:

```text
        ┌──────────────────────── Adaptadores de entrada ───────────────────────┐
        │  HTTP / CLI / cola / pruebas                                          │
        └──────────────┬─────────────────────────────────────────────────────────┘
                       ▼
                 [ Casos de uso ]  ←→  [ Dominio (reglas de negocio) ]
                       ▼
        ┌──────────────┴───── Puertos (interfaces) ──────────────────────────────┐
        │  RepositorioPedidos, PasarelaPagos, Reloj                               │
        └──────────────┬─────────────────────────────────────────────────────────┘
                       ▼
        Adaptadores de salida: PostgreSQL, API de pagos externa, doble de pruebas
```

Beneficio principal: **la lógica de negocio se prueba sin infraestructura** y las dependencias externas se cambian sin tocar el dominio. Un esquema de carpetas posible:

```text
src/
  dominio/        # entidades y reglas; no importa nada de fuera
  aplicacion/     # casos de uso; depende del dominio y de puertos
  puertos/        # interfaces (repositorios, servicios externos)
  adaptadores/    # http/, persistencia/, mensajeria/ (implementan puertos)
  main.py         # ensambla todo (inyección de dependencias)
```

### Microservicios

El sistema se divide en servicios pequeños, desplegables de forma independiente, normalmente con **sus propios datos**, organizados alrededor de capacidades de negocio.

**Lo que ofrecen:** despliegue independiente, escalado selectivo, aislamiento de fallos, libertad tecnológica, y sobre todo **autonomía de equipos** (la Ley de Conway: la estructura del sistema reflejará la de la organización).

**Lo que cuestan** (y se subestima): latencia y fallos de red en cada llamada; **consistencia de datos distribuidos** (sin transacciones simples); versionado de contratos; observabilidad compleja; pruebas de integración difíciles; y una **carga operativa** considerable (despliegue, monitoreo, seguridad por servicio).

Dos advertencias:

- **El monolito distribuido:** servicios que se despliegan juntos, comparten base de datos y se rompen entre sí. Tienes todo el costo de los microservicios y ninguno de los beneficios.
- **Microservicios prematuros:** dividir antes de conocer los límites del dominio fija fronteras equivocadas que son carísimas de corregir. Empezar con un monolito modular y extraer lo que lo justifique suele ser más sensato.

**Heurística honesta:** los microservicios resuelven problemas de **escala organizativa** (muchos equipos que se estorban) más que problemas técnicos. Con pocos equipos, rara vez compensan.

### Orientada a eventos

Los componentes se comunican **publicando y reaccionando a eventos** ("pedido creado"). Reduce el acoplamiento temporal y facilita reaccionar a cambios y añadir consumidores. A cambio: el flujo completo es **implícito y difícil de seguir**, el orden y la duplicación hay que manejarlos, y la **consistencia es eventual**.

Variantes que conviene manejar con cautela: **CQRS** (separar modelos de lectura y escritura) y **Event Sourcing** (guardar los eventos como fuente de verdad). Son potentes en dominios concretos y una fuente notable de complejidad si se adoptan sin necesidad.

### Serverless

Delegas servidores y escalado, y ensamblas funciones con servicios administrados. Excelente para cargas variables y equipos pequeños, con sus propios límites (tiempo de ejecución, concurrencia, observabilidad distribuida).

### Comparación

| Estilo | Fortaleza | Costo principal | Buen punto de partida cuando… |
|---|---|---|---|
| Monolito modular | Simplicidad, velocidad | Disciplina para mantener los límites | El equipo es pequeño o el dominio se está descubriendo |
| Capas | Familiaridad | Fuga de lógica entre capas | Aplicaciones CRUD sencillas |
| Hexagonal | Testabilidad, independencia tecnológica | Más estructura inicial | El dominio es complejo y duradero |
| Microservicios | Autonomía de equipos y escala selectiva | Complejidad distribuida y operativa | Hay muchos equipos y límites de dominio claros |
| Orientada a eventos | Desacoplamiento | Trazabilidad y consistencia eventual | Muchos consumidores reaccionan a lo mismo |
| Serverless | Operación mínima, escala | Límites del modelo, depuración | Cargas variables, integraciones, equipos pequeños |

## Los datos son la parte difícil

Casi toda la complejidad arquitectónica real está en los datos:

- **Una base compartida entre servicios** es acoplamiento disfrazado: cualquier cambio de esquema rompe a otros. Cada servicio debería ser dueño de sus datos y exponerlos por una API.
- **Consistencia:** las transacciones ACID simples desaparecen entre servicios. Opciones: la **saga** (secuencia de pasos locales con compensaciones), el patrón **outbox** (guardar el evento en la misma transacción que el cambio y publicarlo después) y aceptar **consistencia eventual** donde el negocio lo tolere.
- **Elige el almacenamiento según el patrón de acceso:** relacional para transacciones y consultas flexibles; clave-valor/documento para acceso por clave a gran escala; búsqueda, grafos o series de tiempo cuando el caso lo pide. Varios almacenes (*persistencia políglota*) añaden operación; hazlo con motivo.
- **Las migraciones de esquema** deben ser compatibles hacia atrás (patrón *expandir y contraer*).
- **Lectura vs escritura:** a menudo conviene separar modelos para consultas complejas.

## APIs y contratos

Los límites entre componentes son los lugares donde la arquitectura se rompe o se sostiene:

- **Diseña contratos pequeños y estables;** versiónalos; no rompas a los consumidores.
- **Principio de robustez:** sé estricto con lo que emites y tolerante con lo que recibes (con cuidado).
- **Idempotencia** en operaciones de escritura.
- **Pruebas de contrato** entre productor y consumidor.
- **Errores consistentes** y documentados.
- **Evita exponer tu modelo interno** tal cual: las APIs son compromisos de largo plazo.

## Evolución: la arquitectura no se termina

Los requisitos cambian; por tanto, la arquitectura debe poder **evolucionar**. Dos ideas útiles:

- **Funciones de aptitud (fitness functions):** pruebas automatizadas que verifican que se mantienen las propiedades arquitectónicas deseadas. Ejemplos: "ningún módulo de dominio importa de infraestructura" (con una herramienta de análisis de dependencias), "el p95 de este endpoint no supera 300 ms en la prueba de carga", "no hay ciclos entre módulos". Convierten principios en controles que se ejecutan en el pipeline, antes de que el diseño se degrade.
- **Cambios incrementales:** el **patrón estrangulador** reemplaza partes de un sistema poco a poco detrás de una fachada; evita reescrituras totales, casi siempre más largas y arriesgadas de lo previsto.

## Documentar decisiones: ADR

Un **registro de decisión de arquitectura (ADR)** es un documento breve y versionado, uno por decisión. Una plantilla útil:

```markdown
# ADR-014: Usar colas para el envío de correos transaccionales

- Estado: Aceptada (2026-07-14)
- Contexto: El servicio de correo externo falla o responde lento de forma intermitente
  y hoy bloquea el flujo de checkout (p95 de 2.4 s en hora pico).
- Decisión: El checkout publica un mensaje en una cola SQS y un consumidor envía el
  correo de forma asíncrona, con reintentos y cola de mensajes fallidos.
- Alternativas consideradas:
  1. Reintentos síncronos con tiempo de espera corto: no elimina el bloqueo.
  2. Cambiar de proveedor: no resuelve el acoplamiento temporal.
- Consecuencias:
  + El checkout deja de depender de la disponibilidad del proveedor.
  - El correo puede llegar con unos segundos de retraso.
  - Hay que operar la cola y monitorear su antigüedad y la DLQ.
```

Beneficios: seis meses después nadie recuerda **por qué**; el ADR evita discutir lo mismo otra vez, revertir sin entender, o heredar decisiones misteriosas. Si una decisión cambia, **no borres el ADR**: marca el antiguo como "Reemplazada por ADR-0XX".

## Comunicar la arquitectura: el modelo C4

Un diagrama bueno responde una pregunta para una audiencia. El **modelo C4** ofrece cuatro niveles de zoom:

1. **Contexto:** el sistema, sus usuarios y los sistemas externos con los que habla. (Para todos.)
2. **Contenedores:** las aplicaciones y almacenes que lo componen (web, API, base de datos, cola). (Para equipos técnicos.)
3. **Componentes:** los bloques internos de un contenedor. (Para quien desarrolla ahí.)
4. **Código:** clases, rara vez necesario como diagrama.

Con los dos primeros niveles se explica casi todo a casi cualquier audiencia. Mantén los diagramas **cerca del código** (en el repositorio) o generados desde él, o se desactualizarán.

## Deuda técnica

La deuda técnica es el costo futuro de decisiones tomadas por velocidad. Como la deuda financiera, **no es mala por sí misma**: tomar deuda consciente para validar una idea es razonable. Lo problemático es la deuda **no registrada** que se acumula sin pagar intereses visibles.

- **Hazla visible:** una lista priorizada con el impacto de cada elemento (¿qué ralentiza o pone en riesgo?).
- **Presupuesta su pago** de forma continua (un porcentaje de la capacidad), no "cuando haya tiempo".
- **Distingue** la deuda deliberada (con plan) de la accidental (por falta de conocimiento) y de la "bit rot" (el contexto cambió).

## Anti-patrones frecuentes

| Anti-patrón | Descripción | Alternativa |
|---|---|---|
| **Big ball of mud** | Sin estructura: todo depende de todo | Límites claros, módulos, funciones de aptitud |
| **Martillo dorado** | Usar la tecnología favorita para todo | Elegir según los atributos de calidad |
| **Desarrollo orientado al currículum** | Elegir tecnología por su atractivo profesional | Decisiones basadas en el problema y el equipo |
| **Microservicios prematuros** | Dividir antes de conocer el dominio | Monolito modular primero |
| **Monolito distribuido** | Servicios acoplados, base compartida | Autonomía real de datos y despliegue |
| **Arquitectura de torre de marfil** | Diseño sin contacto con el código ni el equipo | Arquitectura participativa; quien diseña, también construye |
| **Sobreingeniería (astronauta)** | Abstracciones para escenarios que no existen | YAGNI; abstraer cuando el segundo caso aparezca |
| **Decisiones sin registro** | "Siempre se hizo así" | ADR |
| **Ignorar los atributos no funcionales** | Solo se discuten funcionalidades | Escenarios de calidad medibles |

## Una conversación de diseño, paso a paso

Cuando te toque decidir algo importante:

1. **Aclara el problema y el contexto** (¿qué duele hoy y para quién?).
2. **Identifica los atributos de calidad dominantes** y escríbelos como escenarios.
3. **Lista las restricciones** (equipo, plazo, presupuesto, tecnología, normativa).
4. **Propón al menos dos alternativas reales**, incluida la más simple.
5. **Evalúa los compromisos** de cada una frente a los escenarios.
6. **Identifica los riesgos y cómo reducirlos** (una prueba de concepto acotada, por ejemplo).
7. **Decide y registra el ADR.**
8. **Define cómo sabrás si fue buena decisión** (una métrica, una función de aptitud) y cuándo la revisarás.

## Para finalizar

La buena arquitectura rara vez es la más sofisticada. Es la que **encaja con los atributos de calidad que importan**, con el tamaño del equipo y con la etapa del producto; la que mantiene baratos los cambios más probables; y la que deja un rastro escrito de por qué es como es.

Empieza simple, modulariza antes de distribuir, protege tus límites con pruebas automáticas, registra tus decisiones y deja que el sistema evolucione con lo que aprendes. Eso es, en esencia, todo el oficio.
