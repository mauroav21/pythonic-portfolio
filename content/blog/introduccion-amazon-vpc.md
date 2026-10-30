---
title: "Amazon VPC a fondo: diseña tu red en AWS sin rehacerla en seis meses"
date: 2026-07-06
description: "Direccionamiento, subredes y zonas, tablas de rutas, NAT, grupos de seguridad vs. NACL, endpoints, conectividad entre VPC y a redes locales, observabilidad y los errores de red que más cuestan."
tags: [AWS, VPC, Redes]
---

La red es la decisión de AWS más difícil de cambiar después. Puedes cambiar el tipo de una instancia en minutos, pero cambiar el rango de direcciones de una VPC con cientos de recursos, o descubrir que dos redes que ahora quieres conectar usan el mismo CIDR, es un proyecto de semanas.

Por eso conviene diseñar la VPC una vez, con calma, entendiendo qué hace cada pieza.

## Qué es una VPC

Una **VPC (Virtual Private Cloud)** es una red virtual aislada dentro de una región, definida por un bloque de direcciones IP (CIDR). Dentro de ella creas subredes, rutas, puertas de enlace y reglas de seguridad. Nada entra ni sale de la VPC a menos que tú lo habilites con rutas y reglas.

Toda cuenta trae una **VPC predeterminada** por región (rango 172.31.0.0/16) con subredes públicas en cada zona. Sirve para pruebas rápidas; para cualquier cosa seria, crea las tuyas, porque la predeterminada pone todo en subredes públicas con rutas a internet.

## Direccionamiento: la decisión irreversible

Una VPC tiene un CIDR principal, de **/16 (65 536 direcciones) a /28 (16)**. Puedes agregar CIDR secundarios después, pero el principal no se cambia.

Recomendaciones:

