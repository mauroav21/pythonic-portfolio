---
title: "Amazon EC2 a fondo: instancias, almacenamiento, escalado y costos sin sorpresas"
date: 2026-07-02
description: "Cómo elegir tipo de instancia, modelo de compra y almacenamiento en EC2; Auto Scaling, imágenes inmutables, seguridad de acceso, costos reales y los errores que se repiten en producción."
tags: [AWS, EC2, Cómputo]
---

EC2 es el servicio más antiguo y más flexible de AWS, y por eso el más fácil de usar mal. Lanzar una instancia toma dos minutos; operarla bien durante tres años implica decisiones sobre imágenes, parches, discos, redes, escalado, compras y apagados que nadie toma el primer día y todos pagan después.

Este artículo recorre esas decisiones en el orden en que aparecen.

## El modelo: una instancia es desechable (aunque no lo parezca)

Una instancia EC2 es una máquina virtual sobre el sistema **Nitro**: un hipervisor ligero con tarjetas dedicadas para red, almacenamiento y seguridad. Lo que importa en la práctica:

- **Se crea desde una AMI** (imagen) más una configuración (tipo, red, discos, rol, datos de usuario).
- **Tiene un ciclo de vida:** `pending → running → stopping → stopped → terminated`. Detenida no cobra cómputo (sí cobra sus discos EBS y IP elástica). **Terminada** se destruye, y con ella el almacén de instancia y, por defecto, el volumen raíz.
- **Puede desaparecer.** Falla de hardware, evento de mantenimiento, interrupción de Spot. Quien trate una instancia como mascota (configurada a mano, irremplazable) aprende esto un día malo.

La actitud correcta: **cualquier instancia debe poder reconstruirse automáticamente.** Si no puedes destruirla y obtener otra idéntica sin esfuerzo, tienes deuda operativa.

## Elegir el tipo de instancia

El nombre codifica la información: `m7g.xlarge` = familia **m** (uso general), generación **7**, procesador **g** (Graviton), tamaño **xlarge**.

| Familia | Característica | Casos |
|---|---|---|
| **T** (t3, t4g) | Rendimiento con ráfagas por créditos de CPU | Desarrollo, sitios pequeños, cargas con poco uso medio |
| **M** | Equilibrio CPU/memoria | Aplicaciones web, servidores de aplicaciones |
| **C** | Más CPU por memoria | Procesamiento por lotes, codificación, servidores de juegos |
| **R / X** | Mucha memoria | Cachés, bases de datos en memoria, analítica |
| **I / D** | Almacenamiento local rápido o denso | Bases NoSQL, almacenes de datos |
| **P / G / Inf / Trn** | GPU y aceleradores | Entrenamiento e inferencia de IA, gráficos |

Sufijos frecuentes: `a` (AMD), `i` (Intel), `g` (Graviton, ARM), `d` (con disco local NVMe), `n` (red mejorada).

### Graviton (arm64)

Las instancias con procesadores Graviton suelen ofrecer mejor relación precio/rendimiento. El requisito es que tu software compile o tenga imágenes para **arm64**. La mayoría de lenguajes modernos y de contenedores lo soportan; revisa dependencias nativas. Mide con tu carga antes de migrar todo.

### El caso de las T: créditos de CPU

Una `t3.medium` tiene una **línea base** de uso de CPU (20 % por vCPU en ese tamaño). Mientras estás por debajo, acumulas créditos; por encima, los gastas. Si se agotan:

- En modo **estándar**, la CPU se frena a la línea base (síntoma: la aplicación "se vuelve lenta" sin explicación).
- En modo **ilimitado** (el predeterminado en T3 y posteriores), sigue rindiendo pero **cobra por los créditos excedentes**.

Una T con CPU sostenida alta es un error de dimensionamiento: una M o C de tamaño similar puede salir más barata.

## Modelos de compra: la diferencia entre pagar 100 y pagar 40

