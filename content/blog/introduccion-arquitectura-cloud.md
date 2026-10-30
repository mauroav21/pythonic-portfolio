---
title: "Arquitectura cloud: principios para diseñar sistemas que sobrevivan a los fallos"
date: 2026-09-02
description: "Modelos de servicio, responsabilidad compartida, regiones y zonas, los seis pilares del Well-Architected Framework con prácticas concretas, patrones de resiliencia, estrategias de recuperación ante desastres (RTO/RPO), cuentas múltiples, migración y una arquitectura de referencia."
tags: [Cloud, Arquitectura, AWS]
---

"Migrar a la nube" suele significar mover servidores de un lugar a otro. Si eso es todo lo que haces, obtienes la complejidad de la nube con las limitaciones de tu centro de datos: las mismas máquinas frágiles, ahora con facturación por hora. La nube cambia las reglas del juego, pero solo si diseñas para ellas.

Esta guía recorre los principios que separan una arquitectura "alojada en la nube" de una arquitectura **diseñada para la nube**.

## Qué cambia realmente

Según la definición del NIST, la computación en la nube se caracteriza por:

- **Autoservicio bajo demanda:** creas recursos al instante, sin tickets.
- **Acceso amplio por red** y mediante **APIs**: todo es programable.
- **Agrupación de recursos:** el proveedor atiende a muchos clientes con la misma infraestructura.
- **Elasticidad rápida:** creces y decreces con la demanda.
- **Servicio medido:** pagas por lo que usas.

Las dos consecuencias de diseño más profundas:

1. **Todo es una API**, así que **todo puede ser código** (infraestructura como código, pipelines, políticas).
2. **La infraestructura es desechable y los fallos son normales.** Lo que escala a millones de máquinas falla a diario; tu sistema debe asumirlo.

Werner Vogels lo resumió con una frase que se ha repetido mucho: *"todo falla, todo el tiempo"*. Diseñar para la nube es diseñar para eso.

## Modelos de servicio: cuánto operas tú

| Modelo | Tú gestionas | El proveedor gestiona | Ejemplos en AWS |
|---|---|---|---|
| **IaaS** | SO, runtime, aplicación, datos | Hardware, virtualización, red física | EC2, EBS, VPC |
| **CaaS** | Contenedores y su configuración | Plano de control (y los hosts, en Fargate) | ECS, EKS, Fargate |
| **PaaS** | Aplicación y datos | Plataforma completa | Elastic Beanstalk, App Runner |
| **FaaS / serverless** | Código y configuración | Todo lo demás | Lambda, Step Functions, DynamoDB |
| **SaaS** | Uso y datos | Todo | Correo, CRM, herramientas en línea |

A medida que subes en la tabla, **operas menos y controlas menos**. No hay un nivel correcto: la pregunta es *dónde te diferencias*. Operar bases de datos, parchar servidores o gestionar clústeres rara vez diferencia tu negocio; delégalo cuando puedas, y quédate con el control donde sí importa.

## Modelo de responsabilidad compartida

Es el concepto más malinterpretado de la nube:

- El proveedor es responsable de la seguridad **DE** la nube: instalaciones, hardware, red, el software base de los servicios.
- Tú eres responsable de la seguridad **EN** la nube: tus datos, tus identidades y accesos, tu configuración, tu red, tu sistema operativo (si lo gestionas), tus aplicaciones y el cumplimiento normativo.

El reparto **cambia con el servicio**: en EC2 parchas el sistema operativo; en RDS lo hace el proveedor pero sigues siendo responsable del acceso y los datos; en S3 eres responsable de las políticas y el cifrado. Casi todos los incidentes en la nube provienen de **configuración del cliente** (un bucket abierto, una credencial expuesta, un permiso excesivo), no de fallas del proveedor.

## Geografía: regiones, zonas y borde

