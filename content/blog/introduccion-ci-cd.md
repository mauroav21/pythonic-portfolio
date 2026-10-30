---
title: "CI/CD a fondo: de un commit a producción con un pipeline en el que puedas confiar"
date: 2026-09-28
description: "Integración, entrega y despliegue continuos: diseño de pipelines rápidos, artefactos inmutables, estrategias de despliegue y migraciones de base de datos, un workflow real con GitHub Actions y OIDC hacia AWS, seguridad de la cadena de suministro y errores frecuentes."
tags: [CI/CD, DevOps, Automatización]
---

Hay un tipo de equipo que despliega una vez al mes, un sábado por la noche, con una lista de pasos manuales y tres personas pendientes del teléfono. Y hay otro que despliega varias veces al día, sin ceremonia, y cuando algo sale mal lo revierte en minutos. Rara vez la diferencia es talento: es un pipeline en el que se puede confiar y una forma de trabajar que lo hace posible.

CI/CD es esa forma de trabajar. Este artículo explica qué es de verdad, cómo se diseña un pipeline que no se vuelva un problema, y qué detalles lo separan de un "script que corre en un servidor".

## Las tres siglas, sin confundirlas

| Práctica | Qué es | Qué garantiza |
|---|---|---|
| **Integración continua (CI)** | Integrar cambios en la rama principal **con mucha frecuencia**, verificando cada uno automáticamente | Que lo que hay en la rama principal siempre compila y pasa las pruebas |
| **Entrega continua (CD)** | Que cada cambio verificado esté **siempre listo para desplegarse**; la decisión de liberar es humana o de negocio | Que desplegar es un acto trivial y sin riesgo |
| **Despliegue continuo (CD)** | Que cada cambio verificado **se despliega automáticamente** a producción | Que no hay pasos manuales entre el commit y el usuario |

No necesitas el despliegue continuo para beneficiarte. Muchas organizaciones reguladas se quedan en entrega continua con una aprobación explícita, y funciona muy bien. Lo que no es negociable es la **integración continua de verdad**.

### CI de verdad no es "tener un servidor de CI"

El error más común es creer que CI es una herramienta. Es una **práctica**:

- Cada persona integra a la rama principal **al menos una vez al día** (idealmente varias).
- Las ramas viven **horas o pocos días**, no semanas.
- La compilación y las pruebas corren **en cada cambio** y fallar es una emergencia del equipo: **la rama principal rota se arregla ya**.
- El resultado es rápido: **minutos, no horas**.

Si tienes un servidor de CI pero tu equipo integra ramas de tres semanas, tienes una herramienta de pruebas, no integración continua. El dolor de integrar crece de forma no lineal con el tamaño del cambio; por eso la solución es integrar más seguido, no menos.

## Anatomía de un pipeline

Un pipeline es una secuencia de etapas, cada una una **compuerta** (si falla, el cambio no avanza). Un orden razonable, de lo más barato y rápido a lo más lento y costoso:

```text
commit
  → 1. Validaciones rápidas   (formato, lint, tipos, análisis estático, secretos)      ~1 min
  → 2. Compilación            (build)                                                  ~2 min
  → 3. Pruebas unitarias      (en paralelo)                                            ~3 min
  → 4. Empaquetado            (artefacto/imagen, versionado, firmado)                  ~2 min
  → 5. Pruebas de integración (contra dependencias reales: BD, colas)                  ~5 min
  → 6. Despliegue a entorno de pruebas + pruebas de humo / E2E acotadas                ~5 min
  → 7. (Aprobación opcional)
  → 8. Despliegue a producción (gradual) + verificación + reversión automática
```

Principios de diseño:

1. **Falla rápido.** Lo que más se rompe y menos cuesta va primero.
2. **Paraleliza** lo independiente (pruebas por módulo, matriz de versiones).
3. **Cachea** dependencias y capas de construcción.
4. **Mantén la retroalimentación en menos de 10 minutos** para la parte que corre en cada commit. Más allá, la gente deja de esperar y de confiar.
5. **El pipeline es código**: vive en el repositorio, se revisa como cualquier cambio y se versiona.

## Construye una vez, promueve el artefacto

El principio más importante para tener despliegues confiables:

> **Construye el artefacto una sola vez, y promueve ese mismo artefacto por todos los entornos.**

Si recompilas para staging y para producción, lo que probaste **no es** lo que despliegas (distinto momento, dependencias que pudieron cambiar, otra configuración incrustada). En cambio:

- El pipeline produce un **artefacto inmutable** (imagen de contenedor, paquete, zip) identificado por un **hash o versión única** (el SHA del commit).
- **Lo que cambia entre entornos es la configuración**, inyectada en el despliegue (variables, secretos, parámetros), no el artefacto.
- Nunca uses una etiqueta mutable (`latest`) para desplegar: pierdes trazabilidad y la capacidad de revertir con precisión.

## Estrategias de despliegue

