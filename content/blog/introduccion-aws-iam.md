---
title: "AWS IAM a fondo: cómo se evalúan los permisos y cómo no equivocarte"
date: 2026-06-04
description: "Identidades, políticas y roles de IAM, la lógica de evaluación (incluyendo SCP, límites de permisos y políticas de recursos), patrones de acceso entre cuentas, depuración de errores de acceso y las prácticas que previenen los incidentes más comunes."
tags: [AWS, IAM, Seguridad]
---

Casi todo incidente de seguridad grave en una cuenta de AWS tiene una de estas raíces: una credencial que no debía existir, un permiso mucho más amplio de lo necesario, o una política escrita con prisa que hacía algo distinto de lo que su autor creía. IAM es el servicio que cubre las tres cosas, y es gratuito, así que no hay excusa de costo para no entenderlo.

Este artículo va más allá de "usuarios, grupos y roles": explica **cómo decide IAM** si una solicitud se permite, cuáles son los patrones que de verdad se usan y cómo depurar un `AccessDenied` sin adivinar.

## Dos preguntas que IAM responde siempre

Cada vez que algo llama a la API de AWS, IAM se pregunta:

1. **Autenticación:** ¿quién eres? (¿esta solicitud viene firmada por una identidad válida?)
2. **Autorización:** ¿tienes permiso para esta acción sobre este recurso, en estas condiciones?

Casi todos los problemas están en la segunda. Y la segunda no es una lista simple: es la combinación de varias capas de políticas.

## Las identidades

| Concepto | Qué es | Credenciales |
|---|---|---|
| **Usuario raíz** | La identidad original de la cuenta, con acceso total | Correo y contraseña (+ MFA) |
| **Usuario IAM** | Una identidad dentro de la cuenta | Contraseña y/o llaves de acceso **permanentes** |
| **Grupo** | Un conjunto de usuarios IAM para asignar permisos juntos | No tiene credenciales; no se puede "ser" un grupo |
| **Rol** | Una identidad **sin credenciales propias** que se **asume** | Credenciales **temporales** (STS) |
| **Identidad federada / IAM Identity Center** | Personas que vienen de tu proveedor de identidad | Sesiones temporales |

La idea que organiza todo lo demás: **prefiere siempre credenciales temporales.** Un rol se asume y entrega credenciales que caducan (de 15 minutos a 12 horas según la configuración). Una llave de acceso de usuario IAM es válida hasta que alguien la elimine, y por eso es la que termina en un repositorio público.

### Cuándo todavía hay usuarios IAM

Cada vez menos: sistemas externos que no pueden asumir roles (algunos servicios de terceros, equipos locales) y cuentas de emergencia ("break glass"). Para **personas**, la recomendación vigente es centralizar el acceso con **IAM Identity Center** (o federación con tu proveedor), no crear un usuario IAM por persona y por cuenta.

## Las políticas: el lenguaje