| Modelo | Compromiso | Descuento típico frente a bajo demanda | Riesgo |
|---|---|---|---|
| **Bajo demanda** | Ninguno | 0 % | Es la opción cara si la carga es estable |
| **Savings Plans (Compute / EC2 Instance)** | 1 o 3 años de gasto por hora | Alto; el plan Compute es flexible entre familias, regiones, Fargate y Lambda | Pagas aunque no uses el compromiso |
| **Reservas estándar / convertibles** | 1 o 3 años de una configuración | Similar | Menos flexibles que los Savings Plans |
| **Spot** | Ninguno, pero AWS puede reclamar la capacidad con **aviso de 2 minutos** | Hasta ~90 % | Interrupciones; solo para cargas tolerantes |
| **Capacity Reservations** | Reserva capacidad en una zona | Ninguno por sí solo | Pagas por capacidad no usada |

Los descuentos concretos varían por región, familia, plazo y forma de pago; calcúlalos en la calculadora oficial.

Una estrategia razonable: **base estable cubierta con Savings Plans, picos con bajo demanda, y trabajos tolerantes a interrupción (CI, lotes, procesamiento de datos) en Spot** con múltiples tipos de instancia para aumentar la probabilidad de capacidad. Compra compromisos **después** de medir un par de meses; comprometer a ciegas es otra forma de desperdicio.

## Almacenamiento: EBS, instance store y los demás

### EBS (Elastic Block Store)

Discos de red persistentes, conectados a una instancia en la misma zona.

| Tipo | Uso | Notas |
|---|---|---|
| **gp3** | Propósito general (la opción por defecto hoy) | Base de 3 000 IOPS y 125 MiB/s **independientes del tamaño**; subes IOPS y ancho de banda por separado y pagas solo eso |
| **gp2** | Anterior | IOPS atados al tamaño; casi siempre conviene migrar a gp3 |
| **io2 / io2 Block Express** | Bases de datos exigentes | IOPS aprovisionados altos y latencia consistente |
| **st1 / sc1** | Flujos secuenciales grandes (HDD) | Cargas de datos grandes, archivo |

Puntos prácticos:

- **Los snapshots son incrementales** y viven en S3 (administrado por AWS). El primero copia todo; los siguientes, solo los bloques cambiados. Automatízalos con **Data Lifecycle Manager** o AWS Backup.
- **Cifra los volúmenes** (y activa el cifrado por defecto en la región). Cifrar un volumen existente implica crear un snapshot cifrado y un volumen nuevo.
- **Un volumen no se comparte entre zonas.** Para moverlo, snapshot y restauración en otra zona.
- **Al terminar una instancia, el volumen raíz se elimina por defecto**, pero los volúmenes adicionales **no**: un clásico de volúmenes huérfanos que siguen cobrando.

### Almacén de instancia (instance store)

Discos NVMe físicos del host, muy rápidos, **efímeros**: sus datos se pierden si la instancia se detiene, termina o falla el host. Son útiles para cachés, búferes y datos temporales. Nunca guardes allí lo único que existe.

### EFS y FSx

Si varias instancias necesitan el mismo sistema de archivos, **EFS** (NFS administrado) o **FSx** (Windows, Lustre, NetApp ONTAP, OpenZFS). Cuestan más por GB que EBS; úsalos cuando el requisito sea compartir.

## Acceso: deja de abrir SSH

El patrón antiguo: grupo de seguridad con el puerto 22 abierto, un par de llaves compartido por todo el equipo y una IP pública. Cada elemento es un riesgo.

El patrón actual:

1. **AWS Systems Manager Session Manager:** abre una sesión de terminal o reenvío de puertos **sin abrir puertos de entrada**, sin llaves y con **registro de sesiones** en CloudTrail/S3. Requiere el agente SSM y un rol con la política adecuada.
2. **Sin IP pública** para las instancias de aplicación, detrás de un balanceador.
3. **Roles de instancia** (perfil de instancia) para que el código acceda a AWS, nunca llaves de acceso en la máquina.

### IMDSv2: cierra una puerta clásica

