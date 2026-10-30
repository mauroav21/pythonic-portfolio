---
title: "Amazon RDS a fondo: alta disponibilidad, respaldos, rendimiento y costos"
date: 2026-07-24
description: "Qué administra RDS y qué sigues administrando tú: Multi-AZ, réplicas, recuperación a un punto en el tiempo, parámetros, actualizaciones sin sorpresas, conexiones, seguridad y costos."
tags: [AWS, RDS, Bases de datos]
---

Una base de datos relacional en producción es la parte del sistema que más duele cuando falla y la que más se subestima cuando funciona. RDS quita una parte grande del trabajo (instalar, parchar, respaldar, conmutar) pero deja otra enteramente tuya (el esquema, las consultas, las conexiones, el dimensionamiento). Confundir cuál es cuál es la fuente de casi todos los problemas.

Este artículo recorre ambas mitades.

## Qué administra AWS y qué no

| AWS | Tú |
|---|---|
| Hardware, sistema operativo, instalación del motor | Esquema, índices, tipos de datos |
| Respaldos automáticos y recuperación a un punto en el tiempo | **Probar** las restauraciones |
| Conmutación por falla en Multi-AZ | Que tu aplicación **reconecte** tras una conmutación |
| Parches del sistema y del motor (en ventanas de mantenimiento) | Pruebas de compatibilidad antes de actualizar versiones |
| Métricas de infraestructura | Optimización de consultas, tamaños de pool, parámetros |
| Cifrado en reposo si lo habilitas | Seguridad de acceso, secretos, mínimo privilegio |

No tienes acceso al sistema operativo ni a un superusuario completo (RDS ofrece un usuario administrador con casi todos los privilegios). Quien necesite control total —extensiones no soportadas, acceso al sistema de archivos— mira **RDS Custom** o EC2, asumiendo el costo operativo.

## Motores

- **Aurora** (compatible con MySQL y PostgreSQL): arquitectura propia de AWS, descrita más abajo.
- **MySQL, MariaDB, PostgreSQL**: motores de código abierto.
- **Oracle, SQL Server, Db2**: comerciales, con modelos de licencia incluida o traer tu propia licencia.

La elección suele hacerla la aplicación. Si es una decisión libre, PostgreSQL ofrece un conjunto de características y extensiones muy amplio, y Aurora aporta mejor escalabilidad de lectura y conmutación más rápida a cambio de un precio mayor.

## Alta disponibilidad: Multi-AZ, bien entendido

Hay dos despliegues Multi-AZ y se confunden:

| | **Multi-AZ de instancia** | **Multi-AZ de clúster** (MySQL y PostgreSQL) |
|---|---|---|
| Réplicas en espera | 1, en otra zona | 2, en otras dos zonas |
| ¿Las espera se pueden leer? | **No** | **Sí**, como endpoint de lectura |
| Replicación | Síncrona a nivel de almacenamiento | Semisíncrona con registros de transacciones |
| Conmutación típica | Del orden de 60 a 120 s | Normalmente más rápida (decenas de segundos) |

En una conmutación, **el nombre DNS del endpoint apunta a la nueva instancia principal**. Por eso:

- Usa **siempre el nombre del endpoint**, nunca una IP.
- Tu aplicación debe **reconectar** ante un error de conexión. Si mantiene un pool con conexiones muertas, parece que "la base sigue caída" tras la conmutación.
- Revisa que el **TTL de DNS** de tu cliente (la JVM, por ejemplo, puede cachear de forma agresiva) no retrase el cambio.
- **Pruébalo:** puedes forzar una conmutación al reiniciar con failover, en un entorno de pruebas. Es la única forma de saber cómo se comporta tu aplicación.

Multi-AZ de instancia es **disponibilidad**, no escalado de lecturas ni protección contra errores humanos (un `DELETE` sin `WHERE` se replica al instante).

## Respaldos y recuperación

### Qué tienes

- **Respaldos automáticos:** un snapshot diario más los registros de transacciones continuamente. Retención de 0 a 35 días. Habilitan la **recuperación a un punto en el tiempo (PITR)**, con granularidad del orden de 5 minutos.
- **Snapshots manuales:** persisten hasta que los elimines (útiles antes de un cambio grande y para conservar versiones).
- **AWS Backup:** políticas centralizadas, copia entre cuentas y regiones.

### Lo que hay que saber de la restauración

