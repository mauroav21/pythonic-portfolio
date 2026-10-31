---
title: "Amazon Route 53 a fondo: DNS, enrutamiento, salud y las trampas que tumban dominios"
date: 2026-10-02
description: "Cómo funciona la resolución DNS, zonas públicas y privadas, registros alias, políticas de enrutamiento con verificaciones de salud, Resolver híbrido, DNSSEC, migraciones con TTL y los errores que causan caídas totales."
tags: [AWS, Route 53, DNS]
---

El DNS tiene una propiedad curiosa: cuando funciona, nadie lo menciona, y cuando falla, **todo parece estar caído** aunque tus servidores estén perfectos. Un registro mal escrito, una zona recreada, un dominio vencido, un TTL demasiado alto durante una migración... y el sitio desaparece para los usuarios mientras tus gráficas están en verde. Route 53 es el servicio DNS de AWS (y registrador de dominios, y verificador de salud). Entenderlo bien es entender cómo se encuentra tu aplicación en internet.

## Cómo se resuelve un nombre (el mínimo necesario)

Cuando un navegador pide `www.ejemplo.com`:

1. Pregunta a un **resolvedor recursivo** (el del proveedor de internet, 8.8.8.8, etc.).
2. Si no tiene la respuesta en caché, el resolvedor pregunta a los servidores raíz, luego a los del dominio `.com`, que le indican qué **servidores de nombres autoritativos** responden por `ejemplo.com`.
3. Esos servidores —los de tu zona de Route 53— devuelven el registro.
4. El resolvedor **guarda la respuesta en caché durante el TTL** y la entrega.

Dos consecuencias prácticas:

- **Route 53 solo responde como autoridad** de las zonas que alojas. Para que el mundo te encuentre, el registrador debe apuntar a los servidores de nombres (NS) de tu zona.
- **Un cambio de registro no se ve al instante:** depende del TTL con el que el valor viejo quedó en caché por el mundo.

## Qué ofrece Route 53

1. **Registro de dominios** (y transferencias).
2. **DNS autoritativo** con alta disponibilidad (SLA de 100 % de disponibilidad del plano de respuesta a consultas).
3. **Políticas de enrutamiento y verificaciones de salud.**
4. **Resolver:** DNS dentro de tu VPC y conectividad DNS híbrida con redes locales.
5. **DNS Firewall:** filtrado de dominios maliciosos desde tus VPC.

## Zonas alojadas

Una **zona alojada** contiene los registros de un dominio.

| | **Pública** | **Privada** |
|---|---|---|
| Visible desde | Internet | Solo las VPC asociadas |
| Uso | Sitios, APIs públicas, correo | Nombres internos (`db.interno.miempresa`) |
| Requisito | Servidores NS configurados en el registrador | VPC con `enableDnsSupport` y `enableDnsHostnames` |

Con **zonas privadas** puedes tener un mismo nombre con respuestas distintas dentro y fuera de la VPC (*split-horizon*). Asociar una VPC de **otra cuenta** requiere crear una autorización y completar la asociación; es un paso manual que se olvida.

### Delegar subdominios

Puedes delegar `api.ejemplo.com` a otra zona (otra cuenta, otro equipo, otro proveedor) creando registros NS en la zona padre apuntando a los servidores de nombres de la zona hija. Es la forma estándar de repartir la propiedad del DNS en una organización.

## Tipos de registro

| Tipo | Función | Notas |
|---|---|---|
| **A / AAAA** | Nombre → IPv4 / IPv6 | |
| **CNAME** | Nombre → otro nombre | **No se permite en el ápice de la zona** (`ejemplo.com`) ni junto a otros registros del mismo nombre |
| **MX** | Servidores de correo | Con prioridad |
| **TXT** | Texto | SPF, verificaciones de dominio, DKIM, DMARC |
| **NS / SOA** | Delegación y autoridad | No los borres |
| **CAA** | Qué autoridades pueden emitir certificados | Buena higiene de seguridad |
| **SRV, PTR, NAPTR…** | Casos específicos | |
| **Alias** (propio de Route 53) | Nombre → recurso de AWS | Ver abajo |

