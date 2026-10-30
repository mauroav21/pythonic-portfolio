---
title: "Introducción a Amazon RDS: bases de datos relacionales administradas"
date: 2026-10-30
description: "Motores, Multi-AZ, réplicas de lectura, respaldos y Aurora: qué te resuelve RDS, qué sigue siendo tu responsabilidad y cómo elegir."
tags: [AWS, RDS, Bases de datos]
---

Administrar una base de datos relacional implica instalar, parchar, respaldar, replicar, monitorear y planificar la recuperación ante fallas. Es trabajo importante y repetitivo. **Amazon RDS (Relational Database Service)** lo hace por ti, para que te enfoques en el esquema, las consultas y la aplicación.

## Qué es RDS

Un servicio que **administra bases de datos relacionales** en la nube. Te ocupas de la base de datos como producto; AWS administra el sistema operativo, la instalación, los parches, los respaldos y la alta disponibilidad.

### Motores disponibles

- **Amazon Aurora** (compatible con MySQL y PostgreSQL, diseñado por AWS)
- **MySQL**
- **PostgreSQL**
- **MariaDB**
- **Oracle**
- **Microsoft SQL Server**
- **IBM Db2**

La disponibilidad de versiones y funciones cambia; revisa la documentación para tu motor.

## Qué administra AWS y qué sigues administrando tú

| AWS | Tú |
|---|---|
| Aprovisionamiento del hardware y el sistema operativo | Diseño del esquema e índices |
| Parches del motor y del sistema | Optimización de consultas |
| Respaldos automáticos | Configuración de parámetros |
| Conmutación por falla (Multi-AZ) | Seguridad de acceso y datos |
| Monitoreo básico de la infraestructura | Dimensionamiento y costos |

No tienes acceso al sistema operativo (salvo en variantes especiales como RDS Custom), lo cual simplifica y limita a la vez.

## Alta disponibilidad: Multi-AZ

Con **Multi-AZ**, RDS mantiene una réplica en espera, en otra zona de disponibilidad, sincronizada con la principal. Si la principal falla, o durante mantenimientos, RDS conmuta a la réplica de forma automática, normalmente en uno o dos minutos. Es la opción para producción.

Hay una variante con dos réplicas en espera legibles. Y Multi-AZ no es una réplica para escalar lecturas en la implementación clásica: es para **disponibilidad**.

## Escalar lecturas: réplicas de lectura

Las **réplicas de lectura** (read replicas) copian los datos de forma asíncrona y atienden consultas de solo lectura, aliviando la instancia principal. Pueden estar en otra región. Tienen un pequeño retraso respecto a la principal (lag), así que no sirven si necesitas leer el dato recién escrito.

| | Multi-AZ | Réplica de lectura |
|---|---|---|
| **Propósito** | Disponibilidad | Escalar lecturas |
| **Replicación** | Síncrona | Asíncrona |
| **Acceso** | Solo se usa al conmutar | Se consulta activamente |

## Respaldos y recuperación

- **Respaldos automáticos:** instantáneas diarias más registros de transacciones, con retención configurable (hasta 35 días). Permiten la **recuperación a un punto en el tiempo**.
- **Snapshots manuales:** los creas tú y se conservan hasta que los elimines.
- Prueba la restauración de forma periódica: un respaldo que nunca se restauró es una suposición.

## Seguridad

- **Dentro de una VPC, en subredes privadas** y sin acceso público, salvo necesidad real.
- **Grupos de seguridad** que permitan solo a la aplicación.
- **Cifrado en reposo** (con KMS) y **en tránsito** (TLS).
- **Credenciales gestionadas** con Secrets Manager, con rotación automática.
- **Autenticación IAM** para ciertos motores, evitando contraseñas fijas.
- **Registro de auditoría** según el motor.

## Amazon Aurora

Aurora es el motor propio de AWS, compatible con MySQL y PostgreSQL. Separa cómputo y almacenamiento: los datos se replican en **seis copias en tres zonas** y el almacenamiento crece automáticamente. Ofrece conmutación rápida y hasta quince réplicas de lectura. También existe **Aurora Serverless**, que ajusta la capacidad según la demanda, útil para cargas variables.

Suele costar más que RDS estándar, pero su arquitectura mejora disponibilidad y escalabilidad. Evalúalo con tu carga real.

## RDS Proxy

Si tienes muchas conexiones cortas, como las de funciones Lambda, **RDS Proxy** agrupa y reutiliza conexiones, evitando saturar la base.

## Costos

Pagas por:

- **Horas de instancia** según clase y motor (más licencia si aplica).
- **Almacenamiento** aprovisionado y su rendimiento (IOPS).
- **Respaldos** que excedan el almacenamiento aprovisionado.
- **Transferencia de datos** entre zonas, regiones e internet.
- **Multi-AZ** y réplicas multiplican componentes.

Para cargas estables, las **instancias reservadas** reducen el costo.

## Buenas prácticas

1. **Multi-AZ en producción.**
2. **Mantén la base en subredes privadas.**
3. **Cifra datos y gestiona credenciales con Secrets Manager.**
4. **Define ventanas de mantenimiento** a horas de poca carga.
5. **Monitorea** CPU, memoria, conexiones, latencia y espacio con CloudWatch y Performance Insights.
6. **Activa la ampliación automática del almacenamiento.**
7. **Prueba restauraciones y conmutaciones.**
8. **Dimensiona según métricas**, no por intuición.
9. **Usa infraestructura como código.**

## Cuándo no usar RDS

Si tu modelo no es relacional, o necesitas escalabilidad horizontal masiva con latencias muy bajas y acceso por clave, DynamoDB puede encajar mejor. Si necesitas control total del sistema operativo o extensiones no soportadas, quizá una base en EC2 (con todo el costo operativo que implica).

## Para finalizar

RDS elimina la mayor parte del trabajo operativo de una base relacional, a cambio de menos control y un costo mayor que administrarla uno mismo. Para casi todos los equipos pequeños y medianos, es un gran negocio.

Usa Multi-AZ, respalda, cifra, monitorea y prueba. Y recuerda que el rendimiento de una base depende más del diseño del esquema y las consultas que de la potencia de la instancia.