| Estrategia | Cómo funciona | Ventaja | Cuidado |
|---|---|---|---|
| **Recreate** | Detienes la versión vieja y arrancas la nueva | Simple | Hay indisponibilidad |
| **Rolling** | Reemplazas instancias poco a poco | Sin corte; sin capacidad extra | Conviven dos versiones un tiempo; reversión más lenta |
| **Blue/Green** | Dos entornos completos; cambias el tráfico de uno a otro | Reversión inmediata (cambias de vuelta) | Doble capacidad mientras dure; datos compartidos |
| **Canary** | Envías primero un pequeño porcentaje de tráfico a la versión nueva y vas ampliando | Detectas problemas con impacto mínimo | Requiere buenas métricas y automatización de decisión |
| **Feature flags** | El código se despliega apagado y se activa después | Separas **desplegar** de **lanzar**; apagado instantáneo | Deuda de flags viejas; combinaciones a probar |

Una práctica sólida combina: **despliegue gradual (canary/rolling)** con **verificación automática** (alarmas de errores y latencia) y **reversión automática** si se disparan, más **feature flags** para el riesgo funcional.

### Bases de datos: el escollo de los despliegues sin corte

Las migraciones son lo que rompe las estrategias elegantes, porque durante un despliegue **conviven dos versiones del código con una sola base**. Patrón seguro: **expandir y contraer**.

1. **Expandir:** añade columnas/tablas nuevas de forma compatible con el código viejo (nullables, con valores por defecto). Nada se elimina.
2. **Desplegar el código nuevo**, que escribe en ambos esquemas o lee el nuevo.
3. **Migrar los datos** en segundo plano.
4. **Contraer:** cuando nada usa lo viejo, elimínalo en un despliegue posterior.

Reglas: migraciones **versionadas y automatizadas** (Flyway, Liquibase, Alembic...), **hacia adelante** (evita "deshacer" como plan principal), y **nunca** un cambio incompatible en el mismo despliegue que el código que lo necesita.

## Un pipeline real: GitHub Actions hacia AWS sin llaves

Un ejemplo completo y moderno: pruebas, construcción de imagen, publicación en ECR y despliegue en ECS, autenticando con **OIDC** (sin guardar llaves de AWS en ningún secreto).

```yaml
name: ci-cd

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read          # mínimo por defecto

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  pruebas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: ruff check . && mypy src
      - run: pytest -q --maxfail=1 --junitxml=resultados.xml

  imagen:
    needs: pruebas
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write       # necesario para OIDC
      contents: read
    outputs:
      imagen: ${{ steps.meta.outputs.imagen }}
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/github-ci-publicar
          aws-region: us-east-1
      - id: login
        uses: aws-actions/amazon-ecr-login@v2
      - id: meta
        run: echo "imagen=${{ steps.login.outputs.registry }}/api-pedidos:${{ github.sha }}" >> "$GITHUB_OUTPUT"
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.imagen }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  despliegue-prod:
    needs: imagen
    runs-on: ubuntu-latest
    environment: produccion        # permite aprobación manual y secretos por entorno
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/github-ci-desplegar
          aws-region: us-east-1
      - run: |
          aws ecs update-service --cluster prod --service api-pedidos \
            --task-definition "$(./scripts/registrar-tarea.sh '${{ needs.imagen.outputs.imagen }}')"
          aws ecs wait services-stable --cluster prod --services api-pedidos
```

Decisiones que ahí aparecen y por qué importan:

- **`permissions` mínimos** por defecto y elevados solo donde hace falta.
- **`concurrency`** cancela ejecuciones obsoletas en una misma rama.
- **Caché** de dependencias y de capas de Docker.
- **Etiqueta de imagen = SHA del commit:** trazable e inmutable.
- **`environment`** con protección: aprobaciones manuales y secretos separados por entorno.
- **OIDC en lugar de llaves:** el rol de AWS confía en el repositorio y la rama concretos (la política de confianza debe restringir `sub` al repositorio y rama; sin eso, cualquier repositorio de GitHub podría asumirlo). Roles **distintos** para publicar y para desplegar.
- **`wait services-stable`:** el job no termina hasta confirmar que el servicio se estabilizó; combinado con el circuit breaker de ECS, un despliegue malo falla el pipeline y se revierte.

## Seguridad de la cadena de suministro

Tu pipeline ejecuta código de terceros con permisos sobre tu infraestructura: es un objetivo de ataque de primer nivel.

1. **Fija las acciones y dependencias por versión inmutable** (para acciones de terceros, el **SHA del commit**, no una etiqueta móvil).
2. **Permisos mínimos del token** de la plataforma y de los roles de nube.
3. **Credenciales temporales por OIDC**, no secretos de larga vida.
4. **Separa** los pipelines que ejecutan código no confiable (PR de forks) de los que acceden a secretos.
5. **Escanea**: dependencias (SCA), secretos, imágenes, código (SAST) e infraestructura como código.
6. **Genera una SBOM** y **firma** los artefactos; verifica la firma antes de desplegar.
7. **Protege la rama principal:** revisión obligatoria, estado de pipeline obligatorio, sin empujes directos.
8. **Aísla los runners** y usa efímeros siempre que sea posible.