- **Región:** área geográfica independiente (por ejemplo, `us-east-1`, `sa-east-1`). Los datos **no salen** de la región salvo que tú lo decidas. Elige por **latencia, cumplimiento normativo, disponibilidad de servicios y precio**.
- **Zona de disponibilidad (AZ):** uno o más centros de datos con energía, refrigeración y red independientes dentro de una región, conectados con baja latencia. Están separadas lo suficiente para no compartir un mismo desastre, y lo bastante cerca para replicar de forma síncrona.
- **Ubicaciones de borde:** puntos de presencia cercanos al usuario (CDN, DNS).

Regla de oro: **todo lo importante en al menos dos zonas.** Multirregión es otro nivel de complejidad y costo; úsalo cuando el requisito de negocio (tolerar la caída de una región, normativa, latencia global) lo justifique, no por defecto.

## Los seis pilares del Well-Architected Framework

AWS publica un marco de buenas prácticas, útil incluso fuera de AWS, con seis pilares. Es una excelente **lista de revisión** para cualquier diseño:

### 1. Excelencia operativa

*Operar y mejorar el sistema con el menor esfuerzo.*

- **Infraestructura como código** y despliegues automatizados.
- Cambios **pequeños, frecuentes y reversibles**.
- **Observabilidad** (métricas, logs, trazas) y alarmas accionables.
- **Guías de operación** (*runbooks*) y análisis posteriores a incidentes sin culpables.
- Prueba la respuesta a fallos (ejercicios, *game days*).

### 2. Seguridad

*Proteger datos, sistemas y activos.*

- **Identidad:** mínimo privilegio, credenciales temporales, MFA.
- **Detección:** registro de auditoría (CloudTrail), monitoreo de configuración y amenazas.
- **Protección de infraestructura:** redes segmentadas, defensa en capas.
- **Protección de datos:** clasificación, **cifrado en reposo y en tránsito**, gestión de llaves.
- **Respuesta a incidentes** preparada y ensayada.

### 3. Fiabilidad

*Funcionar de forma correcta y recuperarse de fallos.*

- **Cambia la pregunta:** de "cómo evito que falle" a "cómo se comporta cuando falla".
- **Multi-AZ** para todo lo que importa.
- **Escalado automático** y gestión de cuotas.
- **Respaldos y recuperación probados.**
- **Límites de tiempo, reintentos con espera exponencial y jitter, y disyuntores.**

### 4. Eficiencia de rendimiento

*Usar los recursos adecuados y adaptarlos.*

- Elige el **tipo de servicio y de recurso** apropiados (cómputo, almacenamiento, base de datos).
- **Mide** y ajusta con datos, no con intuición.
- **Cachés** y CDN para acercar los datos al usuario.
- Revisa nuevas opciones periódicamente.

### 5. Optimización de costos

*Entregar valor al menor precio.*

- **Paga solo por lo que usas:** apaga lo ocioso, escala hacia abajo.
- **Dimensiona** según uso real.
- **Modelos de compra** (compromisos para lo estable, Spot para lo flexible).
- **Visibilidad:** etiquetas, presupuestos, alertas.
- **FinOps:** ingeniería, finanzas y negocio comparten la responsabilidad.

### 6. Sostenibilidad

*Minimizar el impacto ambiental.*

- Usa instancias eficientes (por ejemplo, Graviton), **escala para ajustar la capacidad a la demanda**, elige regiones con menor huella y elimina el almacenamiento y cómputo innecesarios.

Los pilares **tienen tensiones**: más fiabilidad cuesta más; más seguridad puede reducir agilidad. Una buena arquitectura es la que elige esos compromisos de forma consciente.

## Patrones de resiliencia: cómo se diseña para el fallo

| Patrón | Qué resuelve |
|---|---|
| **Redundancia en varias zonas** | La caída de un centro de datos |
| **Verificaciones de salud + reemplazo automático** | Instancias que mueren o se cuelgan |
| **Balanceo de carga** | Reparto y retiro automático de lo no sano |
| **Tiempos de espera (timeouts)** | Que una dependencia lenta bloquee a todos |
| **Reintentos con espera exponencial y *jitter*** | Fallos transitorios, sin avalanchas sincronizadas |
| **Disyuntor (circuit breaker)** | Dejar de golpear a una dependencia caída y dejar que se recupere |
| **Mamparos (bulkheads)** | Aislar recursos para que un fallo no se propague |
| **Colas y desacoplamiento** | Picos y dependencias lentas |
| **Degradación elegante** | Seguir ofreciendo lo esencial cuando algo secundario falla |
| **Idempotencia** | Que reintentar no cause efectos duplicados |
| **Limitación de tasa y carga (load shedding)** | Sobrevivir a picos que superan la capacidad |