El **servicio de metadatos de instancia** (169.254.169.254) entrega, entre otras cosas, las credenciales temporales del rol. La versión 1 se podía explotar mediante una vulnerabilidad SSRF en tu aplicación para robarlas. **IMDSv2** exige un token de sesión, lo que mitiga ese ataque. Exige IMDSv2 en tus plantillas de lanzamiento (`HttpTokens: required`) y reduce el límite de saltos (`HttpPutResponseHopLimit`) a lo necesario.

## Redes en dos párrafos

La instancia vive en una subred de una VPC con **grupos de seguridad** (firewall con estado). Permite lo mínimo: referencia **otros grupos** como origen en lugar de rangos de IP. Las **IP públicas** de IPv4 se cobran por hora desde 2024, así que no asignes públicas sin necesidad. Las **IP elásticas** sirven para direcciones fijas, aunque casi siempre es mejor un balanceador con DNS.

El ancho de banda depende del tamaño de la instancia, y los tamaños pequeños tienen límites "hasta X Gbps" con ráfagas. Si una carga es sensible a la red, revisa los límites del tipo concreto y no solo la CPU.

## Escalado y alta disponibilidad

Una sola instancia es un punto único de falla. El patrón estándar:

```text
Usuarios → ALB (varias zonas) → Auto Scaling Group (varias zonas)
                                   └─ instancias creadas desde una plantilla de lanzamiento
```

- **Plantilla de lanzamiento (launch template):** AMI, tipo(s), red, rol, datos de usuario, IMDSv2, discos, etiquetas. Versionada.
- **Auto Scaling Group (ASG):** mantiene el número deseado de instancias, las reparte en zonas, reemplaza las no saludables y escala por políticas.
- **Políticas de escalado:** la más simple y efectiva es **target tracking** ("mantén la CPU media al 50 %" o "mantén N solicitudes por instancia"). Los escalados programados cubren patrones conocidos (picos de lunes por la mañana).
- **Verificaciones de salud:** usa las del balanceador (ELB) además de las de EC2, para que una instancia viva pero con la aplicación caída se reemplace.
- **Refresco de instancias (instance refresh):** despliega una nueva AMI reemplazando gradualmente, con porcentaje mínimo saludable.
- **Warm pools:** instancias preinicializadas para acortar el arranque si tu inicialización es lenta.
- **Política de mezcla de instancias:** combina bajo demanda y Spot y varios tipos para mejor capacidad y precio.

Un detalle que sorprende: el escalado no es instantáneo. Entre que sube la métrica, se evalúa la alarma, se lanza la instancia, arranca y pasa la verificación de salud, pasan minutos. Si la carga sube más rápido que eso, necesitas colchón o escalado programado.

## Imágenes: la clave para reconstruir sin dolor

Hay dos estrategias para configurar una instancia nueva:

| | Configurar al arrancar (user data / herramientas) | **AMI preconstruida ("horneada")** |
|---|---|---|
| Arranque | Lento; depende de repositorios externos | Rápido |
| Reproducibilidad | Puede variar con el tiempo (versiones de paquetes) | Idéntica |
| Fallo en emergencia | Si el repositorio cae, no escalas | Independiente |
| Mantenimiento | Cambias el script | Reconstruyes la imagen |

Un buen equilibrio: **AMI base parchada y endurecida** (creada con **EC2 Image Builder** o Packer en un pipeline) y un poco de configuración dinámica al arrancar (variables, secretos). Los **datos de usuario** se ejecutan una vez al primer arranque por defecto; no sirven para cambios continuos.

## Observabilidad

- **CloudWatch** da por defecto métricas de CPU, red y disco por instancia (cada 5 minutos; el monitoreo detallado baja a 1 minuto con costo). **No incluye memoria ni espacio en disco**: instala el **agente de CloudWatch**.
- **Verificaciones de estado:** del sistema (hardware del host) y de la instancia (sistema operativo). La recuperación automática reinicia en otro host si falla la primera.
- **Registros:** envía los de la aplicación y del sistema a CloudWatch Logs; no dependas del disco de la instancia.
- **Alarmas** útiles: CPU sostenida, créditos de CPU (en T), estado fallido, espacio en disco, errores 5XX en el balanceador.

