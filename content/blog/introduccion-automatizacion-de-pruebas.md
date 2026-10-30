---
title: "Automatización de pruebas a fondo: estrategia, pirámide y pruebas que no se vuelven una carga"
date: 2026-08-05
description: "Qué automatizar y qué no, la pirámide de pruebas, buenas pruebas unitarias con ejemplos en pytest, pruebas de integración con contenedores, contratos, E2E con Playwright, pruebas inestables, datos de prueba, cobertura frente a mutación, rendimiento y errores frecuentes."
tags: [Pruebas, QA, Automatización]
---

Casi todos los equipos empiezan igual: pocas pruebas, mucho miedo a cambiar cosas y una persona que "sabe qué probar a mano antes de cada entrega". Luego deciden automatizar y, con las mejores intenciones, acaban con una suite lenta, frágil y que nadie quiere tocar, que falla sin razón los lunes y a la que se le aplica `skip` hasta dejarla inútil.

El problema casi nunca es la herramienta. Es la **estrategia**: qué probar, en qué nivel, con qué datos y cómo mantenerlo. Esta guía trata de eso.

## Para qué sirven las pruebas automáticas

1. **Dar confianza para cambiar.** Puedes refactorizar y desplegar sin rezar.
2. **Detectar regresiones rápido,** cuando el cambio está fresco y es barato de arreglar.
3. **Documentar el comportamiento esperado,** con ejemplos ejecutables.
4. **Sostener la entrega continua.** Sin pruebas automáticas, desplegar con frecuencia es una apuesta.
5. **Guiar el diseño.** Un código difícil de probar suele estar demasiado acoplado.

Y lo que **no** son: una garantía de que el software es correcto (una prueba verde solo dice que no falló lo que se verificó), ni un sustituto de las **pruebas exploratorias** humanas, que encuentran lo que nadie imaginó.

## La pirámide de pruebas, y por qué importa su forma

```text
            /\
           /E2E\          pocas, lentas, costosas, frágiles
          /------\
         /Integr. \       algunas, más lentas
        /----------\
       /  Unitarias \     muchas, muy rápidas, baratas
      /--------------\
```

| Nivel | Qué verifica | Velocidad | Cuánta confianza da por prueba | Costo de mantener |
|---|---|---|---|---|
| **Unitaria** | Una unidad de lógica, aislada | Milisegundos | Local y precisa | Bajo |
| **Integración** | Que varias piezas funcionen juntas (con BD, colas, APIs reales) | Segundos | Media | Medio |
| **Contrato** | Que productor y consumidor respeten su interfaz | Rápida | Alta en los límites | Bajo-medio |
| **Extremo a extremo (E2E)** | Un flujo completo como lo haría un usuario | Segundos a minutos | Amplia pero difusa | Alto |

La idea: **muchas pruebas baratas abajo, pocas caras arriba.** Si la proporción se invierte (el "cono de helado": casi todo E2E y manual), tendrás ciclos lentos, fallos difíciles de diagnosticar y suites que nadie ejecuta localmente.

Variantes del modelo que verás: el **"trofeo de pruebas"** (más peso a integración en aplicaciones donde las unidades casi no tienen lógica propia, como un frontend que sobre todo orquesta) y el **"panal"** para microservicios (el grueso en integración entre servicios más contratos). No son dogmas: el principio es **probar cada riesgo en el nivel más barato que lo detecte**.

## Pruebas unitarias que merecen existir

### Qué las hace buenas (FIRST)

- **Fast (rápidas):** toda la suite en segundos.
- **Isolated (aisladas):** no dependen unas de otras ni del orden.
- **Repeatable (repetibles):** mismo resultado siempre, sin depender de la hora, la red o el azar.
- **Self-validating (autoverificables):** pasan o fallan, sin interpretación humana.
- **Timely (oportunas):** se escriben junto con el código (o antes).

### Estructura: Arrange–Act–Assert

```python
# precios.py
def calcular_total(subtotal, pais, es_cliente_frecuente=False):
    tasa_iva = {"MX": 0.16, "CL": 0.19}.get(pais, 0.0)
    descuento = 0.05 if es_cliente_frecuente else 0.0
    base = subtotal * (1 - descuento)
    return round(base * (1 + tasa_iva), 2)
```

