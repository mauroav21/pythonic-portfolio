---
title: "Amazon ECS y Fargate a fondo: de la definición de tarea al despliegue sin sobresaltos"
date: 2026-10-30
description: "Cómo funcionan clústeres, servicios y tareas, dimensionamiento en Fargate, redes y roles, despliegues con rollback automático, apagado ordenado, Spot, costos con un ejemplo y los errores que dejan tareas atascadas."
tags: [AWS, ECS, Fargate, Contenedores]
---

Ejecutar un contenedor en tu laptop toma un comando. Ejecutarlo en producción, de forma que se reinicie solo, reciba tráfico únicamente cuando esté listo, se actualice sin cortar conexiones, escale con la demanda y no dependa de nadie con acceso a un servidor, toma un orquestador. ECS con Fargate es la versión de AWS de esa promesa con la menor operación posible.

Este artículo es la guía de ese camino, incluyendo las razones por las que un servicio "se queda en `PENDING`" o "se reinicia cada dos minutos".

## El modelo mental

| Concepto | Qué es | Analogía |
|---|---|---|
| **Imagen** | El paquete inmutable de tu aplicación (en ECR u otro registro) | El instalador |
| **Definición de tarea** | La receta versionada: imagen(es), CPU, memoria, puertos, variables, roles, logs | El plano |
| **Tarea** | Una ejecución de una definición de tarea (uno o más contenedores juntos) | El proceso |
| **Servicio** | Mantiene N tareas vivas, las reemplaza si fallan, las registra en un balanceador y gestiona despliegues | El supervisor |
| **Clúster** | Agrupación lógica de servicios y tareas | La carpeta |
| **Capacidad** | Dónde corren las tareas: **Fargate**, Fargate Spot o instancias EC2 | El hardware |

Una tarea puede incluir varios contenedores que comparten red y ciclo de vida (la aplicación y un *sidecar* de observabilidad, por ejemplo). Marca como **`essential`** los que, si mueren, deben tumbar la tarea.

## Fargate: qué te quita y qué no

Con Fargate no ves ni administras servidores: cada tarea se ejecuta en un entorno aislado (microVM) con la CPU y memoria que declaras. Te quita parches, escalado de hosts y empaquetado de contenedores en máquinas. **No te quita**: el diseño de red, la seguridad, el dimensionamiento correcto de la tarea, los despliegues ni la observabilidad.

Sus restricciones conviene conocerlas antes de elegirlo:

- **Combinaciones fijas de CPU y memoria** (por ejemplo, 0.25 vCPU con 0.5–2 GB; 1 vCPU con 2–8 GB; 4 vCPU con 8–30 GB, hasta 16 vCPU y 120 GB).
- **Almacenamiento efímero:** 20 GiB por defecto, ampliable (hasta 200 GiB). Se pierde con la tarea.
- **Sin contenedores privilegiados ni Docker-in-Docker**, sin acceso al host.
- **Sin GPU** (para eso, ECS sobre EC2).
- **Arranque** de decenas de segundos a minutos según el tamaño de la imagen (hay mitigaciones, abajo).
- **Soporta arm64 (Graviton)** con precio por vCPU menor, siempre que tu imagen sea multiarquitectura.
- **Volúmenes EFS** soportados para almacenamiento compartido persistente.

## La definición de tarea, línea por línea

```json
{
  "family": "api-pedidos",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024",
  "runtimePlatform": { "cpuArchitecture": "ARM64", "operatingSystemFamily": "LINUX" },
  "executionRoleArn": "arn:aws:iam::111122223333:role/ecs-ejecucion",
  "taskRoleArn": "arn:aws:iam::111122223333:role/api-pedidos-tarea",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "111122223333.dkr.ecr.us-east-1.amazonaws.com/api-pedidos:1.8.3",
      "essential": true,
      "portMappings": [{ "containerPort": 8080 }],
      "stopTimeout": 60,
      "readonlyRootFilesystem": true,
      "user": "1000",
      "environment": [{ "name": "ENTORNO", "value": "prod" }],
      "secrets": [
        { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:us-east-1:111122223333:secret:prod/db-AbCdEf" }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/salud || exit 1"],
        "interval": 15, "timeout": 5, "retries": 3, "startPeriod": 30
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/api-pedidos",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      }
    }
  ]
}
```