## Pruebas dentro del pipeline

El pipeline es tan bueno como sus pruebas. Una distribución sana:

- **Muchas unitarias** (rápidas, en cada commit).
- **Integración** con dependencias reales (contenedores efímeros para bases de datos y colas).
- **Pocas E2E** sobre los flujos críticos, contra un entorno desplegado.
- **Pruebas de humo post-despliegue** en producción (¿responde `/salud`? ¿funciona el flujo mínimo?).
- **Pruebas no funcionales** (carga, seguridad) con menor frecuencia, pero automatizadas.

**Las pruebas inestables (*flaky*) matan la confianza.** Una prueba que falla al azar enseña a la gente a pulsar "reintentar" y a ignorar rojos reales. Trátalas como defectos: cuarentena inmediata, causa raíz, o eliminación.

## Medir el pipeline

Las métricas DORA aplican directamente:

| Métrica | Pregunta |
|---|---|
| **Frecuencia de despliegue** | ¿Cada cuánto llegamos a producción? |
| **Tiempo de entrega de cambios** | ¿Cuánto tarda un commit en llegar a producción? |
| **Tasa de fallo de cambios** | ¿Qué porcentaje de despliegues causa un problema? |
| **Tiempo de recuperación** | ¿Cuánto tardamos en restablecer el servicio? |

Más indicadores del propio pipeline: **duración** (p50 y p95), **tasa de éxito** en la rama principal, **inestabilidad de pruebas** y **tiempo en cola**. Úsalos para mejorar, no para presionar a nadie.

## Ramas y flujo de trabajo

| Modelo | Idea | Encaja con CI/CD |
|---|---|---|
| **Desarrollo basado en tronco (trunk-based)** | Todos integran en `main` con ramas muy cortas y *feature flags* | **Sí, es el más alineado** |
| **GitHub Flow** | Una rama por cambio, PR corto, merge a `main` y despliegue | Sí |
| **Gitflow** | Ramas de larga vida (`develop`, `release`, `hotfix`) | Choca con la integración frecuente; aceptable para software con versiones mantenidas en paralelo |

Si despliegas continuamente, el modelo con menos ramas casi siempre gana.

## Revertir: planifícalo antes de necesitarlo

Opciones de menor a mayor riesgo:

1. **Apagar una feature flag.**
2. **Revertir el tráfico** (blue/green) o **redesplegar el artefacto anterior** (que sigue disponible porque es inmutable).
3. **Revertir el commit** (`git revert`) y dejar que el pipeline despliegue.
4. **Hotfix hacia adelante**, solo cuando es pequeño y entendido.

Lo que impide revertir: cambios de esquema incompatibles, artefactos borrados y configuración que cambió junto con el código. Por eso el patrón expandir/contraer y los artefactos inmutables.

## Los gotchas, al punto

- **Ramas largas** que integran tarde y con dolor.
- **Pipeline lento** (más de 15–20 minutos en el camino principal): la gente lo evita.
- **Recompilar por entorno**, desplegando algo distinto de lo que probaste.
- **Pruebas inestables** toleradas.
- **Secretos en variables visibles** o en el repositorio.
- **Acciones o dependencias sin fijar**, vulnerables a cambios maliciosos.
- **Permisos excesivos del pipeline** (administrador de la cuenta).
- **Pasos manuales ocultos** que solo una persona conoce.
- **Despliegue automático sin monitoreo ni reversión.**
- **Migraciones de base de datos incompatibles** con la versión anterior.
- **Entornos de prueba muy distintos de producción.**
- **Medir solo velocidad**, sin estabilidad.
- **Un pipeline como "proyecto de otro equipo"**: debe ser propiedad de quien lo usa.

## Cómo empezar (o mejorar)

1. **Mide el estado actual:** ¿cuánto tarda un cambio de commit a producción? ¿cuántos pasos son manuales?
2. **Automatiza compilación y pruebas** en cada cambio y haz que la rama principal esté siempre verde.
3. **Produce un artefacto inmutable** y despliégalo automáticamente a un entorno de pruebas.
4. **Añade verificación posterior al despliegue** y reversión simple.
5. **Reduce el tamaño de los cambios** y el tiempo de vida de las ramas.
6. **Automatiza producción** con una estrategia gradual y alarmas.
7. **Endurece la cadena de suministro** (OIDC, permisos mínimos, escaneos, firmas).
8. **Revisa las métricas cada mes** y ataca el mayor cuello de botella.

## Para finalizar

CI/CD no se trata de herramientas sino de un contrato con tu equipo: integrar a menudo, mantener verde la rama principal, desplegar artefactos inmutables y tener un camino claro de ida y de vuelta. Cuando eso se cumple, desplegar deja de ser un evento y se convierte en una rutina.

La métrica que mejor resume tu pipeline es una sola: ¿cuánto tardas en llevar un cambio pequeño a producción y cuánto confías en que saldrá bien? Si ambas respuestas te incomodan, ya sabes por dónde empezar.