```python
# test_precios.py
import pytest
from precios import calcular_total

def test_aplica_iva_de_mexico():
    # Arrange
    subtotal = 100
    # Act
    total = calcular_total(subtotal, "MX")
    # Assert
    assert total == 116.00

def test_cliente_frecuente_recibe_descuento_antes_del_iva():
    assert calcular_total(100, "MX", es_cliente_frecuente=True) == 110.20

@pytest.mark.parametrize("pais, esperado", [("MX", 116.0), ("CL", 119.0), ("XX", 100.0)])
def test_iva_por_pais(pais, esperado):
    assert calcular_total(100, pais) == esperado

def test_subtotal_cero_da_cero():
    assert calcular_total(0, "MX") == 0
```

Prácticas que marcan la diferencia:

- **Un comportamiento por prueba,** con un nombre que lo describa (`test_cliente_frecuente_recibe_descuento_antes_del_iva`). Cuando falla, el nombre ya dice qué se rompió.
- **Prueba comportamiento, no implementación.** Si renombrar un método privado rompe diez pruebas, estás verificando el "cómo" y no el "qué".
- **Casos límite y de error:** cero, vacío, nulo, máximos, formatos inválidos, concurrencia.
- **Parametriza** para cubrir muchos casos sin copiar y pegar.
- **Evita lógica dentro de las pruebas** (condicionales, bucles): una prueba debe ser tan simple que no necesite pruebas.

### Dobles de prueba: usa el más simple que sirva

| Tipo | Qué es | Cuándo |
|---|---|---|
| **Stub** | Devuelve respuestas fijas | Controlar entradas indirectas |
| **Fake** | Implementación simplificada que funciona (BD en memoria) | Reemplazar infraestructura cuando importa el comportamiento |
| **Mock / Spy** | Registra y verifica llamadas | Cuando la **interacción** es el comportamiento a verificar |
| **Dummy** | Relleno que no se usa | Cumplir una firma |

Un exceso de *mocks* produce pruebas que verifican que el código llama a lo que llama, y pasan aunque el sistema real esté roto. Prefiere **fakes** y datos reales cuando sean baratos; usa mocks en los límites (reloj, red, servicios externos).

**Diseño para probar:** separa la lógica pura de los efectos secundarios. Inyecta dependencias (reloj, repositorios, clientes HTTP) en lugar de crearlas dentro. Eso se alinea con arquitecturas hexagonales y hace que la mayor parte de la lógica se pruebe sin infraestructura.

## Pruebas de integración: donde viven los bugs de verdad

Muchos defectos están en las **costuras**: consultas SQL que no hacen lo que crees, serialización, transacciones, migraciones, configuraciones. Las unitarias no los ven.

Lo que funciona hoy: levantar dependencias **reales y efímeras** en contenedores durante la prueba (por ejemplo, con **Testcontainers**), en lugar de bases de datos en memoria con comportamiento distinto al de producción.

```python
import pytest
from testcontainers.postgres import PostgresContainer
import sqlalchemy as sa

@pytest.fixture(scope="session")
def bd():
    with PostgresContainer("postgres:16") as pg:
        engine = sa.create_engine(pg.get_connection_url())
        aplicar_migraciones(engine)          # las mismas migraciones que en producción
        yield engine

def test_repositorio_guarda_y_recupera_pedido(bd):
    repo = RepositorioPedidos(bd)
    repo.guardar(Pedido(id="A001", total=116.0))
    assert repo.obtener("A001").total == 116.0
```

Ventajas: usa el mismo motor y las mismas migraciones que producción. Cuida el **aislamiento** (limpia datos entre pruebas, por transacción o por esquema) y el **tiempo** (reutiliza el contenedor por sesión).

## Pruebas de contrato

En sistemas con varios servicios, probar todo junto (E2E) es lento y frágil. Una **prueba de contrato** (por ejemplo, con **Pact**) verifica que:

- El **consumidor** declara qué espera de la API (formas y campos que usa).
- El **productor** verifica de forma independiente que cumple esas expectativas.

Así detectas un cambio incompatible **antes de desplegar**, sin levantar todo el sistema. Es una de las herramientas más rentables para equipos con APIs entre sí.

## Pruebas de extremo a extremo (E2E)

Verifican flujos críticos a través de la interfaz o la API pública. Pocas, bien elegidas: **registro y acceso, compra, pago**, lo que si falla es una emergencia.