Decisiones que ahí se ven:

- **Etiqueta de imagen inmutable** (`1.8.3` o un hash), **nunca `latest`**: con `latest` no sabes qué versión corre ni puedes volver atrás.
- **Dos roles distintos:**
  - **`executionRoleArn`** lo usa *ECS/Fargate* para descargar la imagen, escribir logs y leer los secretos al arrancar.
  - **`taskRoleArn`** lo usa *tu aplicación* para llamar a AWS (S3, DynamoDB...). Aquí va el mínimo privilegio de verdad.
- **Secretos por referencia** (`valueFrom`): nunca como texto plano en `environment`.
- **Usuario no root** y **sistema de archivos raíz de solo lectura** cuando la aplicación lo permita.
- **`stopTimeout`** (por defecto 30 s, hasta 120 s): tiempo para un apagado ordenado.
- **Health check del contenedor** con `startPeriod` para no matar una aplicación que aún arranca.

## Redes y el camino de la imagen

En Fargate cada tarea tiene su propia interfaz de red (`awsvpc`): una IP de tu subred y sus **grupos de seguridad**. Esquema habitual:

```text
Internet → ALB (subredes públicas) → tareas (subredes privadas) → RDS/DynamoDB/etc.
```

Para arrancar, la tarea necesita **llegar a ECR (imagen), CloudWatch Logs y Secrets Manager** (los de tu definición). En subredes privadas hay dos opciones:

1. **NAT Gateway:** simple, pero cobra por GB procesado, y cada descarga de imagen pasa por ahí.
2. **Endpoints de VPC:** `com.amazonaws.<región>.ecr.api`, `ecr.dkr`, `logs`, `secretsmanager` (de interfaz) y **S3 (de tipo Gateway)**, porque las capas de las imágenes se descargan desde S3. Más trabajo inicial, menos costo y más seguridad.

**La causa número uno de tareas que no arrancan** (`CannotPullContainerError`, tareas atascadas en `PROVISIONING`/`PENDING`) es que la subred privada **no tiene camino a ECR o a S3**. Revisa rutas, endpoints (y su DNS privado) y grupos de seguridad antes de culpar a la imagen.

## Servicios, balanceador y salud

Un servicio mantiene el **número deseado** de tareas y las registra en un grupo de destino del balanceador. Tres parámetros evitan las "tormentas de reinicios":

- **Verificación de salud del grupo de destino:** ruta (`/salud`), intervalo, umbrales. La ruta debe comprobar que la aplicación **puede atender**, no solo que el proceso existe.
- **`healthCheckGracePeriodSeconds`:** periodo inicial en que ECS **ignora** las fallas de salud del balanceador. Si tu aplicación tarda 60 s en arrancar y la gracia es 0, el servicio la mata en bucle antes de que esté lista.
- **Desregistro con retraso (`deregistration_delay`)**: tiempo que el balanceador espera a que terminen las peticiones en curso antes de retirar la tarea.

## Despliegues sin cortes

Por defecto, el servicio hace un **despliegue gradual (rolling)** controlado por dos porcentajes:

| Parámetro | Significado |
|---|---|
| `minimumHealthyPercent` | Mínimo de tareas sanas durante el cambio (100 = nunca bajas capacidad) |
| `maximumPercent` | Máximo de tareas totales durante el cambio (200 = puedes duplicar temporalmente) |

Con `100/200`, ECS lanza las nuevas, espera a que estén sanas, y retira las viejas: sin bajar capacidad, a costa de usar temporalmente el doble.

Activa el **circuit breaker de despliegue con rollback automático**: si las tareas nuevas no logran estabilizarse tras varios intentos, ECS detiene el despliegue y vuelve a la versión anterior. Es el seguro contra publicar una versión rota que reinicia en bucle.

También puedes añadir **alarmas de CloudWatch** al despliegue, de modo que ECS retroceda si, por ejemplo, la tasa de errores sube. Para tráfico controlado (canary, azul/verde con validación) existen integraciones con CodeDeploy y las opciones nativas más recientes del servicio; consulta qué soporta tu caso.