Un detalle que se olvida: los **reintentos sin espera ni límite** pueden convertir una degradación en un colapso (todos reintentan a la vez sobre un servicio que apenas respira). Siempre con *backoff* y *jitter*.

## Sin estado, y con el estado en el lugar correcto

La escalabilidad horizontal y la sustituibilidad de las máquinas exigen que la capa de cómputo sea **sin estado** (*stateless*): ninguna instancia guarda en local nada que no pueda perder.

- **Sesiones:** en un almacén compartido (caché, base de datos) o tokens firmados.
- **Archivos:** en almacenamiento de objetos, no en el disco local.
- **Configuración:** externa (parámetros, variables), no incrustada.
- **El estado vive en servicios diseñados para él:** bases de datos, caches, colas, S3.

Esto convierte a las instancias en **ganado, no mascotas**: reemplazables sin pensar.

## Acoplamiento débil y asincronía

Los sistemas acoplados fallan juntos. Reduce el acoplamiento:

- **Colas y eventos** entre componentes en lugar de llamadas síncronas encadenadas.
- **Contratos estables** (APIs versionadas) entre equipos.
- **Cada componente con su propio almacén de datos**, siempre que sea posible.

Una cadena de cinco llamadas síncronas con cada servicio al 99.9 % de disponibilidad da (aproximadamente) 99.5 % de disponibilidad conjunta: la **disponibilidad se multiplica** a lo largo de la cadena. Cuantas menos dependencias síncronas en el camino crítico, mejor.

## Recuperación ante desastres: RTO, RPO y cuatro estrategias

Dos números que debes acordar con el negocio:

- **RPO (Recovery Point Objective):** cuántos datos puedes permitirte perder (medido en tiempo).
- **RTO (Recovery Time Objective):** cuánto tiempo puedes estar caído.

Cuanto menores, más caro. Las estrategias clásicas, de menor a mayor costo:

| Estrategia | Descripción | RTO / RPO típicos | Costo |
|---|---|---|---|
| **Copia de seguridad y restauración** | Respaldos en otra región; restauras cuando ocurre el desastre | Horas | Muy bajo |
| **Luz piloto (pilot light)** | Núcleo mínimo (datos replicados) siempre encendido; el resto se levanta al fallar | Decenas de minutos a horas | Bajo |
| **Espera templada (warm standby)** | Versión reducida pero funcional del sistema, siempre corriendo | Minutos | Medio |
| **Activo-activo multirregión** | Ambas regiones sirven tráfico | Segundos a minutos | Alto, con complejidad de datos |

Lo esencial: **un plan de recuperación no probado no es un plan.** Programa ejercicios, mide el RTO real y automatiza la recuperación con infraestructura como código.

## Cuentas, entornos y gobierno

Un error de arranque frecuente es **una sola cuenta de nube para todo**. Es más seguro y más fácil de gobernar **separar en varias cuentas**:

- Una cuenta (o más) por **entorno**: producción aislada de desarrollo.
- Cuentas dedicadas para **seguridad, registros centralizados y herramientas compartidas**.
- Límites naturales de **permisos, cuotas y costos**.
- Políticas de organización (SCP) que fijan el techo de lo permitido.
- Un **"landing zone"**: una base de cuentas, redes e identidad preconfigurada y repetible (por ejemplo, con AWS Control Tower).

## Infraestructura como código

Si algo existe solo porque alguien hizo clics en una consola, no es reproducible ni auditable.

- **Define todo en código** (CloudFormation, CDK, Terraform), versionado y revisado.
- **Crea entornos idénticos** a demanda (incluso efímeros para pruebas).
- **Evita la deriva (drift):** cambios manuales que divergen del código; detéctala y corrígela.
- **Estado y módulos** con cuidado: divide en pilas pequeñas con ciclos de vida distintos (red, datos, aplicación).