```ts
import { test, expect } from '@playwright/test';

test('un cliente puede comprar un producto', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Zapatos' }).click();
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await page.getByRole('link', { name: 'Carrito' }).click();
  await page.getByRole('button', { name: 'Pagar' }).click();
  await expect(page.getByText('Pedido confirmado')).toBeVisible();
});
```

Claves para que no sufran:

- **Localiza elementos por rol y texto accesible** (`getByRole`), no por selectores CSS frágiles. Además, premia la accesibilidad.
- **Espera por condiciones, no por tiempo** (`await expect(...).toBeVisible()`, no `sleep(3000)`). Las esperas fijas son la primera fuente de pruebas inestables.
- **Datos propios por prueba** (usuarios y pedidos creados por API al empezar), no una base compartida y cambiante.
- **Independientes y paralelizables.**
- **Evidencia al fallar:** capturas, vídeo y trazas (Playwright las guarda).
- **Prueba lo esencial,** no cada combinación de la interfaz; eso se hace abajo en la pirámide.

## El problema de las pruebas inestables (*flaky*)

Una prueba que a veces pasa y a veces falla **sin que cambie el código** destruye la confianza: el equipo aprende a pulsar "reintentar" y deja de creerle al rojo. Causas habituales:

| Causa | Remedio |
|---|---|
| Esperas fijas / condiciones de carrera | Esperar por eventos o condiciones |
| Orden o estado compartido entre pruebas | Aislamiento y datos propios |
| Dependencia de reloj, zona horaria o azar | Inyectar reloj y semilla |
| Dependencias externas (red, terceros) | Dobles en el límite; entornos controlados |
| Recursos limitados en CI (paralelismo) | Dimensionar, limitar concurrencia |
| Datos que cambian | Datos creados por la prueba |

Política recomendada: una prueba inestable se **pone en cuarentena** (se saca del camino crítico, con un ticket y dueño), se **arregla de verdad** o se **elimina**. Reintentar automáticamente puede ocultar el problema; úsalo con medida y registra los reintentos.

## Datos de prueba