### Apagado ordenado: la mitad del trabajo

Cuando ECS detiene una tarea (en cada despliegue, escalado hacia abajo o interrupción de Spot) envía **`SIGTERM`** al proceso principal y, tras `stopTimeout`, `SIGKILL`. Tu aplicación debe:

1. **Capturar `SIGTERM`.**
2. **Dejar de aceptar** nuevas peticiones o mensajes.
3. **Terminar** las que están en vuelo (o devolverlas).
4. **Cerrar** conexiones y salir con código 0.

Dos trampas clásicas: **un shell como proceso 1** (`CMD "node app.js"` en forma de shell no reenvía señales; usa la forma `exec`/array o `exec node app.js`) y **procesos que ignoran `SIGTERM`**, que acaban cortados por `SIGKILL` (código 137) en medio de una petición.

## Escalado automático

El **Application Auto Scaling** del servicio ajusta el número de tareas con políticas:

- **Target tracking** (la más simple): "mantén la CPU media al 60 %", "mantén N solicitudes por tarea" (`ALBRequestCountPerTarget`).
- **Escalado por pasos** o **programado** para patrones conocidos.
- Para consumidores de colas, escala por **mensajes por tarea** (profundidad de la cola / capacidad de procesamiento).

Pon un **mínimo de 2 tareas en zonas distintas** para producción. Considera que el escalado no es instantáneo: la alarma, el lanzamiento, la descarga de la imagen y la salud tardan minutos. Para picos abruptos, usa un mínimo mayor o escalado programado.

## Acelerar el arranque

- **Imágenes pequeñas** (base mínima, construcción en múltiples etapas): lo que se descarga es proporcional al tamaño.
- **Ordena las capas**: lo que cambia con menos frecuencia, primero.
- **Carga perezosa con SOCI (Seekable OCI):** permite que Fargate empiece a ejecutar la imagen sin esperar a descargarla entera, útil para imágenes grandes.
- **Arm64**, que además es más barato.
- **Evita tareas pesadas** al inicio (migraciones, calentamiento de cachés) o muévelas a tareas aparte.

## Fargate Spot

**Fargate Spot** usa capacidad sobrante con un descuento importante (hasta alrededor del 70 %), con la posibilidad de que AWS **interrumpa** la tarea con **dos minutos de aviso** (`SIGTERM`). Es ideal para trabajadores de cola, procesamiento por lotes, entornos de prueba y CI. Para servicios web, combina una **base en Fargate normal** con un porcentaje en Spot mediante una estrategia de proveedores de capacidad (por ejemplo, base 2 en Fargate y el resto 50/50). Tu aplicación debe tolerar interrupciones (idempotente, apagado ordenado).

## Depurar sin SSH

- **ECS Exec:** abre una sesión en un contenedor en ejecución a través de Systems Manager (necesita permisos en el rol de la tarea y el agente). Auditado y sin puertos abiertos.
- **Eventos del servicio** (`describe-services`): explican por qué no se lanzan tareas ("no tiene capacidad", "falló la verificación de salud", "no puede descargar la imagen").
- **Motivo de detención de la tarea** (`describe-tasks` → `stoppedReason`, `exitCode`).
- **Logs** del contenedor en CloudWatch.

Códigos de salida útiles: **137** = `SIGKILL` (casi siempre falta de memoria o apagado forzado), **143** = `SIGTERM` (parada normal), **1** = error de la aplicación.

## Costos, con un ejemplo

Fargate cobra por **vCPU-hora y GB-hora** de las tareas (por segundo, con un mínimo de un minuto), más almacenamiento efímero adicional. Precios de referencia en us-east-1 para Linux/x86 (verifícalos; cambian por región, arquitectura y con Spot): del orden de 0.04 USD por vCPU-hora y 0.0044 USD por GB-hora.

**Caso:** 2 tareas permanentes de 0.5 vCPU y 1 GB, todo el mes (≈ 730 horas).

```text
por tarea y hora: 0.5 × 0.04048 + 1 × 0.004445 ≈ 0.0247 USD
por tarea y mes : 730 × 0.0247                  ≈ 18.0 USD
dos tareas                                      ≈ 36 USD / mes
```