- **Una restauración siempre crea una instancia nueva**, con un endpoint nuevo. No "revierte" la existente. Tu plan debe incluir cómo apuntar la aplicación a la nueva, qué ocurre con las réplicas y cuánto tarda (depende del tamaño).
- El RTO real (cuánto tardas en volver) **no es** el de la documentación: mídelo en un ejercicio.
- **El respaldo automático se elimina al borrar la instancia**, salvo que conserves respaldos automatizados o tomes un snapshot final. Activa la **protección contra eliminación**.
- Para protegerte de borrados maliciosos o por error de cuenta, **copia los snapshots a otra cuenta** y/o región.

> Un respaldo que nunca se ha restaurado es una hipótesis. Programa una restauración de prueba cada trimestre y mide.

## Réplicas de lectura

Copian los datos de forma **asíncrona** y atienden consultas de solo lectura. Para MySQL, MariaDB y PostgreSQL puedes tener hasta 15; pueden estar en otra región. Úsalas para:

- Descargar lecturas pesadas (informes, analítica) de la instancia principal.
- Escalar lecturas de la aplicación.
- Recuperación ante desastres entre regiones (se pueden promover a instancias independientes).

Considera:

- **Retraso de replicación (`ReplicaLag`)**: la réplica puede ir segundos (o más) atrás. Lecturas que dependen de lo que acabas de escribir deben ir a la principal.
- La aplicación debe **decidir qué consulta va a qué endpoint**. Un proxy como RDS Proxy (con endpoint de solo lectura en Aurora) o una capa en la aplicación lo gestiona.
- Una réplica también se cobra como una instancia.

## Aurora: qué cambia

Aurora separa el cómputo del almacenamiento:

- El almacenamiento es un **volumen distribuido** que mantiene **seis copias en tres zonas** y crece automáticamente (hasta 128 TiB).
- Las réplicas (hasta 15) **comparten el mismo almacenamiento**, así que el retraso suele ser de milisegundos y la promoción en una falla es rápida.
- Endpoints separados: **clúster** (escritura), **lector** (balancea lecturas) y personalizados.
- **Aurora Serverless v2** ajusta la capacidad en unidades (ACU) según la demanda, con granularidad fina; útil para cargas variables o entornos de desarrollo. Calcula el costo en carga constante: puede salir más caro que una instancia aprovisionada.
- **Aurora Global Database** para réplicas entre regiones con retraso bajo.

Aurora no siempre es la opción más barata: cobra por E/S en la configuración estándar (existe una configuración de E/S optimizada), y el almacenamiento y las réplicas suman. Haz el cálculo con tu patrón de uso.

## Rendimiento: lo que importa de verdad

La mayoría de los problemas de rendimiento de una base **no se arreglan comprando una instancia más grande**.

1. **Consultas e índices:** una consulta que hace un recorrido completo de una tabla grande es el problema número uno. Usa `EXPLAIN` (`EXPLAIN ANALYZE` en PostgreSQL) para ver el plan.
2. **Conexiones:** cada conexión consume memoria. Cientos de conexiones inactivas degradan la base. Usa un **pool** en la aplicación y, para funciones Lambda o muchos contenedores efímeros, **RDS Proxy**.
3. **Almacenamiento y E/S:** gp3 ofrece una línea base de IOPS y ancho de banda con opción de aumentarlos; io1/io2 para cargas con IOPS garantizados. Mira `ReadIOPS`, `WriteIOPS` y la latencia, no solo la CPU.
4. **Memoria:** la proporción de datos que caben en memoria determina buena parte del rendimiento. Métricas: `FreeableMemory` y el uso de swap.
5. **Parámetros del motor:** se gestionan con **grupos de parámetros** (parameter groups). Algunos son dinámicos y otros exigen reinicio; el grupo predeterminado no se puede editar, crea uno propio.
6. **Mantenimiento del motor:** `VACUUM` y estadísticas en PostgreSQL, optimizaciones de tablas en MySQL.

### Herramientas

- **Performance Insights / CloudWatch Database Insights:** muestran la carga de la base (AAS, esperas, consultas y usuarios que más consumen). Es la primera pantalla a mirar cuando "la base va lenta". (AWS ha ido integrando Performance Insights en Database Insights; revisa cuál aplica a tu motor.)
- **Registros lentos** (`slow query log`, `log_min_duration_statement`) enviados a CloudWatch Logs.
- **Monitoreo mejorado (Enhanced Monitoring)** para métricas a nivel de sistema operativo.

## Actualizaciones sin sorpresas