- **Crea los datos que necesitas dentro de cada prueba** (o con fábricas/*builders*), no dependas de una base precargada.
- **Hazlos mínimos y legibles:** solo los campos relevantes para el caso; el resto, valores por defecto.
- **Nunca uses datos reales de producción** sin anonimizarlos: son un riesgo legal y de seguridad.
- **Semillas controladas** para datos generados al azar.
- **Limpia o aísla** al terminar.

## ¿Cuánta cobertura es suficiente?

La **cobertura de código** dice qué líneas se ejecutaron durante las pruebas, **no** si se verificaron. Puedes tener 100 % con pruebas que no afirman nada.

- Úsala como **señal de lo no probado**, no como meta. Perseguir un porcentaje fomenta pruebas vacías.
- Una cobertura baja en código crítico es una alarma; una alta no es garantía.
- Complementa con **pruebas de mutación** (Stryker, mutmut, PIT): la herramienta modifica tu código (cambia un `>` por `>=`, elimina una línea) y comprueba que **alguna prueba falle**. Si ninguna falla, esa parte no estaba realmente verificada. Es una medida de **calidad** de las pruebas, más cara pero reveladora; aplícala a módulos críticos.

## TDD y BDD, con perspectiva

- **TDD (desarrollo guiado por pruebas):** escribes una prueba que falla, haces el mínimo código para que pase y refactorizas (rojo–verde–refactor). Produce diseños más simples y probables, y un historial de pruebas. No es obligatorio en todo; es muy valioso en lógica compleja.
- **BDD (desarrollo guiado por comportamiento):** expresa los casos con lenguaje de negocio (dado/cuando/entonces), útil para alinear a negocio, producto y desarrollo sobre ejemplos concretos. Su valor está en la **conversación**; si nadie de negocio lee los escenarios, es una capa de indirección innecesaria.

## Pruebas de rendimiento y de carga

Verifican cómo se comporta el sistema bajo uso. Ejemplo con **k6**:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // sube a 100 usuarios virtuales
    { duration: '5m', target: 100 },   // sostiene
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],  // p95 < 400 ms
    http_req_failed:   ['rate<0.01'],  // < 1 % de errores
  },
};

export default function () {
  const r = http.get('https://staging.ejemplo.com/api/productos');
  check(r, { 'estado 200': (res) => res.status === 200 });
  sleep(1);
}
```

Tipos: **carga** (uso esperado), **estrés** (hasta romper), **picos** (subidas bruscas), **resistencia** (horas, para fugas de memoria). Defínelas con **umbrales** que fallen el pipeline y ejecútalas contra un entorno comparable a producción, con **datos realistas**. Un resultado en un entorno pequeño no se extrapola a producción.

## Más allá de las pruebas previas: izquierda y derecha

- **Shift-left:** probar antes y más cerca del desarrollador (análisis estático, tipos, pruebas unitarias, revisión de código, pruebas de contrato).
- **Shift-right:** probar y observar **en producción**: despliegues graduales (canary) con alarmas, feature flags, **monitoreo sintético** (pruebas automáticas contra producción), pruebas de caos controladas y observabilidad. Ninguna prueba previa reproduce del todo la realidad.

## Pruebas en el pipeline

- **Ordena de rápido a lento** y falla pronto.
- **Paraleliza** (por archivo, por módulo, por fragmentos).
- **Cachea** dependencias; **reutiliza contenedores**.
- **Ejecuta en cada commit** las unitarias y de integración; las E2E y de carga, con la cadencia que el costo permita (en cada fusión a la rama principal, nocturnas).
- **Guarda los resultados** (formato JUnit) y los artefactos de fallo (capturas, trazas).
- **Mide:** duración, tasa de pruebas inestables, tiempo en cola, defectos escapados a producción.

## Qué automatizar y qué no

**Sí:**
- Lógica de negocio crítica y casos límite.
- Flujos principales del usuario.
- Cada defecto corregido (una prueba que lo reproduzca).
- Verificaciones repetitivas y propensas a error humano.
- Contratos entre servicios.

**No (o con cuidado):**
- Lo que cambia constantemente y aún no se estabiliza.
- Pruebas de un solo uso.
- Evaluaciones subjetivas (¿se ve bien?, ¿es agradable?): requieren personas.
- Combinaciones exhaustivas de interfaz: caras de mantener.

Y recuerda la **prueba exploratoria**: sesiones guiadas por curiosidad y experiencia que buscan lo inesperado. Encuentran los defectos que las pruebas automáticas, por definición, no anticipan.

## Antipatrones frecuentes

| Antipatrón | Problema | Alternativa |
|---|---|---|
| **Cono de helado** | Casi todo E2E y manual | Pirámide: más abajo, menos arriba |
| **Pruebas sin aserciones** | Cobertura vacía | Verificar resultados observables; mutación |
| **Probar la implementación** | Se rompen al refactorizar | Probar comportamiento público |
| **Excesivo uso de mocks** | Pasan aunque el sistema falle | Fakes y dependencias reales |
| **Pruebas dependientes entre sí** | Fallos en cascada y orden frágil | Aislamiento y datos propios |
| **Esperas fijas (`sleep`)** | Inestabilidad y lentitud | Esperas por condición |
| **Base de datos compartida y cambiante** | Resultados impredecibles | Datos creados por prueba, contenedores efímeros |
| **Objetivo de cobertura como meta** | Pruebas inútiles para llegar al número | Cobertura como indicador; mutación en lo crítico |
| **Suite lenta que nadie corre** | Retroalimentación tardía | Optimizar, paralelizar, separar niveles |
| **QA al final del proceso** | Calidad como puerta, no como práctica | Calidad construida por todo el equipo |

## Una estrategia mínima para empezar

1. **Elige los 5 riesgos más importantes** de tu producto.
2. **Cúbrelos en el nivel más bajo posible:** lógica con unitarias, costuras con integración, flujos esenciales con 3–5 pruebas E2E.
3. **Hazlas correr en cada cambio** dentro de un pipeline rápido.
4. **Cada bug corregido** deja una prueba nueva.
5. **Declara la política de inestables** y respétala.
6. **Revisa mensualmente** duración, estabilidad y defectos escapados.
7. **Deja espacio para exploración humana.**

## Para finalizar

Una buena suite de pruebas es un activo que acelera al equipo; una mala es una deuda que lo frena y que nadie se atreve a tirar. La diferencia está en probar cada riesgo en el nivel adecuado, mantener las pruebas rápidas y deterministas, tratarlas como código de primera clase y vigilar su salud como se vigila la de la producción.

Si hoy solo mejoras una cosa, que sea esta: haz que la suite que corre en cada commit tarde menos de diez minutos y que cuando falle, la causa sea siempre real.