## Dónde se va el dinero

Una factura de EC2 raramente es solo "instancias":

| Concepto | Qué vigilar |
|---|---|
| **Instancias** | Sobredimensionamiento, instancias olvidadas, falta de compromisos en carga estable |
| **EBS** | Volúmenes huérfanos, snapshots antiguos sin política, IOPS aprovisionados de más |
| **Transferencia de datos** | Salida a internet, entre regiones y **entre zonas de disponibilidad** (se cobra por GB en ambos sentidos) |
| **IPv4 públicas** | Se cobran por hora |
| **NAT Gateway** | Por hora y por GB procesado |
| **Balanceadores** | Por hora y por unidades de capacidad |
| **Licencias** | Windows, SQL Server, RHEL: incluidas en el precio |

Hábitos que funcionan:

1. **Etiqueta** todo (`proyecto`, `entorno`, `responsable`) y activa etiquetas de asignación de costos.
2. **Revisa con AWS Compute Optimizer**, que recomienda tamaños según uso real.
3. **Apaga lo que no se usa:** entornos de desarrollo fuera de horario (con un programador sencillo o Instance Scheduler).
4. **Limpia periódicamente** volúmenes sin adjuntar, snapshots sin dueño, IP sin asociar y AMI obsoletas.
5. **Define alertas de presupuesto.**

## Los gotchas, al punto

- **Instancia T con créditos agotados:** lenta de forma misteriosa, o cobrando excedentes.
- **Volúmenes huérfanos** tras terminar instancias.
- **Datos en instance store** que se pierden al detener.
- **IP pública que cambia al detener/iniciar** (sin IP elástica).
- **Grupo de seguridad con `0.0.0.0/0` en SSH/RDP.**
- **IMDSv1 habilitado** en instancias con aplicaciones web.
- **ASG con una sola zona** o verificaciones de salud solo de EC2.
- **Cuotas de vCPU por región** que bloquean el lanzamiento cuando más lo necesitas: solicita aumentos con tiempo.
- **Spot sin diversificar** tipos y zonas, lo que reduce la capacidad disponible.
- **Reservas compradas** para una configuración que luego cambias.

## Cuándo EC2 no es lo mejor

Si no necesitas controlar el sistema operativo, hay opciones con menos operación: **Fargate/ECS** para contenedores, **Lambda** para eventos, **Elastic Beanstalk** para una aplicación web sencilla, **Lightsail** para cargas pequeñas y simples. EC2 sigue siendo la elección cuando necesitas control del sistema, software que no cabe en otros modelos, hardware especial (GPU, memoria extrema) o cargas estables y grandes donde optimizar el costo con compromisos compensa.

## Lista rápida para una instancia (o plantilla) de producción

1. AMI **parchada**, de una canalización, con versión.
2. **IMDSv2 obligatorio**; **rol de instancia** mínimo; **Session Manager** para acceso.
3. **Subred privada**, grupo de seguridad estrecho, sin IP pública.
4. **EBS gp3 cifrado**, snapshots automatizados.
5. **ASG** en dos o más zonas con **verificaciones de salud de ELB**.
6. **Agente de CloudWatch** con memoria, disco y registros.
7. **Etiquetas** y **alarma de presupuesto**.
8. Todo definido como **código** (CloudFormation, CDK o Terraform).

## Para finalizar

EC2 te da control total y, con él, la responsabilidad de parches, seguridad, capacidad y costo. Si las instancias se crean desde una plantilla versionada, se acceden por Session Manager, se escalan con un ASG en varias zonas y se compran con una estrategia basada en mediciones, la operación es predecible.

Si una instancia tiene nombre propio y alguien le tiene miedo, ya sabes qué arreglar primero.