- **Parches menores:** puedes dejar que se apliquen automáticamente en la ventana de mantenimiento. Aun así, pruébalos antes en un entorno equivalente.
- **Versiones mayores:** cambian comportamientos y son más riesgosas. Usa **despliegues azul/verde de RDS** (Blue/Green Deployments): crean una copia sincronizada con la nueva versión o configuración, la validas y haces el cambio con un tiempo de corte muy corto, con vuelta atrás posible.
- **Fin de soporte estándar:** las versiones antiguas de los motores dejan de recibir parches y pasan a **soporte extendido con cargo adicional**. Lleva un calendario.
- Define la **ventana de mantenimiento** en horas de baja carga, y recuerda que algunos parches pueden provocar un reinicio o una conmutación.

## Seguridad

1. **Subredes privadas** (un grupo de subredes de BD sin ruta a internet) y **`PubliclyAccessible = false`**.
2. **Grupo de seguridad** que solo acepte el puerto de la base **desde el grupo de seguridad de la aplicación**.
3. **Cifrado en reposo con KMS**: debe habilitarse **al crear** la instancia. Para cifrar una existente, crea un snapshot, cópialo cifrado y restáuralo.
4. **TLS en tránsito**: exige conexiones cifradas (`rds.force_ssl` en PostgreSQL, `require_secure_transport` en MySQL) y verifica el certificado del lado cliente.
5. **Credenciales:** administradas con **Secrets Manager** y rotación automática (RDS puede gestionar la contraseña maestra por ti), o **autenticación IAM** para tokens temporales (tiene límites de conexiones por segundo).
6. **Usuarios de base de datos de mínimo privilegio** por aplicación; el usuario administrador no es para la aplicación.
7. **Auditoría:** registros de auditoría del motor, y CloudTrail para las llamadas de administración.
8. **Protección contra eliminación** activada y snapshots finales obligatorios.

## Costos

Una instancia RDS cobra por varias vías:

| Concepto | Detalle |
|---|---|
| **Instancia** | Por hora, según clase y motor (más licencia en Oracle y SQL Server) |
| **Multi-AZ** | Duplica (o más) el costo de cómputo y almacenamiento |
| **Almacenamiento** | Por GB-mes; IOPS aprovisionados extra en gp3 e io1/io2 |
| **Respaldos** | Gratuitos hasta el tamaño del almacenamiento aprovisionado; el exceso y los snapshots manuales se cobran |
| **Réplicas** | Cada una es una instancia más |
| **Transferencia** | Entre zonas, regiones e internet |
| **Proxy, Performance Insights extendido, soporte extendido** | Cargos adicionales |

Cómo bajar la cuenta sin perder seguridad:

- **Instancias reservadas** (o Savings Plans para Aurora y RDS) en producción estable.
- **Dimensiona según métricas** (CPU, memoria, IOPS) con revisiones periódicas.
- **Apaga o elimina entornos de desarrollo** fuera de horario (una instancia RDS detenida se reinicia sola a los siete días).
- **Limpia snapshots manuales** antiguos.
- **Migra gp2 a gp3** donde aplique.
- Vigila la **sobreprovisión de IOPS**.

## Los gotchas, al punto

- **Aplicación sin reconexión** tras una conmutación o un reinicio.
- **Usar una IP o un endpoint de instancia** en lugar del endpoint de clúster/escritura.
- **Cifrado no habilitado al crear**, que obliga a migrar después.
- **Sin protección contra eliminación** y sin snapshot final.
- **Respaldos nunca restaurados.**
- **Conexiones agotadas** por pools mal dimensionados o funciones Lambda sin proxy.
- **Réplicas asumidas como consistentes** inmediatamente.
- **Consultas sin índice** disfrazadas de "falta de potencia".
- **Parámetros cambiados** que exigen reinicio, aplicados en horario laboral.
- **Versiones fuera de soporte** con costo extendido.
- **Almacenamiento lleno:** el autoescalado de almacenamiento ayuda, pero configura alarmas de espacio libre.

## Alarmas mínimas que vale la pena tener

- `CPUUtilization` sostenida alta.
- `FreeStorageSpace` bajo.
- `FreeableMemory` bajo y uso de swap.
- `DatabaseConnections` cerca del límite.
- `ReplicaLag` alto.
- Latencia de lectura/escritura elevada.
- Eventos de conmutación por falla y de reinicio (suscripción a eventos de RDS vía SNS).

## Para finalizar

RDS convierte una base de datos en un servicio, pero no en una caja mágica. Lo que hace por ti es enorme; lo que sigue siendo tuyo —el esquema, las consultas, las conexiones, las pruebas de restauración y de conmutación— es lo que decide si tu sistema aguanta un mal día.

Si tuviera que elegir tres acciones para esta semana: probar una restauración completa, forzar una conmutación en pruebas para ver cómo reacciona la aplicación y revisar qué consultas consumen más con Performance Insights. Cada una suele revelar al menos un problema que de otro modo se descubriría en producción.