### Alias frente a CNAME

El **alias** es una extensión de Route 53 que se comporta como un registro A/AAAA pero apunta a un **recurso de AWS** (CloudFront, balanceadores, API Gateway, buckets de sitio web de S3, otro registro de la misma zona, y otros):

- **Funciona en el ápice** de la zona.
- **No se cobra** por las consultas a recursos de AWS.
- **Sigue automáticamente** los cambios de direcciones del recurso.
- Puede **evaluar la salud del destino** para conmutación por falla.
- Se publica como A/AAAA, así que no hay "CNAME visible" para el cliente.

Regla: **para recursos de AWS, usa alias.** Para destinos externos, CNAME (no en el ápice).

## Políticas de enrutamiento

La decisión de **qué respuesta devolver** para un mismo nombre:

| Política | Qué hace | Cuándo |
|---|---|---|
| **Simple** | Un valor, o varios devueltos juntos | Caso básico |
| **Ponderada** | Reparte según pesos relativos | Despliegues graduales (canary), pruebas A/B, migraciones |
| **Latencia** | A la región de AWS con menor latencia **medida** hacia el usuario | Aplicaciones multirregión |
| **Conmutación por falla** | Principal y secundario según la salud | Recuperación ante desastres |
| **Geolocalización** | Según país/continente/estado del usuario | Contenido o cumplimiento por región |
| **Geoproximidad** | Según cercanía física con un sesgo ajustable | Distribución fina entre regiones |
| **Multivalor** | Hasta 8 registros **sanos** al azar | Distribución sencilla con comprobaciones |
| **Basada en IP** | Según el rango CIDR del cliente | Redes conocidas, optimizar rutas |

Aclaraciones que evitan errores:

- **Latencia no es geografía.** Route 53 usa mediciones de latencia entre redes y regiones de AWS; un usuario puede acabar en una región "lejana" si la red lo favorece.
- **Geolocalización exige un registro predeterminado** para los usuarios sin coincidencia; si no, esos usuarios no obtienen respuesta.
- **Ponderada con peso 0** deja un registro disponible pero sin tráfico (útil para preparar). Con **todos** los pesos en 0, se reparte por igual.
- El enrutamiento por IP del usuario se basa en la IP **del resolvedor** salvo que este envíe la subred del cliente (EDNS Client Subnet), lo que afecta la precisión.

## Verificaciones de salud y conmutación por falla

Una **verificación de salud** consulta periódicamente un endpoint desde varias ubicaciones de AWS:

- **Tipos:** HTTP, HTTPS (con verificación opcional de cadena en el cuerpo), TCP; **calculada** (combina otras con AND/OR/mínimo); o basada en una **alarma de CloudWatch** (para recursos privados o métricas internas).
- **Intervalo:** 30 s (estándar) o 10 s (más rápido, mayor costo); se declara no sano tras un número de fallos consecutivos.
- Se puede **invertir** y asociar a registros de cualquier política.

Detalles importantes:

- Los verificadores llegan **desde internet**: tu endpoint debe aceptarlos (permite sus rangos en grupos de seguridad y WAF).
- Para recursos **privados**, no pueden alcanzarlos: usa una alarma de CloudWatch.
- En registros **alias**, activa **"Evaluar salud del destino"** para que Route 53 use la salud del recurso (por ejemplo, de los destinos del balanceador) sin crear una verificación aparte.
- Una verificación de salud **detecta**; el cambio efectivo depende del **TTL** que tengan en caché los clientes. Para conmutación rápida, usa TTL cortos (por ejemplo, 60 s) en esos registros.
- Una verificación mal configurada puede **sacar de rotación** un servicio sano, o dejar uno caído. Prueba cada condición.

Un esquema clásico de recuperación ante desastres:

```text
api.ejemplo.com
  ├─ PRIMARIO   (conmutación por falla) → balanceador región A  [verificación de salud]
  └─ SECUNDARIO (conmutación por falla) → balanceador región B
```