Alrededor de eso se suman partidas que a menudo pesan más:

- **Balanceador (ALB):** costo por hora fijo más por capacidad usada.
- **NAT Gateway y transferencia de datos.**
- **Logs en CloudWatch.**
- **ECR:** almacenamiento de imágenes (conserva solo las recientes con una política de ciclo de vida).

Maneras de bajar el gasto:

1. **Ajusta CPU y memoria** a lo medido: el sobredimensionamiento por miedo es el mayor desperdicio.
2. **Arm64** y **Savings Plans (Compute)** para cargas estables.
3. **Spot** para lo tolerante a interrupciones.
4. **Apaga entornos de desarrollo** fuera de horario (desired count = 0).
5. **Endpoints de VPC** en lugar de NAT cuando el tráfico a AWS es alto.
6. **Políticas de ciclo de vida de ECR.**

## ECS o EKS o Lambda

| | **ECS + Fargate** | **EKS** | **Lambda** |
|---|---|---|---|
| Complejidad | Baja | Alta | Mínima |
| Control | Medio | Máximo (Kubernetes completo) | Bajo |
| Ecosistema | Integrado con AWS | Enorme (Helm, operadores, malla de servicios) | Eventos de AWS |
| Portabilidad | Específico de AWS | Estándar entre nubes | Específico de AWS |
| Procesos de larga duración | Sí | Sí | No (máx. 15 min) |
| Ideal | Equipos pequeños/medianos con contenedores | Equipos con experiencia en Kubernetes o necesidad de portabilidad | Código de eventos, tráfico esporádico |

Elige EKS cuando tengas una razón concreta (portabilidad, ecosistema, experiencia existente). Si no, ECS reduce mucho la carga operativa.

## Los gotchas, al punto

- **Tarea atascada en `PROVISIONING`/`PENDING`:** sin ruta a ECR/S3/Logs, subredes sin direcciones libres, secreto inexistente o sin permiso en el rol de ejecución.
- **Roles confundidos:** permisos de aplicación en el rol de ejecución (y viceversa).
- **`latest` como etiqueta.**
- **Ciclo de reinicios:** health check demasiado estricto o sin periodo de gracia.
- **Salida 137:** falta de memoria; revisa `memory` (límite duro) y `memoryReservation` (suave).
- **`SIGTERM` ignorado** (shell como proceso 1): peticiones cortadas en cada despliegue.
- **Estado en el disco de la tarea:** se pierde; usa S3, EFS o bases de datos.
- **Un solo ALB sin verificaciones de salud correctas**, que sigue enviando tráfico a tareas rotas.
- **Subredes demasiado pequeñas:** cada tarea consume una IP; con escalado agresivo se agotan.
- **Despliegue sin circuit breaker:** una versión rota reinicia sin fin.
- **Logs sin retención.**
- **Imagen enorme** que alarga cada arranque y cada escalado.

## Un punto de partida razonable

1. **Imagen** pequeña, no root, con etiqueta inmutable, escaneada en ECR.
2. **Definición de tarea** versionada (en código), con roles separados y secretos por referencia.
3. **Servicio** con 2+ tareas en 2+ zonas, subredes privadas, ALB, verificaciones de salud y periodo de gracia.
4. **Despliegue** 100/200 con circuit breaker y rollback; alarmas opcionales.
5. **Escalado** por target tracking.
6. **Apagado ordenado** probado en local con `docker stop`.
7. **Observabilidad:** logs estructurados, panel con las cuatro señales, alarmas.
8. **Costos:** dimensionamiento medido, etiquetas, presupuesto y política de ciclo de vida en ECR.

## Para finalizar

ECS con Fargate te da contenedores en producción sin servidores que parchar, pero te exige hacer bien lo que importa: la red hacia ECR, los dos roles, las verificaciones de salud con su periodo de gracia, el apagado ordenado y los despliegues con rollback.

Cuando todo eso está en su sitio, un despliegue es un `git push` sin sobresaltos. Cuando falta una pieza, es el origen de la mayoría de los incidentes de contenedores que se ven en cualquier equipo.