Una política es un documento JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LeerReportes",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::mi-bucket-ejemplo/reportes/*",
      "Condition": {
        "Bool": { "aws:MultiFactorAuthPresent": "true" }
      }
    }
  ]
}
```

Los elementos:

- **Effect:** `Allow` o `Deny`.
- **Action** (o `NotAction`): qué operaciones (`s3:GetObject`, `ec2:*`).
- **Resource** (o `NotResource`): sobre qué recursos, por ARN.
- **Principal:** quién (solo en políticas basadas en recursos y de confianza).
- **Condition:** bajo qué circunstancias (MFA, IP de origen, etiquetas, hora, organización, endpoint de VPC).

### Los tipos de política

| Tipo | Se adjunta a | Para qué |
|---|---|---|
| **Basada en identidad** | Usuario, grupo o rol | Qué puede hacer esa identidad |
| **Basada en recursos** | El recurso (bucket, cola, clave KMS, función Lambda) | Quién puede acceder a ese recurso, **incluidas otras cuentas** |
| **Política de confianza de un rol** | El rol | Quién puede **asumirlo** |
| **Límite de permisos (permissions boundary)** | Usuario o rol | El **máximo** de permisos que una identidad puede llegar a tener |
| **SCP (política de control de servicios)** | Cuenta u OU en AWS Organizations | El máximo que cualquier identidad de esas cuentas puede hacer |
| **Política de sesión** | Una sesión temporal | Recorta los permisos de esa sesión |

Un detalle importante: los límites de permisos y las SCP **no conceden** nada. Solo **limitan**. Un `Allow` real sigue necesitando una política de identidad o de recurso.

## Cómo se evalúa una solicitud

Esta es la lógica que conviene tener en la cabeza (simplificada pero fiel al comportamiento):

1. **Por defecto, todo se deniega.** (Salvo que seas el usuario raíz.)
2. Se reúnen todas las políticas aplicables.
3. **Si alguna tiene un `Deny` explícito que coincide → denegado.** Siempre. Sin excepciones.
4. Si hay una **SCP** de Organizations, la acción debe estar **permitida por la SCP**.
5. Si hay un **límite de permisos**, la acción debe estar permitida por él.
6. Si hay una **política de sesión**, la acción debe estar permitida por ella.
7. Debe existir un `Allow` explícito en una política de identidad **o** de recurso (con reglas especiales entre cuentas, abajo).
8. Si ninguna condición lo bloquea y hay `Allow` → permitido. Si no → denegado implícito.

Resumido en una frase: **Deny explícito > permitido por todas las capas de límite + Allow explícito > denegado implícito.**

### Mismo cuenta vs. entre cuentas

- **Misma cuenta:** basta con un `Allow` en la política de identidad **o** en la de recurso (cualquiera de las dos).
- **Entre cuentas:** hacen falta **ambas**: la identidad debe tener permiso en su cuenta **y** el recurso (o el rol que asume) debe permitirlo desde la otra. Esto sorprende a casi todos la primera vez.

## Los roles: el patrón que más se usa

Un rol tiene dos políticas esenciales:

- **Política de confianza:** quién puede asumirlo.
- **Políticas de permisos:** qué puede hacer quien lo asume.

Los tres casos de uso habituales:

### 1. Servicios que acceden a otros servicios

Una función Lambda, una tarea de ECS o una instancia EC2 asume un rol para llamar a S3 o DynamoDB, **sin llaves en el código**. La política de confianza dice, por ejemplo, que el servicio `lambda.amazonaws.com` puede asumirlo:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

### 2. Acceso entre cuentas

La cuenta A crea un rol cuya política de confianza permite a la cuenta B (o a un rol específico de B) asumirlo. Una persona o un pipeline de B asume el rol de A y trabaja con **credenciales temporales de A**. Es el patrón base de estructuras multicuenta: una cuenta de herramientas despliega a las cuentas de producción asumiendo un rol en cada una.

Cuando el rol lo asume un tercero (otra empresa), añade un **`ExternalId`** en la condición para evitar el problema del "suplente confundido".

### 3. Federación para CI/CD sin llaves

GitHub Actions, GitLab y otros pueden autenticarse con **OpenID Connect (OIDC)** y asumir un rol de AWS **sin almacenar ninguna llave**. La política de confianza restringe qué repositorio y rama pueden asumirlo:

```json
{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
    "StringLike":   { "token.actions.githubusercontent.com:sub": "repo:mi-org/mi-repo:ref:refs/heads/main" }
  }
}
```

Esta condición de `sub` es la que importa: sin ella, **cualquier repositorio de GitHub** podría asumir tu rol. Es uno de los errores de configuración más graves que se ven hoy.

## Condiciones: donde está el control fino

Las condiciones convierten una política amplia en una precisa. Las más útiles:

| Condición | Uso |
|---|---|
| `aws:MultiFactorAuthPresent` | Exigir MFA para acciones sensibles |
| `aws:SourceIp` / `aws:SourceVpce` | Limitar el origen de la llamada |
| `aws:PrincipalOrgID` | Permitir a cualquier cuenta de tu organización sin listar cuentas una por una |
| `aws:RequestTag` / `aws:ResourceTag` / `aws:PrincipalTag` | **Control de acceso por atributos (ABAC):** permisos que dependen de etiquetas |
| `aws:SecureTransport` | Obligar HTTPS |
| `aws:RequestedRegion` | Impedir el uso de regiones no aprobadas |
| `iam:PassedToService` | Limitar a qué servicios se puede "pasar" un rol |

**ABAC** merece mención: en lugar de crear una política por proyecto, etiquetas a las personas y a los recursos con `proyecto=x`, y una sola política permite acceder a los recursos cuyo `proyecto` coincida con el de la persona. Escala mucho mejor que listar ARN uno por uno.

## `iam:PassRole`: el permiso que escala privilegios

Para que un servicio use un rol (Lambda, ECS, EC2), alguien debe **pasárselo** al crear el recurso. Eso requiere el permiso `iam:PassRole`. Si un usuario tiene `iam:PassRole` sobre un rol de administrador y puede crear una función Lambda, **puede ejecutar código como administrador**. Por eso:

- Concede `iam:PassRole` solo para roles concretos, nunca `Resource: "*"`.
- Acompáñalo de la condición `iam:PassedToService`.

## Buenas prácticas, con el porqué

1. **Protege el usuario raíz.** MFA, sin llaves de acceso, uso solo para las pocas tareas que lo exigen. Guarda las credenciales de recuperación de forma segura.
2. **MFA para todas las personas**, de preferencia con llaves de seguridad o passkeys (resistentes a phishing).
3. **Credenciales temporales en todos lados.** Roles para servicios, OIDC para pipelines, Identity Center para personas.
4. **Mínimo privilegio, de forma iterativa.** Empieza estrecho; usa **IAM Access Analyzer** para generar políticas a partir de la actividad real registrada en CloudTrail y para detectar permisos no usados.
5. **Evita las políticas administradas "FullAccess"** como solución permanente: son un atajo, no un diseño.
6. **Usa límites de permisos y SCP** para poner un techo, sobre todo cuando delegas la creación de roles a equipos.
7. **Etiqueta** identidades y recursos y usa ABAC donde tenga sentido.
8. **Rota y elimina:** llaves antiguas, usuarios inactivos, roles sin uso. El **informe de credenciales** de IAM lista la antigüedad y último uso de cada una.
9. **Audita:** CloudTrail registra cada llamada a la API, incluyendo quién asumió qué rol.
10. **Define IAM como código** (CloudFormation, CDK, Terraform): los cambios de permisos se revisan como cualquier otro cambio.

## Depurar un `AccessDenied` sin adivinar

El mensaje de error suele indicar **qué principal** hizo la llamada, **qué acción** y a veces **qué tipo de política** lo denegó (por ejemplo, "con una denegación explícita en una política basada en identidad" o "porque ninguna política basada en identidad permite la acción"). Léelo completo antes de tocar nada.

Una secuencia que funciona:

1. **¿Quién soy realmente?** `aws sts get-caller-identity` muestra la identidad efectiva. Muchas veces la sorpresa es que la llamada no la hace el rol que creías.
2. **¿Hay un `Allow` para esa acción y ese recurso** en la política de identidad (o, si es entre cuentas, en ambos lados)?
3. **¿Hay un `Deny` explícito?** Revisa políticas de identidad, de recurso, SCP y límites de permisos.
4. **¿Cumple las condiciones?** MFA, IP, endpoint de VPC, etiquetas, región.
5. **¿El recurso tiene su propia política** que bloquea (clave de KMS, bucket, cola)?
6. **Usa el simulador de políticas** de IAM para probar combinaciones sin ejecutar la acción, y **CloudTrail** para ver el evento denegado y su contexto.

## Los gotchas, al punto

- **Un `Deny` en una SCP** deja sin permiso a cualquiera de la cuenta, incluido el administrador, sin que sus políticas de identidad lo reflejen.
- **Los cambios de IAM son eventualmente consistentes:** un permiso recién concedido puede tardar unos segundos en aplicarse en todas las regiones.
- **Los usuarios de IAM no heredan permisos de un rol** que ellos mismos no asumen.
- **`NotAction` con `Allow`** concede todo lo demás. Es fácil escribir una política mucho más abierta de lo que parece.
- **`Resource: "*"`** en acciones que permiten escalar privilegios (`iam:*`, `iam:PassRole`, `sts:AssumeRole`, `lambda:CreateFunction`) es el camino clásico a la escalada.
- **Límite de tamaño de las políticas** y número de políticas adjuntas: si te topas con ello, es una señal para pasar a ABAC o a roles más enfocados.
- **Las llaves de acceso filtradas** se encuentran en minutos: bots rastrean repositorios públicos continuamente. Activa el escaneo de secretos de tu plataforma de código y alarmas de uso inusual.
- **La cuenta raíz** sigue pudiendo hacer cosas que ningún otro usuario puede, incluso bajo algunas restricciones.

## Un esquema razonable para empezar una organización

| Capa | Decisión |
|---|---|
| Personas | IAM Identity Center conectado a tu proveedor de identidad; permisos por conjuntos de permisos y grupos |
| Cuentas | Varias cuentas (producción, desarrollo, herramientas, seguridad, registros) en AWS Organizations |
| Techo | SCP que impiden regiones no usadas, desactivar CloudTrail o quitar Block Public Access |
| Máquinas | Roles con permisos mínimos por servicio; OIDC para pipelines |
| Emergencia | Una o dos identidades "break glass" con MFA física, alertas en cada uso |
| Revisión | Access Analyzer, informe de credenciales y revisión periódica de permisos |

## Mi forma de ver la seguridad

Hasta ahora no he vivido un incidente de seguridad grave. No lo atribuyo a suerte: en las empresas por las que he pasado había controles de código y de seguridad fuertes, y eso me formó. Aprendí ahí a trabajar con esa disciplina, y después a mantenerla por mi cuenta: estar al día, leer sobre vulnerabilidades y asumir que el mundo de las amenazas no se detiene aunque mi sistema esté tranquilo.

Hoy, como responsable de DevSecOps, lo resumo así: la seguridad no se logra con una herramienta ni con un permiso bien escrito, sino con el hábito de revisar. IAM es el mejor ejemplo, porque casi nunca falla por un error técnico espectacular: falla porque nadie volvió a mirar un permiso que se dio con prisa.

## Para finalizar

IAM parece engorroso porque cada incidente es una combinación de capas. Pero el modelo se resume en pocas ideas: todo está denegado por defecto, un `Deny` explícito siempre gana, las SCP y los límites solo recortan, y las credenciales temporales son siempre mejores que las permanentes.

Si solo vas a hacer tres cosas hoy: activa MFA en la cuenta raíz y en las personas, elimina las llaves de acceso permanentes que no necesites sustituyéndolas por roles, y pon `aws sts get-caller-identity` en tu rutina de depuración. Con eso evitas una enorme proporción de los problemas.