## Un despliegue gradual con ponderado

Para migrar tráfico a una nueva versión:

| Etapa | Peso del registro antiguo | Peso del nuevo |
|---|---|---|
| 1. Preparar | 100 | 0 |
| 2. Prueba | 99 | 1 |
| 3. Canary | 90 | 10 |
| 4. Mayoría | 10 | 90 |
| 5. Completar | 0 | 100 |

Con TTL bajos, y vigilando errores y latencia entre etapas. Recuerda que la caché de los resolvedores hace que cada cliente se quede con una respuesta durante su TTL; el reparto es estadístico, no exacto.

## Migraciones de DNS sin caídas

La técnica estándar:

1. **Con días de antelación, baja el TTL** del registro a 60 s y espera a que expire el TTL anterior.
2. **Haz el cambio.**
3. **Verifica** desde varios resolvedores (`dig @8.8.8.8`, `dig @1.1.1.1`, el del proveedor).
4. Cuando todo está estable, **vuelve a subir el TTL** (menos consultas, más caché).

Para migrar un dominio completo de otro proveedor a Route 53:

1. **Exporta o copia todos los registros** (incluidos MX, TXT, SPF, DKIM, CAA y subdominios olvidados).
2. **Crea la zona en Route 53 y verifica** cada registro consultando directamente sus servidores NS.
3. **Baja los TTL** del NS en el proveedor anterior, si es posible.
4. **Cambia los servidores de nombres** en el registrador.
5. Deja la zona antigua unos días.

Lo que más rompe migraciones: **registros de correo** olvidados y subdominios que nadie recordaba.

## Zonas privadas y Resolver híbrido

**Route 53 Resolver** responde las consultas DNS de tus VPC (en la dirección `.2` de cada VPC). Para conectar con redes locales:

- **Endpoints de entrada (inbound):** tu red local pregunta a Route 53 por nombres de AWS (zonas privadas, nombres internos).
- **Endpoints de salida (outbound) y reglas de reenvío:** tus VPC reenvían ciertos dominios (`corp.miempresa.com`) a los servidores DNS locales.
- Las reglas se pueden **compartir entre cuentas** con AWS RAM, para no repetirlas.
- Cada endpoint son **ENI** en tus subredes (varias zonas para disponibilidad) y se cobran por hora.

**DNS Firewall** bloquea o alerta sobre dominios (listas administradas de dominios maliciosos o propias) y **Resolver Query Logging** registra las consultas de las VPC, útil para investigaciones y para detectar exfiltración por DNS.

## DNSSEC

Para zonas públicas, Route 53 puede **firmar** la zona (llaves en KMS, **asimétricas y creadas en us-east-1**) para que los resolvedores validen que las respuestas no fueron alteradas. Requiere publicar el registro **DS** en la zona padre (en el registrador). Es un cambio delicado: si el DS no coincide o la llave se pierde, **los resolvedores que validan dejan de resolver tu dominio**. Haz el despliegue por etapas, con TTL bajos, y monitoreo (alarmas sobre errores de DNSSEC).

## Dominios: lo que no se debe olvidar

- **Renovación automática** activada y un contacto de correo vigente: un dominio vencido es una caída total, y en el peor caso, alguien más lo registra.
- **Bloqueo de transferencia** activado.
- **Privacidad de WHOIS** donde esté disponible.
- Para dominios críticos, usa un **correo de grupo** como contacto, no el de una persona.
- Registros de seguridad de correo: **SPF, DKIM y DMARC** (TXT/CNAME), con una política DMARC que evolucione de `none` a `quarantine`/`reject`.
- Registros **CAA** para limitar quién emite certificados.
- La validación de certificados de **ACM** por DNS usa un CNAME: si lo borras, el certificado no se renueva.

## Costos

