---
title: "Introducción a Amazon ECS y AWS Fargate: contenedores sin administrar servidores"
date: 2026-10-30
description: "Clústeres, definiciones de tarea, servicios y la diferencia entre ejecutar en EC2 o en Fargate; cuándo elegir ECS frente a EKS."
tags: [AWS, ECS, Fargate, Contenedores]
---

Los contenedores resolvieron un problema clásico: "en mi máquina funciona". Empaquetas la aplicación con sus dependencias y corre igual en cualquier lugar. Pero ejecutar muchos contenedores en producción exige decidir dónde corren, cómo se reinician, cómo escalan y cómo se conectan. Eso es **orquestación**.

**Amazon ECS (Elastic Container Service)** es el orquestador de contenedores de AWS, y **AWS Fargate** es la opción para ejecutarlos **sin administrar los servidores**.

## Los conceptos de ECS

| Concepto | Qué es |
|---|---|
| **Imagen** | El paquete de la aplicación, guardado en un registro como **Amazon ECR** |
| **Definición de tarea (task definition)** | La "receta": qué imagen(es), cuánta CPU y memoria, puertos, variables, rol de IAM, registros |
| **Tarea (task)** | Una instancia en ejecución de una definición de tarea |
| **Servicio (service)** | Mantiene un número deseado de tareas en ejecución, las reemplaza si fallan y se integra con balanceadores |
| **Clúster** | Agrupación lógica de tareas y servicios |

Una tarea puede incluir varios contenedores que se ejecutan juntos (por ejemplo, la aplicación y un agente de observabilidad).

## Dos formas de ejecutar: EC2 o Fargate

| | **Fargate** | **EC2** |
|---|---|---|
| **Quién administra los servidores** | AWS | Tú (instancias del clúster) |
| **Parches y escalado de hosts** | No te ocupas | Tú |
| **Facturación** | Por CPU y memoria solicitadas por tarea, por segundo | Por las instancias EC2 |
| **Control** | Menos (sin acceso al host) | Total (GPU, discos especiales, optimización de empaquetado) |
| **Ideal para** | Simplicidad, cargas variables, equipos pequeños | Cargas estables a gran escala, requisitos especiales |

Fargate suele ser el punto de partida: menos operación a cambio de un costo unitario algo mayor. A gran escala y con cargas constantes, EC2 bien empaquetado puede resultar más económico.

## Un flujo típico

1. **Construyes** la imagen y la subes a **ECR**.
2. **Defines la tarea:** imagen, 0.5 vCPU, 1 GB de memoria, puertos, variables, rol de IAM.
3. **Creas un servicio** con, por ejemplo, 2 tareas en subredes privadas de dos zonas.
4. **Pones un balanceador de carga (ALB)** delante.
5. **Configuras escalado automático** según CPU, memoria o solicitudes.
6. **Actualizas** desplegando una nueva versión de la definición; ECS reemplaza tareas de forma gradual (*rolling*) o con despliegues azul/verde.

## Roles de IAM: dos que no se deben confundir

- **Rol de ejecución de la tarea:** lo usa **ECS** para descargar la imagen de ECR, escribir registros y leer secretos al iniciar.
- **Rol de la tarea:** lo usa **tu aplicación** para acceder a otros servicios de AWS (S3, DynamoDB, etc.).

Separarlos es una buena práctica de mínimo privilegio.

## Redes

En Fargate cada tarea recibe su propia interfaz de red (modo `awsvpc`) con una IP en tu subred y sus propios **grupos de seguridad**. Colócalas en **subredes privadas**, con un balanceador en las públicas. Para descargar imágenes sin salir a internet, usa **endpoints de VPC** para ECR, S3 y CloudWatch.

## Secretos y configuración

No pongas contraseñas en la imagen ni en variables de texto plano. Referencia **Secrets Manager** o **Parameter Store** desde la definición de tarea; ECS los inyecta como variables al arrancar.

## ECS vs. EKS vs. Lambda

| | ECS | EKS (Kubernetes) | Lambda |
|---|---|---|---|
| **Complejidad** | Menor | Mayor | Mínima |
| **Portabilidad** | Específico de AWS | Estándar Kubernetes | Específico de AWS |
| **Ecosistema** | Integración profunda con AWS | Enorme (herramientas, comunidad) | Orientado a eventos |
| **Ideal para** | Equipos que quieren contenedores sin la complejidad de Kubernetes | Equipos con experiencia o necesidad de Kubernetes | Código basado en eventos de corta duración |

Si no tienes una razón concreta para usar Kubernetes (portabilidad entre nubes, ecosistema, experiencia del equipo), ECS suele ser más sencillo.

## Costos a considerar

- **Fargate:** vCPU y memoria por segundo, con mínimos de facturación por tarea. Existen opciones con descuento (Fargate Spot, para tareas tolerantes a interrupciones, y planes de ahorro).
- **Balanceador, NAT Gateway y transferencia de datos,** que a menudo pesan más que el cómputo.
- **Registros en CloudWatch** y almacenamiento en ECR.
- Dimensiona CPU y memoria según métricas reales: un error común es sobredimensionar.

## Buenas prácticas

1. **Una responsabilidad por contenedor;** sin estado local relevante.
2. **Imágenes pequeñas y escaneadas** en busca de vulnerabilidades (ECR ofrece escaneo).
3. **Tareas en subredes privadas** y mínimo privilegio en roles y grupos de seguridad.
4. **Verificaciones de salud** en el balanceador y en el contenedor.
5. **Despliegues graduales** con reversión automática.
6. **Escalado automático** con métricas adecuadas.
7. **Registros y métricas centralizados;** considera trazas.
8. **Infraestructura como código** para definir clúster, servicios y redes.
9. **Etiqueta** servicios para costos.

## Errores frecuentes

- **Una sola tarea** sin redundancia, o en una sola zona.
- **Confundir los roles de ejecución y de tarea.**
- **Secretos en variables de texto plano.**
- **Sobredimensionar** CPU y memoria.
- **Guardar estado en el sistema de archivos de la tarea,** que es efímero.
- **No configurar verificaciones de salud,** y recibir tráfico en contenedores que no responden.
- **Imagen con la etiqueta `latest`,** que impide saber qué versión corre.

## Para finalizar

ECS con Fargate ofrece contenedores en producción con muy poca operación: defines la tarea, el servicio y la red, y AWS se encarga del resto. Es un gran punto intermedio entre la simplicidad de Lambda y la potencia (y complejidad) de Kubernetes.

Empieza con Fargate, subredes privadas, roles bien separados y despliegues graduales. Si algún día necesitas más control, tendrás claro por qué.
