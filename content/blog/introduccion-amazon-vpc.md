---
title: "Introducción a Amazon VPC: tu red privada en AWS"
date: 2026-07-06
description: "Subredes públicas y privadas, tablas de rutas, gateways, grupos de seguridad y NACL: cómo diseñar una red básica y segura en AWS."
tags: [AWS, VPC, Redes]
---

Cuando lanzas una instancia o una base de datos en AWS, vive dentro de una red. Esa red es una **VPC (Virtual Private Cloud)**: tu propia red virtual, aislada de las demás, en la que tú decides rangos de direcciones, subredes, rutas y reglas de seguridad.

Entender VPC es entender por qué algo se puede (o no) conectar con otra cosa.

## Los bloques de construcción

| Componente | Qué hace |
|---|---|
| **VPC** | La red completa, con un rango de direcciones IP (bloque CIDR) |
| **Subred** | Una porción de la VPC, ubicada en **una** zona de disponibilidad |
| **Tabla de rutas** | Reglas que dicen a dónde va el tráfico de una subred |
| **Internet Gateway (IGW)** | Puerta de conexión entre la VPC e internet |
| **NAT Gateway** | Permite que recursos privados **salgan** a internet sin ser accesibles desde fuera |
| **Grupo de seguridad** | Firewall a nivel de recurso (instancia, interfaz) |
| **Network ACL (NACL)** | Firewall a nivel de subred |
| **Endpoints de VPC** | Acceso privado a servicios de AWS sin pasar por internet |

## Subredes públicas y privadas

La diferencia no es una casilla, sino la **tabla de rutas**:

- **Subred pública:** tiene una ruta hacia un Internet Gateway, y los recursos con IP pública pueden recibir tráfico desde internet.
- **Subred privada:** no tiene ruta directa a internet. Si necesita salir (para descargar actualizaciones, por ejemplo), lo hace a través de un NAT Gateway ubicado en una subred pública.

Un patrón común y recomendado:

| Capa | Dónde vive |
|---|---|
| Balanceador de carga | Subredes públicas |
| Aplicación | Subredes privadas |
| Base de datos | Subredes privadas, sin salida a internet |

Y se repite en **al menos dos zonas de disponibilidad** para tolerar fallas.

## Direccionamiento: planifica el CIDR

El bloque CIDR de la VPC (por ejemplo, `10.0.0.0/16`) define cuántas direcciones tendrás. Algunas recomendaciones:

- **Elige rangos que no se solapen** con otras VPC o redes locales con las que quizá conectes en el futuro. Cambiar esto después es doloroso.
- **Deja espacio para crecer.**
- Recuerda que AWS reserva cinco direcciones en cada subred.

## Grupos de seguridad vs. NACL

| | Grupo de seguridad | Network ACL |
|---|---|---|
| **Nivel** | Instancia / interfaz de red | Subred |
| **Estado** | **Con estado** (stateful): la respuesta a una conexión permitida se permite automáticamente | **Sin estado** (stateless): hay que permitir ida y vuelta |
| **Reglas** | Solo de permiso | Permiso y denegación |
| **Evaluación** | Se evalúan todas las reglas | Se evalúan en orden numérico |
| **Uso típico** | Control principal | Capa adicional gruesa |

En la práctica, casi todo el control se hace con grupos de seguridad. Una buena técnica es que un grupo permita tráfico **desde otro grupo** (por ejemplo, la base de datos solo acepta conexiones del grupo de la aplicación) en lugar de rangos de IP.

## Conectar con otros mundos

- **VPC Peering:** conexión directa entre dos VPC.
- **Transit Gateway:** un centro de conexión que une muchas VPC y redes locales.
- **VPN de sitio a sitio y Direct Connect:** conectan tu red local con AWS.
- **PrivateLink:** expone un servicio de forma privada a otras VPC o cuentas.

## Endpoints de VPC

Sin ellos, una instancia privada que accede a S3 o DynamoDB tendría que salir por el NAT Gateway hacia internet. Con **endpoints**:

- **De tipo Gateway** (S3 y DynamoDB): sin costo adicional por el endpoint, y el tráfico no sale de la red de AWS.
- **De tipo Interface** (muchos otros servicios): usan PrivateLink y tienen costo por hora y por datos.

Además de mejorar la seguridad, pueden reducir el gasto en NAT Gateway.

## Costos a vigilar

- **NAT Gateway:** se cobra por hora y por gigabyte procesado; es una causa frecuente de facturas sorpresivas.
- **Transferencia de datos entre zonas de disponibilidad y hacia internet.**
- **Direcciones IPv4 públicas:** AWS cobra por ellas.
- **Endpoints de interfaz** y otros componentes de conectividad.

## Buenas prácticas

1. **Nada en subredes públicas** si no necesita recibir tráfico directo de internet.
2. **Bases de datos y cargas internas en subredes privadas.**
3. **Varias zonas de disponibilidad** para lo importante.
4. **Mínimo necesario** en los grupos de seguridad: puertos y orígenes concretos.
5. **No abras `0.0.0.0/0`** a puertos de administración (SSH o RDP). Usa Session Manager.
6. **Activa los registros de flujo (VPC Flow Logs)** para investigar y auditar tráfico.
7. **Define la red con infraestructura como código.**
8. **Usa endpoints de VPC** para servicios de AWS de uso intensivo.

## Errores frecuentes

- **Usar solo la VPC predeterminada** para todo.
- **CIDR demasiado pequeños o solapados.**
- **Todo en subredes públicas** por comodidad.
- **Un solo NAT Gateway para todo** sin considerar fallas por zona, o uno por zona sin necesidad en entornos de prueba (cuestión de costo frente a disponibilidad).
- **Reglas de seguridad demasiado abiertas** que "se quedan" por años.

## Para finalizar

Una VPC bien diseñada separa lo público de lo privado, distribuye en varias zonas y limita el tráfico a lo necesario. Pensar la red al principio ahorra rediseños dolorosos cuando el sistema ya está en producción.

Con VPC, IAM y un buen etiquetado tienes la base de cualquier arquitectura segura en AWS.
