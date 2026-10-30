---
title: "Introducción a Amazon EC2: servidores virtuales en la nube"
date: 2026-10-30
description: "Instancias, AMI, tipos, modelos de compra, almacenamiento, redes y escalado automático: lo esencial de EC2 y cómo no gastar de más."
tags: [AWS, EC2, Cómputo]
---

Amazon EC2 (Elastic Compute Cloud) fue uno de los primeros servicios de AWS y sigue siendo la base de buena parte de la nube: te da **servidores virtuales** que creas en minutos, con el tamaño que necesites y que pagas mientras existen.

Si vienes del mundo de los servidores físicos, es lo más parecido, y por eso es el mejor punto para entender cómo piensa AWS.

## Conceptos básicos

- **Instancia:** un servidor virtual en ejecución.
- **AMI (Amazon Machine Image):** la plantilla con el sistema operativo y el software con que arranca una instancia. Puedes usar las de AWS, de terceros o crear la tuya.
- **Tipo de instancia:** define CPU, memoria, red y almacenamiento (por ejemplo, `t3.micro` o `m6i.large`).
- **Par de llaves, o acceso por Systems Manager:** para entrar a la instancia. Hoy se recomienda **Session Manager** de Systems Manager, que evita abrir el puerto SSH.
- **Grupo de seguridad:** un firewall virtual a nivel de instancia.
- **Región y zona de disponibilidad:** dónde vive.

## Familias de instancias

Los nombres siguen un patrón: la letra indica la familia, el número la generación y el sufijo el tamaño.

| Familia | Pensada para | Ejemplos de uso |
|---|---|---|
| **T** (uso general, ráfagas) | Cargas con uso bajo y picos ocasionales | Sitios pequeños, desarrollo, pruebas |
| **M** (uso general) | Equilibrio de cómputo, memoria y red | Aplicaciones web, servidores de aplicaciones |
| **C** (optimizadas para cómputo) | CPU intensivo | Procesamiento por lotes, codificación de video |
| **R / X** (memoria) | Mucha memoria | Bases de datos en memoria, analítica |
| **I / D** (almacenamiento) | Alta velocidad de disco local | Bases de datos NoSQL, almacenes de datos |
| **P / G** (cómputo acelerado) | GPU | Entrenamiento e inferencia de IA, gráficos |

Las instancias **T** funcionan con créditos de CPU: si las usas de forma sostenida por encima de su base, se agotan y se frena el rendimiento (o se cobra por exceso en modo ilimitado).

## Modelos de compra

La misma instancia puede costar muy distinto según cómo la compres:

| Modelo | Cómo funciona | Cuándo conviene |
|---|---|---|
| **Bajo demanda** | Pagas por uso, sin compromiso | Cargas impredecibles, pruebas |
| **Savings Plans / Reservadas** | Te comprometes a un nivel de uso por 1 o 3 años a cambio de descuento | Cargas estables y constantes |
| **Spot** | Capacidad sobrante con gran descuento, pero AWS puede reclamarla con aviso | Trabajos tolerantes a interrupciones: procesamiento por lotes, CI |
| **Hosts dedicados** | Servidor físico dedicado | Requisitos de licenciamiento o cumplimiento |

Los descuentos y precios cambian; consulta la calculadora oficial. Una estrategia habitual: base estable con Savings Plans, picos con bajo demanda y trabajos flexibles con Spot.

## Almacenamiento

- **EBS (Elastic Block Store):** discos persistentes que se conectan a la instancia. Sobreviven a que la instancia se detenga y se pueden respaldar con **snapshots**.
- **Almacén de instancia (instance store):** disco local muy rápido, pero **efímero**: se pierde al detener o terminar la instancia.
- **EFS:** sistema de archivos compartido entre varias instancias.
- Para archivos y objetos, S3.

## Redes

Las instancias viven dentro de una **VPC**, en una subred. Un grupo de seguridad controla el tráfico de entrada y salida; por defecto, todo lo de entrada está bloqueado. Una **IP elástica** te da una dirección pública fija si la necesitas, aunque en muchos casos un balanceador es mejor opción.

## Escalado y alta disponibilidad

Una sola instancia es un punto único de falla. El patrón recomendado:

- **Auto Scaling Group:** mantiene un número de instancias y las crea o elimina según métricas (por ejemplo, uso de CPU).
- **Elastic Load Balancer:** reparte el tráfico entre instancias en varias zonas.
- **Plantillas de lanzamiento:** definen cómo se crea cada instancia.

Así, si una instancia falla, se reemplaza sola; si sube la carga, se añaden más.

## Buenas prácticas

1. **Trata a las instancias como desechables:** automatiza su configuración y evita arreglarlas a mano.
2. **Usa roles de IAM** en lugar de guardar llaves de acceso en la máquina.
3. **Cierra puertos:** abre solo lo necesario, y limita el origen.
4. **Mantén el sistema actualizado**, o usa AMI renovadas con frecuencia.
5. **Etiqueta recursos** para saber de quién son y cuánto cuestan.
6. **Dimensiona bien:** revisa métricas y ajusta; muchas instancias están sobredimensionadas.
7. **Respalda** volúmenes importantes con snapshots automáticos.

## Errores de costo frecuentes

- **Instancias olvidadas** encendidas en cuentas de prueba.
- **Volúmenes EBS huérfanos** que siguen cobrándose tras eliminar la instancia.
- **IP elásticas sin usar.**
- **Sobredimensionar** "por si acaso".
- **No usar descuentos por compromiso** en cargas estables.

## Cuándo no usar EC2

Si no necesitas controlar el sistema operativo, quizá convenga algo con menos operación: contenedores con Fargate, funciones con Lambda o servicios administrados. EC2 brilla cuando necesitas ese control, software específico, cargas de larga duración o hardware especial.

## Para finalizar

EC2 te da flexibilidad total con la responsabilidad que implica: parches, seguridad y dimensionamiento son tuyos. Úsalo con automatización, varias zonas y un modelo de compra acorde a tu carga.

Es la pieza fundamental sobre la que se entienden muchos otros servicios, y conocerlo bien hace más fácil elegir cuándo conviene algo más administrado.
