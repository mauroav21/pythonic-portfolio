---
title: "Introducción a la arquitectura cloud: conceptos para empezar bien"
date: 2026-10-30
description: "Modelos de servicio, regiones y zonas de disponibilidad, responsabilidad compartida y los principios de un buen diseño en la nube."
tags: [Cloud, Arquitectura, AWS]
---

"Migrar a la nube" suele entenderse como mover servidores a otro lugar. Si solo haces eso, obtienes los mismos problemas con una factura distinta. La arquitectura cloud consiste en diseñar aprovechando lo que la nube ofrece: recursos bajo demanda, servicios administrados y capacidad de crecer y recuperarse automáticamente.

## Qué es la nube, en concreto

Según la definición del NIST, la computación en la nube se caracteriza por:

- **Autoservicio bajo demanda:** creas recursos cuando los necesitas, sin tickets ni esperas.
- **Acceso por red:** todo se maneja por interfaces y APIs.
- **Recursos compartidos:** el proveedor atiende a muchos clientes con la misma infraestructura.
- **Elasticidad:** escalas hacia arriba o abajo según la demanda.
- **Servicio medido:** pagas por lo que usas.

## Modelos de servicio

| Modelo | Tú administras | El proveedor administra | Ejemplo |
|---|---|---|---|
| **IaaS** (infraestructura) | Sistema operativo, runtime, aplicación | Hardware, virtualización, red | EC2 |
| **PaaS** (plataforma) | Aplicación y datos | Todo lo demás | Elastic Beanstalk |
| **SaaS** (software) | Solo el uso | Todo | Correo, CRM en línea |
| **Serverless / FaaS** | Tu código | Servidores, escalado | Lambda |

A medida que subes hacia SaaS delegas más operación, pero controlas menos. No hay un nivel correcto: depende de cuánto control necesitas y cuánto quieres operar.

## Geografía: regiones y zonas de disponibilidad

- **Región:** ubicación geográfica con varios centros de datos, como us-east-1 o sa-east-1.
- **Zona de disponibilidad (AZ):** uno o más centros de datos independientes dentro de una región, con energía, red y refrigeración propias, conectados entre sí con baja latencia.
- **Ubicaciones de borde:** puntos más cercanos al usuario, usados por redes de entrega de contenido.

Distribuir tu aplicación en **varias AZ** te protege ante la falla de un centro de datos. Usar **varias regiones** te protege ante fallas regionales, pero añade complejidad y costo; pocos sistemas lo necesitan.

## Responsabilidad compartida

Es un concepto que mucha gente malinterpreta. En AWS, por ejemplo:

- **El proveedor es responsable de la seguridad "de" la nube:** instalaciones, hardware, red, el software base de los servicios.
- **Tú eres responsable de la seguridad "en" la nube:** tus datos, tu configuración, tus accesos, tus aplicaciones, el sistema operativo si usas IaaS.

Casi todos los incidentes de seguridad en la nube vienen de configuraciones del cliente, como un bucket abierto o credenciales expuestas, y no de fallas del proveedor.

## Principios de un buen diseño en la nube

AWS publica el **Well-Architected Framework**, con seis pilares que sirven como lista de revisión en cualquier nube:

1. **Excelencia operativa:** operar y mejorar con automatización y observabilidad.
2. **Seguridad:** proteger datos y accesos, con el mínimo privilegio.
3. **Fiabilidad:** recuperarte de fallas y escalar con la demanda.
4. **Eficiencia de rendimiento:** usar los recursos adecuados.
5. **Optimización de costos:** pagar solo lo necesario.
6. **Sostenibilidad:** reducir el impacto ambiental.

## Patrones que cambian cuando diseñas para la nube

- **Diseña asumiendo que todo falla.** Una instancia puede desaparecer; la aplicación debe tolerarlo.
- **Prefiere acoplamiento débil.** Colas y eventos entre componentes en lugar de llamadas síncronas rígidas.
- **Automatiza.** Infraestructura como código en lugar de clics manuales.
- **Escala horizontalmente.** Agrega más instancias pequeñas en lugar de una gigantesca.
- **Haz los componentes sin estado**, y guarda el estado en servicios dedicados.
- **Usa servicios administrados** cuando tengan sentido, para dedicar tu tiempo a lo que diferencia a tu negocio.

## Un ejemplo básico: aplicación web de tres capas

| Capa | Servicios típicos |
|---|---|
| Entrada | DNS, CDN, balanceador de carga |
| Aplicación | Instancias o contenedores en varias AZ, con escalado automático |
| Datos | Base de datos administrada con réplica en otra AZ |
| Soporte | Monitoreo, registros, respaldos, gestión de accesos |

## Costos: ventaja y riesgo

La nube convierte inversión inicial en gasto continuo. Es una ventaja si lo controlas y un susto si no. Etiqueta recursos, configura alertas de presupuesto, apaga lo que no usas y revisa el gasto con regularidad.

## Errores frecuentes

- **Lift and shift sin repensar** y esperar ahorros automáticos.
- **Sin infraestructura como código:** entornos imposibles de reproducir.
- **Una sola AZ** para sistemas importantes.
- **Permisos excesivos** "para que funcione".
- **Ignorar los costos** hasta que llega la factura.

## Para finalizar

Arquitectura cloud es decidir cuánto operas tú y cuánto el proveedor, distribuir para tolerar fallas, automatizar y cuidar seguridad y costos desde el inicio. Los pilares del Well-Architected Framework son una buena brújula incluso si no usas AWS.

En esta serie siguen artículos sobre los servicios principales de AWS que dan forma a estos conceptos.