| Concepto | Cómo se cobra |
|---|---|
| **Zona alojada** | Por zona al mes (más barata a partir de cierto número de zonas) |
| **Consultas** | Por millón; las **consultas alias a recursos de AWS son gratuitas**; las de latencia, geolocalización y similares cuestan más |
| **Verificaciones de salud** | Por verificación al mes (más con HTTPS, cadenas o intervalo rápido) |
| **Dominios** | Anual, según la extensión |
| **Resolver** | Por endpoint/hora y por millón de consultas |
| **DNS Firewall, registros de consultas** | Por uso |

En la práctica, el DNS es muy barato frente al resto. Las excepciones: muchísimas zonas olvidadas, verificaciones de salud numerosas, endpoints de Resolver en muchas VPC y zonas, y registros de consultas a gran volumen.

## Los gotchas, al punto

- **Recrear una zona** genera **servidores de nombres nuevos**: si el registrador sigue apuntando a los antiguos, el dominio deja de resolver. Si debes recrear la zona, actualiza los NS en el registrador, o usa un **conjunto de delegación reutilizable**.
- **Borrar registros NS/SOA** de la zona.
- **TTL altos** (horas) justo antes de una migración o una conmutación.
- **CNAME en el ápice** o junto a otros registros.
- **Registros colgantes (*dangling*)** que apuntan a recursos que ya no existen (un bucket, una distribución, una IP elástica liberada): un atacante puede reclamar ese recurso y servir contenido en **tu** subdominio (*subdomain takeover*). Limpia los registros al retirar un recurso.
- **Geolocalización sin registro predeterminado.**
- **Verificación de salud** bloqueada por un firewall o WAF.
- **Alias a un recurso que ya no existe.**
- **Zona privada sin asociar la VPC**, o sin habilitar `enableDnsHostnames`/`enableDnsSupport`.
- **Dominio vencido** por tarjeta caducada o contacto sin respuesta.
- **DNSSEC desalineado** (DS no coincide con la llave actual).
- **Registros de correo olvidados** en una migración (MX, SPF, DKIM).
- **Caché negativa:** una respuesta "no existe" también se cachea (según el SOA), así que crear un registro que antes no existía puede tardar en verse.
- **Culpar a la aplicación** cuando el problema es DNS: comprueba siempre con `dig` desde fuera.

## Cómo depurar con `dig`

```bash
# ¿Qué responde el mundo?
dig +short www.ejemplo.com @8.8.8.8

# ¿Qué dicen mis servidores autoritativos? (sin caché de por medio)
dig +short NS ejemplo.com
dig www.ejemplo.com @ns-123.awsdns-45.com

# ¿Cuál es el TTL restante en este resolvedor?
dig www.ejemplo.com @1.1.1.1 | grep -A1 "ANSWER SECTION"

# Seguir la cadena de delegación
dig +trace www.ejemplo.com
```

Si el autoritativo responde bien y el resolvedor público no, es **caché**; si el autoritativo responde mal, es **configuración de la zona**; si `+trace` se detiene en la delegación, son los **NS en el registrador**.

## Una configuración base razonable

1. **Zona pública** por dominio, con registros definidos como **infraestructura como código**.
2. **Alias** hacia CloudFront, balanceadores y API Gateway.
3. **TTL moderados** (300 s) por defecto y bajos (60 s) en registros que podrían conmutar.
4. **Verificaciones de salud** + conmutación por falla en servicios críticos.
5. **Zona privada** para nombres internos y **Resolver** si hay red local.
6. **CAA, SPF, DKIM y DMARC** configurados.
7. **Renovación automática, bloqueo de transferencia y contacto de grupo.**
8. **Permisos IAM estrictos** para modificar el DNS (y registro de cambios con CloudTrail).
9. **Revisión periódica** de registros huérfanos.

## Para finalizar

El DNS es una de esas capas donde un cambio pequeño tiene un alcance enorme. Route 53 te da las herramientas para manejarlo bien: alias, políticas de enrutamiento, verificaciones de salud y Resolver. A cambio, exige disciplina con los TTL, con la propiedad de los registros y con los dominios que registras. Trata el DNS como infraestructura crítica: como código, con revisión de cambios, con acceso restringido, y con `dig` como primera herramienta cuando algo "no llega".
