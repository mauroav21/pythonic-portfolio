---
title: "Introducción a AWS IAM: quién puede hacer qué en tu cuenta"
date: 2026-06-04
description: "Usuarios, grupos, roles y políticas de IAM, cómo se evalúan los permisos y las prácticas básicas de mínimo privilegio y MFA."
tags: [AWS, IAM, Seguridad]
---

Si hay un servicio de AWS que conviene entender antes que cualquier otro, es IAM (Identity and Access Management). Controla **quién** puede hacer **qué** sobre **cuáles** recursos. Una mala configuración aquí es la causa de la mayoría de los incidentes de seguridad en la nube.

IAM es gratuito y está disponible en todas las cuentas.

## Los conceptos esenciales

| Concepto | Qué es |
|---|---|
| **Usuario** | Una identidad con credenciales permanentes (contraseña, llaves de acceso) |
| **Grupo** | Un conjunto de usuarios al que se asignan permisos en común |
| **Rol** | Una identidad **sin credenciales propias** que pueden asumir personas, servicios o aplicaciones y que da credenciales temporales |
| **Política** | Un documento JSON que define permisos |
| **Principal** | Quien hace la solicitud (usuario, rol, servicio) |

La diferencia entre usuario y rol es clave: los roles entregan credenciales **temporales**, que expiran, y por eso son la opción recomendada siempre que sea posible.

## Cómo es una política

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::mi-bucket-ejemplo/reportes/*"
    }
  ]
}
```

Cada declaración tiene:

- **Effect:** `Allow` o `Deny`.
- **Action:** qué operaciones (por ejemplo, `s3:GetObject`).
- **Resource:** sobre qué recursos, identificados por su ARN.
- **Condition** (opcional): bajo qué condiciones (IP de origen, MFA, etiquetas, hora).

## Cómo se decide si una solicitud se permite

La lógica general:

1. **Por defecto, todo está denegado.**
2. Un `Allow` explícito en una política aplicable habilita la acción.
3. Un `Deny` explícito **siempre gana**, aunque haya un `Allow` en otro lado.
4. Otras capas pueden limitar aún más: **límites de permisos**, **políticas de control de servicios (SCP)** de Organizations y **políticas de sesión**.

Entender que un `Deny` explícito prevalece ayuda a depurar cuando "no debería estar bloqueado".

## Tipos de política

- **Basadas en identidad:** se adjuntan a usuarios, grupos o roles.
- **Basadas en recursos:** se adjuntan al recurso (política de un bucket, de una cola) y pueden dar acceso a otras cuentas.
- **Políticas administradas por AWS** (ya hechas, a veces demasiado amplias) y **administradas por el cliente** (a tu medida).

## Roles: el patrón más importante

Los roles resuelven dos problemas típicos:

- **Servicios que necesitan acceder a otros servicios.** Una función Lambda o una instancia EC2 asume un rol para leer de S3 sin guardar llaves en el código.
- **Acceso entre cuentas** o de identidades externas, sin crear usuarios duplicados.

Cada rol tiene una **política de confianza** (quién puede asumirlo) y **políticas de permisos** (qué puede hacer).

## Buenas prácticas esenciales

1. **Protege la cuenta raíz.** Actívale MFA, no la uses para el trabajo diario y no crees llaves de acceso para ella.
2. **Activa MFA** para todas las personas usuarias, sobre todo con permisos administrativos. Hoy se recomiendan llaves de seguridad o passkeys.
3. **Aplica mínimo privilegio:** concede solo lo necesario. Empieza estrecho y amplía si hace falta, no al revés.
4. **Prefiere credenciales temporales (roles)** a llaves de acceso permanentes.
5. **Centraliza las identidades de personas** con **IAM Identity Center** o tu proveedor de identidad corporativo, en lugar de crear usuarios IAM en cada cuenta.
6. **Nunca pongas llaves de acceso en el código ni en repositorios.**
7. **Rota o elimina credenciales** que ya no se usan.
8. **Revisa permisos con regularidad.** IAM Access Analyzer ayuda a detectar accesos externos y permisos no utilizados.
9. **Usa condiciones y etiquetas** para acotar el acceso (por ejemplo, solo recursos de tu proyecto).
10. **Audita con CloudTrail:** todas las acciones quedan registradas.

## Errores frecuentes

- **`"Action": "*"` sobre `"Resource": "*"`** "para que funcione".
- **Usar la cuenta raíz** para el trabajo diario.
- **Llaves de acceso permanentes** olvidadas, filtradas o compartidas.
- **Un solo rol de administrador** compartido por todo el equipo, sin trazabilidad.
- **No usar MFA.**
- **Confundir autenticación y autorización:** IAM resuelve ambas, pero son cosas distintas.

## Depurar permisos

Cuando algo falla con "Access Denied", revisa en orden:

1. ¿Qué principal hizo la solicitud realmente (qué rol)?
2. ¿Tiene un `Allow` para esa acción y recurso?
3. ¿Hay un `Deny` explícito, una SCP o un límite de permisos?
4. ¿La política del recurso permite el acceso?
5. ¿Se cumplen las condiciones (MFA, IP, etiquetas)?

El **simulador de políticas** de IAM y los mensajes de error detallados ayudan.

## Para finalizar

IAM es la base de la seguridad en AWS. Con MFA, roles en lugar de llaves permanentes, mínimo privilegio y revisión periódica, evitas la mayoría de los riesgos comunes.

Dedícale tiempo al principio: es mucho más fácil construir con buenos permisos desde el inicio que arreglarlos después de un incidente.
