---
title: "Introducción a Amazon Route 53: DNS, dominios y enrutamiento inteligente"
date: 2026-10-30
description: "Cómo funciona el DNS, qué ofrece Route 53, tipos de registros, registros alias y políticas de enrutamiento con verificaciones de salud."
tags: [AWS, Route 53, DNS]
---

Cuando escribes `miempresa.com` en el navegador, algo tiene que traducir ese nombre a una dirección IP. Esa traducción la hace el **DNS (Domain Name System)**, a veces descrito como la agenda telefónica de internet. Cuando el DNS falla, todo parece caído aunque tus servidores estén bien.

**Amazon Route 53** es el servicio DNS de AWS. El nombre viene del puerto 53, el que usa el DNS.

## Qué hace Route 53

Combina tres funciones:

1. **Registro de dominios:** compras o transfieres dominios.
2. **Servicio DNS autoritativo:** responde a las consultas sobre tus dominios, con alta disponibilidad.
3. **Verificaciones de salud y enrutamiento:** dirige a los usuarios según el estado y la ubicación de tus recursos.

AWS ofrece un SLA de **100 % de disponibilidad** para el servicio DNS de Route 53, algo poco común y valioso, porque casi todo depende del DNS.

## Conceptos básicos

- **Zona alojada (hosted zone):** el contenedor de los registros de un dominio. Puede ser **pública** (visible en internet) o **privada** (visible solo dentro de una o varias VPC).
- **Registro:** una entrada que dice cómo resolver un nombre.
- **Servidores de nombres (NS):** los servidores de Route 53 que responden por tu zona. Debes configurarlos en el registrador del dominio.
- **TTL:** cuánto tiempo pueden guardar en caché la respuesta los resolvedores.

## Tipos de registro comunes

| Tipo | Qué hace | Ejemplo |
|---|---|---|
| **A** | Nombre → dirección IPv4 | `www` → `203.0.113.10` |
| **AAAA** | Nombre → dirección IPv6 | |
| **CNAME** | Nombre → otro nombre | `blog` → `miblog.ejemplo.net` |
| **MX** | Servidores de correo | |
| **TXT** | Texto (verificaciones, SPF, DKIM) | |
| **NS / SOA** | Delegación y autoridad de la zona | |
| **Alias** (propio de Route 53) | Nombre → recurso de AWS | `ejemplo.com` → distribución de CloudFront |

## Alias vs. CNAME

Un **CNAME** no puede usarse en el **ápice del dominio** (`ejemplo.com` sin `www`), por una limitación del estándar DNS. Los registros **alias** de Route 53 sí pueden, y además:

- Apuntan directamente a recursos de AWS: CloudFront, balanceadores, API Gateway, S3 (sitios web), otros registros de la zona.
- **No tienen costo por consulta** cuando apuntan a recursos de AWS.
- Siguen automáticamente los cambios de direcciones del recurso.

Para recursos de AWS, usa alias.

## Políticas de enrutamiento

La parte más potente de Route 53: decidir **qué respuesta** dar a cada consulta.

| Política | Cómo responde | Uso típico |
|---|---|---|
| **Simple** | Un valor (o varios, aleatorios) | Caso básico |
| **Ponderada** | Reparte según pesos (por ejemplo, 90/10) | Despliegues graduales, pruebas A/B |
| **Por latencia** | A la región con menor latencia para el usuario | Aplicaciones multirregión |
| **Conmutación por falla (failover)** | Principal, y secundaria si la principal no está sana | Recuperación ante desastres |
| **Geolocalización** | Según el país o región del usuario | Contenido o cumplimiento regional |
| **Geoproximidad** | Según cercanía, con ajustes de sesgo | Distribución geográfica fina |
| **Respuesta de múltiples valores** | Varias respuestas sanas | Distribución básica con salud |
| **Basada en IP** | Según el rango de IP del cliente | Casos específicos de red |

## Verificaciones de salud

Route 53 puede comprobar de forma periódica si un punto final responde (por HTTP, HTTPS o TCP) desde varias ubicaciones. Si falla, deja de devolver ese registro y puede activar la conmutación por falla. También puede combinar verificaciones y alarmas de CloudWatch.

## Zonas privadas

Con una **zona privada** resuelves nombres internos (`db.interno.miempresa`) solo desde tus VPC, sin exponerlos a internet. Útil para separar nombres internos de los públicos y para que los servicios se encuentren por nombre, no por IP.

## Un ejemplo práctico

Servir un sitio con HTTPS y dominio propio:

1. Crea la **zona alojada** de tu dominio.
2. Actualiza los **servidores de nombres** en tu registrador.
3. Solicita un certificado en **ACM** y valida el dominio con un registro CNAME de validación.
4. Crea un **registro alias** de `ejemplo.com` (y `www`) hacia tu distribución de CloudFront.

## Costos

- **Zona alojada:** una tarifa mensual por zona.
- **Consultas:** por millón, con tarifas distintas según el tipo (estándar, por latencia, etc.). Las consultas alias a recursos de AWS son gratuitas.
- **Verificaciones de salud:** por verificación al mes.
- **Registro de dominio:** un cargo anual según la extensión.

## Buenas prácticas

1. **Usa alias** hacia recursos de AWS.
2. **Define TTL bajos** antes de una migración planificada, y súbelos después.
3. **Protege el registro del dominio:** bloqueo de transferencia y renovación automática. Perder un dominio es un desastre.
4. **Activa DNSSEC** si tu caso lo requiere.
5. **Usa verificaciones de salud** con conmutación por falla en servicios críticos.
6. **Gestiona los registros como código** (Terraform, CloudFormation).
7. **Limita quién puede modificar el DNS** con IAM: un cambio equivocado afecta a todo.

## Errores frecuentes

- **No actualizar los servidores de nombres** en el registrador tras crear la zona.
- **TTL altos** cuando necesitas cambiar rápido.
- **CNAME en el ápice** (no es posible) o registros conflictivos.
- **Olvidar renovar** el dominio.
- **Eliminar una zona** que sigue en uso.
- **Culpar a la aplicación** cuando el problema es un registro DNS incorrecto o en caché.

## Para finalizar

Route 53 es más que "apuntar un dominio": es una pieza clave de disponibilidad, rendimiento y recuperación ante fallos. Con alias, políticas de enrutamiento y verificaciones de salud, el DNS se convierte en una herramienta de arquitectura.

Y como casi todo depende de él, cuídalo con permisos estrictos, registros como código y la costumbre de verificar antes de cambiar.