## Migrar a la nube: las "7 R"

Una forma de clasificar qué hacer con cada aplicación:

| Estrategia | Qué es | Cuándo |
|---|---|---|
| **Retirar (Retire)** | Apagarla | Ya no aporta valor |
| **Retener (Retain)** | Dejarla donde está | No es viable migrar ahora |
| **Re-hospedar (Rehost, "lift and shift")** | Mover tal cual | Salir rápido de un centro de datos; poca optimización |
| **Reubicar (Relocate)** | Mover a nivel de plataforma sin reescribir (por ejemplo, VMware) | Cargas virtualizadas |
| **Re-plataformar (Replatform)** | Pequeños cambios para aprovechar servicios administrados (BD gestionada) | Ganancia notable con poco esfuerzo |
| **Recomprar (Repurchase)** | Cambiar a un SaaS | Aplicaciones estándar |
| **Refactorizar (Refactor/Re-architect)** | Rediseñar para la nube | Alto valor de negocio y necesidad de escala/agilidad |

Mover tal cual **rara vez ahorra dinero** por sí solo: es el primer paso, no el destino. El valor llega al adoptar servicios administrados, automatizar y ajustar el tamaño.

## Una arquitectura de referencia: aplicación web de tres capas

```text
Usuarios
  │  DNS (Route 53) → CDN (CloudFront + WAF)
  ▼
Balanceador (subredes públicas, 3 zonas)
  ▼
Aplicación: contenedores/instancias sin estado (subredes privadas, 3 zonas, escalado automático)
  ├──► Caché (ElastiCache) ── sesiones y datos calientes
  ├──► Base de datos administrada (Multi-AZ) ── subredes privadas de datos
  ├──► Colas/eventos (SQS/SNS/EventBridge) ── trabajo asíncrono
  └──► Objetos (S3) ── archivos, con acceso mediante URL prefirmadas
Transversal: IAM (mínimo privilegio), KMS (cifrado), CloudWatch (observabilidad),
             CloudTrail/Config (auditoría), IaC, CI/CD, respaldos
```

Qué la hace "buena": sin puntos únicos de falla, estado fuera del cómputo, desacoplamiento asíncrono, seguridad en capas, observabilidad y todo reproducible desde código.

## Errores frecuentes

- **Lift and shift sin repensar** y esperar ahorros automáticos.
- **Una sola zona** para sistemas importantes.
- **Estado guardado en instancias**, que impide reemplazarlas.
- **Sin infraestructura como código:** entornos únicos, imposibles de recrear.
- **Permisos excesivos** "para que funcione".
- **Cuenta única** para desarrollo y producción.
- **Ignorar los costos** hasta la primera factura (y no etiquetar nada).
- **Multirregión por moda,** pagando una complejidad que el negocio no pidió.
- **Respaldos sin probar la restauración.**
- **Cadenas síncronas largas** que multiplican las fallas.
- **Reintentos sin límite** que amplifican las caídas.
- **Tratar la seguridad como una fase final** y no como parte del diseño.

## Preguntas para una revisión de arquitectura

1. ¿Qué pasa si cae una zona? ¿Y una dependencia clave?
2. ¿Cuáles son el RTO y el RPO acordados, y los hemos **probado**?
3. ¿Dónde está el estado, y cómo se respalda?
4. ¿Cómo sé que está fallando antes que mis usuarios?
5. ¿Quién puede hacer qué, y con qué credenciales?
6. ¿Puedo reconstruir todo desde el repositorio?
7. ¿Cuánto cuesta, quién lo ve y qué pasa si se duplica el tráfico?
8. ¿Cuál es el siguiente cuello de botella?

## Para finalizar

Una buena arquitectura cloud no es la que usa más servicios, sino la que asume que todo falla, mantiene el estado en el lugar correcto, se reconstruye desde código y hace explícitos sus compromisos entre costo, seguridad, rendimiento y fiabilidad.

Si solo tuvieras tiempo de revisar una cosa, revisa lo que ocurre cuando falla una zona. Esa respuesta suele revelar casi todo lo demás.