1. **Usa rangos privados** (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
2. **Planifica un esquema para toda la organización** antes de crear la primera VPC. Si hoy tienes una sola, mañana tendrás diez, y los rangos **no pueden solaparse** si quieres conectarlas por peering, Transit Gateway o con la red corporativa.
3. **No seas tacaño:** un /16 por VPC es habitual; un /24 de subred ofrece 251 direcciones útiles. Servicios como EKS (un pod, una IP) o muchas ENI de Lambda en VPC consumen direcciones más rápido de lo esperado.
4. **AWS reserva 5 direcciones por subred** (red, router, DNS, uso futuro y broadcast).

Un esquema de ejemplo, documentado en un wiki o en código:

| Entorno | CIDR de la VPC |
|---|---|
| Producción | 10.10.0.0/16 |
| Staging | 10.20.0.0/16 |
| Desarrollo | 10.30.0.0/16 |
| Herramientas compartidas | 10.40.0.0/16 |
| Red corporativa local | 192.168.0.0/16 (fuera del rango anterior) |

## Subredes y zonas de disponibilidad

Una subred vive en **una sola zona de disponibilidad (AZ)**. Para alta disponibilidad, creas el mismo tipo de subred en al menos **dos** zonas (idealmente tres).

Un detalle poco conocido: los **nombres de zona** (`us-east-1a`) se asignan de forma distinta para cada cuenta, para repartir la carga. Si necesitas que dos cuentas coincidan en la misma zona física (por ejemplo, para reducir transferencia entre zonas), usa los **AZ ID** (`use1-az1`).

### Públicas y privadas: lo define la ruta

No hay una casilla "pública". Una subred es pública si su **tabla de rutas** envía el tráfico a internet por un **Internet Gateway (IGW)** y los recursos tienen IP pública. Privada si no.

Un esquema típico de tres capas:

| Capa | Subred | Salida a internet |
|---|---|---|
| Balanceador / borde | Pública | Directa (IGW) |
| Aplicación | Privada | Vía NAT Gateway o endpoints |
| Datos | Privada (sin ruta a internet) | Ninguna |

## Tablas de rutas

Cada subred se asocia a una tabla de rutas, que contiene reglas "destino → objetivo". Todas incluyen la ruta **local** (comunicación dentro de la VPC), que no se puede quitar. Ejemplo para una subred privada:

| Destino | Objetivo |
|---|---|
| 10.10.0.0/16 | local |
| 0.0.0.0/0 | nat-0abc… (NAT Gateway) |
| pl-… (lista de prefijos de S3) | vpce-… (endpoint de tipo Gateway) |
| 10.40.0.0/16 | pcx-… (peering) |

La regla que se aplica es **la más específica** (mayor longitud de prefijo). Gran parte de los "no llega" se explican mirando la tabla de rutas de **origen y de destino** (la respuesta también debe encontrar camino de vuelta).

## Salir a internet desde subredes privadas

Una instancia privada necesita a veces descargar paquetes o llamar a APIs externas. Opciones:

- **NAT Gateway:** administrado, escala solo, se coloca en una subred **pública** (con su IP elástica). Se cobra **por hora y por GB procesado**, y es una zona única: para tolerar la caída de una zona necesitas un NAT por zona.
- **NAT instance:** una EC2 que haces de NAT. Más barata a pequeña escala, más trabajo operativo. Rara vez vale la pena.
- **Egress-only Internet Gateway:** equivalente para IPv6 (salida sin entrada).
- **Endpoints de VPC:** evitan salir a internet para llegar a servicios de AWS (siguiente sección).

El NAT Gateway es una de las **causas más frecuentes de facturas inesperadas**: el procesamiento por GB se acumula cuando las cargas descargan mucho (imágenes de contenedores, actualizaciones, S3 vía internet). Verifica qué atraviesa el NAT antes de optimizar otra cosa.

## Endpoints de VPC: tráfico privado hacia servicios de AWS

| Tipo | Servicios | Cómo funciona | Costo |
|---|---|---|---|
| **Gateway** | Solo **S3 y DynamoDB** | Añade una entrada a la tabla de rutas | **Sin cargo** |
| **Interface (PrivateLink)** | Cientos de servicios (ECR, Secrets Manager, SQS, CloudWatch, SSM…) y servicios de terceros | Crea una ENI con IP privada y DNS privado en tus subredes | Por hora y por zona, más por GB |

Dos usos clave:

1. **Reducir costo de NAT:** un endpoint Gateway de S3 quita ese tráfico del NAT, y es gratis.
2. **Cerrar el acceso:** puedes escribir políticas que solo permitan acceder a un bucket **desde tu endpoint** (`aws:SourceVpce`), de modo que los datos no se lean desde fuera de tu red.

Recuerda habilitar **DNS privado** en los endpoint de interfaz para que `sqs.us-east-1.amazonaws.com` resuelva a la IP privada, y habilitar **resolución y nombres DNS** en la VPC.

## Seguridad en capas: grupos de seguridad y NACL

| | **Grupo de seguridad** | **Network ACL** |
|---|---|---|
| Se aplica a | ENI (instancia, balanceador, endpoint, base de datos…) | Subred |
| Estado | **Con estado**: la respuesta a una conexión permitida se permite automáticamente | **Sin estado**: debes permitir ida y vuelta (incluyendo puertos efímeros) |
| Reglas | Solo `Allow` | `Allow` y `Deny`, con número de orden |
| Por defecto | Todo entrante denegado; todo saliente permitido | La ACL predeterminada permite todo |

La práctica recomendada es **hacer el control fino con grupos de seguridad** y dejar las NACL con reglas gruesas (por ejemplo, bloquear un rango malicioso) porque su falta de estado las vuelve fáciles de configurar mal.

### El patrón que escala: referenciar grupos

En lugar de abrir "10.10.0.0/16 al puerto 5432", la base de datos permite el puerto 5432 **desde el grupo de seguridad de la aplicación**. Así, aunque las IP cambien, el acceso sigue la identidad del grupo.

```text
sg-alb   : entrada 443 desde 0.0.0.0/0
sg-app   : entrada 8080 desde sg-alb
sg-db    : entrada 5432 desde sg-app
```

Con esto, nadie más llega a la base, y no hay IP escritas a mano.

## Conectar con otras redes

| Opción | Uso | Notas |
|---|---|---|
| **VPC Peering** | Conectar dos VPC | **No es transitivo** (A↔B y B↔C no da A↔C); sin CIDR solapados; hay que actualizar rutas en ambos lados |
| **Transit Gateway** | Centro de conexión para muchas VPC y redes locales | Rutas centralizadas; cobra por conexión y por GB |
| **Site-to-Site VPN** | Túneles cifrados con tu red local por internet | Rápido de montar; el ancho de banda y la latencia dependen de internet |
| **Direct Connect** | Enlace físico dedicado | Latencia estable, mayor ancho de banda; semanas de aprovisionamiento |
| **PrivateLink** | Exponer un servicio concreto a otras VPC o cuentas sin abrir toda la red | Ideal entre equipos y con terceros; evita problemas de CIDR solapados |

Una regla que ahorra problemas: si una VPC debe consumir **un servicio** de otra, PrivateLink es más limpio que unir redes completas.

## IPv6 y IPv4 públicas

Las **IPv4 públicas se cobran por hora** (también las asociadas a recursos en uso). Eso incentiva reducir su cantidad: coloca solo balanceadores y NAT en el borde, y usa IPv6 donde sea posible (las direcciones IPv6 en AWS son públicas y enrutables; el control se hace con grupos de seguridad y un Egress-only IGW para solo salida).

## Observabilidad de red

- **VPC Flow Logs:** registran metadatos de las conexiones (origen, destino, puerto, acción permitida/denegada, bytes). Envíalos a CloudWatch Logs o S3 y consúltalos con Athena. Son imprescindibles para investigar un `REJECT` y para entender quién consume el NAT.
- **Reachability Analyzer:** analiza si hay ruta entre dos puntos y **te dice qué componente la bloquea** (grupo de seguridad, NACL, tabla de rutas), sin enviar tráfico real. Es la primera herramienta cuando algo "no conecta".
- **Traffic Mirroring** y **Network Access Analyzer** para análisis más profundos.
- **Métricas** del NAT Gateway (`BytesOutToDestination`, `ErrorPortAllocation`) y de los balanceadores.

## Depurar "no conecta": una secuencia

1. **¿Resuelve el nombre?** (DNS: `nslookup`/`dig`). Un nombre que no resuelve parece un problema de red.
2. **¿Hay ruta de ida?** Tabla de rutas de la subred de origen.
3. **¿Hay ruta de vuelta?** Tabla de rutas del destino (y NAT/IGW si aplica).
4. **¿El grupo de seguridad de destino permite el origen y el puerto?**
5. **¿El grupo de seguridad de origen permite la salida?**
6. **¿Las NACL de ambas subredes permiten ida y vuelta?**
7. **¿Escucha realmente el servicio** en ese puerto y esa interfaz (no solo en `127.0.0.1`)?
8. **Reachability Analyzer** y **Flow Logs** para confirmar.

## Los gotchas, al punto

- **CIDR solapados** que impiden conectar redes después.
- **Subredes demasiado pequeñas** que se agotan (EKS, Lambda en VPC, muchas ENI).
- **Una sola zona** para todo, o un solo NAT que cae con la zona.
- **Todo en subredes públicas** "por ahora".
- **Peering asumido como transitivo.**
- **NAT Gateway cargando tráfico de S3** que un endpoint gratuito resolvería.
- **Tráfico entre zonas** cobrado en ambos sentidos: una arquitectura muy "conversadora" entre zonas suma.
- **Grupos de seguridad abiertos a `0.0.0.0/0`** en puertos de administración o bases de datos.
- **NACL con reglas que rompen las respuestas** (puertos efímeros).
- **Endpoints de interfaz** olvidados en muchas zonas, cobrando por hora cada uno.
- **DNS privado desactivado** en endpoints, de modo que el tráfico sigue saliendo por NAT.

## Un punto de partida razonable

Para una aplicación típica en una región, en código:

1. VPC `/16` con un esquema de direcciones documentado.
2. **Tres zonas**, con tres subredes públicas pequeñas (/24) y tres privadas de aplicación y tres privadas de datos más amplias.
3. **Un NAT Gateway por zona** en producción (uno solo en entornos de prueba, aceptando el riesgo).
4. **Endpoint Gateway de S3 y DynamoDB**; interfaces para los servicios que más tráfico generan.
5. **Grupos de seguridad por rol**, referenciándose entre sí.
6. **Flow Logs** activados hacia S3.
7. **Etiquetas** y definición completa como infraestructura como código.

## Para finalizar

Una VPC bien pensada es aburrida: rangos documentados, tres capas, endpoints donde ahorran, grupos de seguridad que se refieren unos a otros y registros de flujo encendidos. Esa aburrición es lo que evita rediseños con producción corriendo.

Antes de crear tu primera VPC, escribe el plan de direccionamiento de toda tu organización. Es la hora más rentable de todo el proyecto de red.
