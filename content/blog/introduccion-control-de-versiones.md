---
title: "Git a fondo: el modelo mental, flujos de equipo y cómo deshacer casi cualquier cosa"
date: 2026-06-12
description: "Cómo piensa Git por dentro (commits, ramas, HEAD, índice), flujos de trabajo y estrategias de ramas, merge frente a rebase, mensajes de commit, revisión de código, cómo deshacer errores (restore, reset, revert, reflog), secretos en el historial y una hoja de referencia."
tags: [Git, Control de versiones, Fundamentos]
---

Mucha gente usa Git durante años con cinco comandos memorizados (`add`, `commit`, `push`, `pull` y una oración cuando algo sale mal). Funciona hasta que aparece un conflicto raro, un commit en la rama equivocada o un `push` rechazado, y entonces cada comando se vuelve un ritual con riesgo de perder trabajo.

El antídoto es entender el **modelo mental** de Git. Con él, los comandos dejan de ser conjuros y se vuelven consecuencias lógicas. Esta guía va de eso, y termina con cómo deshacer prácticamente cualquier error.

## Qué problema resuelve

El control de versiones guarda la historia de un proyecto: qué cambió, cuándo, quién y por qué. Sin él, aparecen `proyecto_final_v2_ahora_sí` y, peor, dos personas pisándose el mismo archivo. Con él puedes:

- **Volver atrás** a cualquier punto.
- **Trabajar en paralelo** sin pisarse y combinar el resultado.
- **Experimentar** sin riesgo, en ramas desechables.
- **Auditar** quién cambió qué y por qué.
- **Automatizar** (CI/CD, despliegues, infraestructura como código) sobre una fuente de verdad.

Git, creado por Linus Torvalds en 2005 para el kernel de Linux, es **distribuido**: cada clon contiene la historia completa. Por eso casi todo funciona sin red, las ramas son baratas y no hay un punto único de falla.

## El modelo mental

### Git guarda instantáneas, no diferencias

Cada **commit** es una fotografía del proyecto completo en un momento (Git es eficiente guardando solo lo que cambió, pero conceptualmente es una instantánea). Cada commit apunta a su **padre** (o padres), formando un grafo:

```text
A ← B ← C ← D          (main)
          ↖
           E ← F        (feat/login)
```

Es un **grafo acíclico dirigido**: la historia nunca se modifica, solo se **añaden** commits. (Cuando "reescribes" historia, en realidad creas commits nuevos y mueves un apuntador.)

### Los objetos y el identificador

Todo en Git se identifica por un hash (SHA) del contenido:

| Objeto | Qué es |
|---|---|
| **blob** | El contenido de un archivo |
| **tree** | Un directorio: lista de blobs y otros trees |
| **commit** | Un tree + padre(s) + autor + mensaje |
| **tag** | Una etiqueta con nombre sobre un commit |

Que el identificador dependa del contenido (y del padre) significa que **no se puede alterar un commit sin cambiar su identidad**, y que la integridad de la historia está garantizada.

### Ramas, HEAD y referencias

- Una **rama** es solo un **apuntador móvil a un commit**. Crear una rama es crear un archivo de 41 bytes: por eso es instantáneo.
- **`HEAD`** es "dónde estás": normalmente apunta a una rama, que a su vez apunta a un commit. Cuando haces commit, la rama avanza.
- **`HEAD` separado** (*detached*) ocurre cuando apuntas directamente a un commit, no a una rama; si haces commits ahí y cambias de rama, esos commits quedan "huérfanos" (recuperables con `reflog`).
- Un **remoto** (por ejemplo, `origin`) es otro repositorio con el que sincronizas; `origin/main` es tu **copia local de lo que `main` era en el remoto** la última vez que hablaste con él.

### Las tres zonas

```text
 Directorio de trabajo   →  git add  →   Índice (staging)   →  git commit  →  Repositorio
 (tus archivos)                          (lo que va al                         (la historia)
                                          próximo commit)
```

El **índice** te deja construir commits limpios: puedes editar cinco archivos y commitear solo los cambios que pertenecen al mismo propósito (`git add -p` elige trozos).

## El flujo diario

```bash
git switch main
git pull                          # trae y combina lo último
git switch -c feat/descuento      # nueva rama desde main

# ...editas...
git status                        # qué cambió
git diff                          # ver cambios sin preparar
git add -p                        # elegir qué incluir, trozo a trozo
git commit -m "Aplicar descuento a clientes frecuentes"

git push -u origin feat/descuento # publicar la rama
# abrir un pull request; tras revisión y aprobación, se integra
```

Comandos de lectura que debes dominar:

```bash
git log --oneline --graph --all   # el grafo de ramas en una vista compacta
git show <commit>                 # qué cambió un commit
git diff main...feat/descuento    # cambios de la rama desde que se separó de main
git blame archivo.py              # quién tocó cada línea y en qué commit
git log -S"calcular_iva"          # commits que añadieron o quitaron ese texto
```

## Buenos commits

Un commit es una unidad de **historia**. Si lo haces bien, la historia sirve para entender y depurar; si no, es ruido.

- **Una idea por commit:** "Corregir cálculo de IVA" y "Renombrar variables" van separados.
- **Que compile y pase las pruebas** (cada commit es un punto al que alguien podría volver).
- **Mensaje útil.** La convención clásica:

```text
Corregir redondeo del IVA en facturas con descuento

El descuento se aplicaba después del IVA, lo que generaba diferencias de
centavos frente a la factura del SAT. Ahora se aplica sobre la base.

Cierra #482
```

Línea de resumen corta (~50 caracteres) en imperativo, línea en blanco, y un cuerpo que explique **el porqué**, no el qué (el qué lo dice el diff). Muchos equipos adoptan **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`...) para automatizar versiones y registros de cambios.

## Estrategias de ramas

| Modelo | Idea | Cuándo |
|---|---|---|
| **Basado en tronco (trunk-based)** | Todos integran en `main` con ramas de horas o pocos días; funciones incompletas tras *feature flags* | Entrega continua; equipos con buenas pruebas |
| **GitHub Flow** | Rama por cambio → PR → merge a `main` → despliegue | La mayoría de equipos web |
| **Gitflow** | `develop`, `release`, `hotfix` de larga vida | Software con versiones mantenidas en paralelo; pesado para despliegue continuo |

Regla de fondo: **cuanto más viven las ramas, más duele integrarlas.** Ramas cortas, cambios pequeños, integración frecuente.

## Merge, rebase y squash

Tres formas de integrar el trabajo de una rama:

| | **Merge** | **Rebase** | **Squash merge** |
|---|---|---|---|
| Qué hace | Une dos historias con un commit de fusión | Reaplica tus commits encima de la punta de otra rama | Comprime todos los commits de la rama en uno |
| Historia | Conserva el grafo real | Lineal | Lineal; un commit por PR |
| Reescribe commits | No | **Sí** (nuevos hashes) | Crea uno nuevo |
| Riesgo | Historia "ruidosa" | **Peligroso en ramas compartidas** | Pierdes el detalle de los commits intermedios |

```bash
# Actualizar tu rama con lo último de main, con historia lineal
git fetch origin
git rebase origin/main

# Si ya publicaste la rama, necesitarás actualizar el remoto:
git push --force-with-lease       # nunca --force a secas
```

**La regla de oro del rebase:** **no reescribas historia que otras personas ya descargaron.** Sobre tu rama personal, adelante; sobre `main` o ramas compartidas, no. Y `--force-with-lease` falla si alguien más empujó mientras tanto, a diferencia de `--force`, que borra su trabajo sin avisar.

Preferencias comunes: **squash merge** para PR pequeños (historia limpia, un commit por cambio) o **rebase + merge** para conservar commits bien curados. Lo importante es que el equipo **elija una convención** y la use.

### Limpiar tus commits antes de compartirlos

```bash
git rebase -i HEAD~4              # reordenar, fusionar, renombrar los últimos 4
git commit --fixup <commit>       # corrige un commit anterior...
git rebase -i --autosquash main   # ...y se fusiona solo en su lugar
```

## Resolver conflictos sin pánico

Un conflicto aparece cuando dos ramas modifican las mismas líneas y Git no sabe cuál conservar. Git marca el archivo:

```text
<<<<<<< HEAD
total = subtotal * 1.16
=======
total = subtotal * (1 + TASA_IVA)
>>>>>>> feat/descuento
```

Pasos:

1. `git status` te dice qué archivos están en conflicto.
2. Edita cada uno: decide el resultado final y **elimina los marcadores**.
3. `git add archivo` para marcarlo resuelto.
4. `git merge --continue` (o `git rebase --continue`).
5. Si te pierdes: `git merge --abort` / `git rebase --abort` te devuelve al estado anterior.

Qué reduce los conflictos de verdad: ramas cortas, integrar `main` con frecuencia, hablar con quien toca la misma zona, formateo automático compartido y no reordenar archivos sin motivo.

## Deshacer cosas: el mapa

Aquí es donde se pierde la gente. El truco es identificar **dónde está el cambio** (¿sin preparar?, ¿preparado?, ¿ya commiteado?, ¿ya publicado?).

| Situación | Comando |
|---|---|
| Descartar cambios no preparados de un archivo | `git restore archivo` |
| Sacar un archivo del índice (conservando los cambios) | `git restore --staged archivo` |
| Corregir el **último commit** (mensaje o contenido), aún sin publicar | `git commit --amend` |
| Deshacer el último commit, **conservando** los cambios preparados | `git reset --soft HEAD~1` |
| Deshacer el último commit, conservando los cambios sin preparar | `git reset HEAD~1` (equivale a `--mixed`) |
| Deshacer el último commit **y descartar** los cambios | `git reset --hard HEAD~1` ⚠️ |
| Deshacer un commit **ya publicado** sin reescribir historia | `git revert <commit>` |
| Guardar cambios a medias para cambiar de tarea | `git stash` / `git stash pop` |
| Traer un commit concreto de otra rama | `git cherry-pick <commit>` |
| Volver a un archivo como estaba en otro commit | `git restore --source=<commit> archivo` |

Las tres variantes de `reset`:

- **`--soft`**: mueve la rama; el índice y los archivos quedan intactos.
- **`--mixed`** (por defecto): mueve la rama y vacía el índice; los archivos quedan intactos.
- **`--hard`**: mueve la rama y **sobrescribe** índice y archivos. Es la única que puede perder trabajo no commiteado.

**Regla práctica:** para historia **no publicada**, `reset`/`amend`/`rebase` están bien. Para historia **publicada**, usa **`revert`**, que crea un commit nuevo que deshace el anterior y no molesta a nadie.

### La red de seguridad: `reflog`

Git registra todos los movimientos de `HEAD` durante unas semanas (por defecto, 90 días para entradas alcanzables y 30 para las no alcanzables). Si hiciste un `reset --hard` y te arrepientes, o borraste una rama con trabajo:

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3
# 9f8e7d6 HEAD@{1}: commit: Agregar validación de correo   ← ahí estaba tu trabajo

git switch -c rescate 9f8e7d6     # recupéralo en una rama nueva
```

Saber que casi todo lo commiteado se puede recuperar quita mucho miedo. (Lo que **nunca** se commiteó, un `reset --hard` o un `restore` sí lo pierde.)

### Encontrar cuándo se rompió algo: `bisect`

```bash
git bisect start
git bisect bad                    # el commit actual está roto
git bisect good v2.3.0            # esta versión funcionaba
# Git te lleva a commits intermedios; en cada uno pruebas y marcas good/bad
git bisect run pytest tests/test_facturas.py   # o automatízalo
git bisect reset
```

Con búsqueda binaria encuentras el commit culpable entre cientos en pocos pasos.

## Colaborar bien: pull requests y revisión

Un PR es donde Git se vuelve práctica de equipo.

**Al abrirlo:**
- **Pequeño** (idealmente menos de unos cientos de líneas): los PR enormes reciben revisiones superficiales.
- **Descripción útil:** qué cambia, por qué, cómo se probó, qué riesgos hay, capturas si es visual.
- **Que el pipeline pase** antes de pedir revisión.
- **Una sola intención** por PR.

**Al revisar:**
- Revisa **comportamiento y riesgo** antes que estilo (el estilo lo automatizan formateadores y linters).
- Sé específico y amable: critica el código, no a la persona; pregunta antes de asumir.
- Distingue lo **bloqueante** de las sugerencias.
- Responde con rapidez: un PR que espera días rompe el flujo.

**Protecciones de rama (`main`):** exige revisión, estados de pipeline obligatorios, sin empujes directos ni reescritura de historia, y (cuando proceda) commits firmados.

## Secretos y archivos que no deben entrar

Lo que entra en el historial **queda ahí**, aunque lo borres en un commit posterior.

- **`.gitignore`** para dependencias (`node_modules/`), artefactos de compilación, archivos locales (`.env`), carpetas de IDE y datos.
- **Nunca** subas contraseñas, llaves de API ni certificados. Usa gestores de secretos y variables de entorno.
- **Si un secreto llegó al repositorio:** (1) **revócalo y rótalo de inmediato**, porque ya debes asumirlo comprometido (los bots rastrean repositorios públicos en minutos); (2) opcionalmente, limpia la historia con `git filter-repo` y fuerza el push, avisando al equipo; (3) investiga si se usó.
- **Escáneres de secretos** en el pipeline y en un hook previo al commit (por ejemplo, gitleaks o el escaneo de la plataforma).
- **Archivos grandes y binarios:** usa **Git LFS** o un almacén de artefactos; los repositorios con binarios enormes se vuelven lentos de clonar.

## Etiquetas, versiones y lanzamientos

- **Etiquetas** (`git tag -a v1.4.0 -m "Versión 1.4.0"`) marcan puntos de lanzamiento.
- **Versionado semántico (SemVer):** `MAYOR.MENOR.PARCHE`. Sube el MAYOR por cambios incompatibles, el MENOR por funciones compatibles y el PARCHE por correcciones.
- **Un lanzamiento** reproducible = un commit etiquetado + un artefacto construido por el pipeline a partir de él.

## Una historia propia: tres personas, una sola rama

Lo que más me enseñó sobre Git no fue un curso, fue un proyecto con una fecha muy ajustada. Éramos tres desarrolladores enviando cambios a `main` al mismo tiempo, para llegar a una salida en tiempo récord. Los pull requests chocaban con frecuencia porque tocábamos los mismos archivos, y una vez llegamos a trabajar, sin darnos cuenta, la misma funcionalidad.

Nada de eso se arregla con un comando. Se arregla con acuerdos: **quién trabaja qué**, ramas de vida corta, integrar con frecuencia y comunicar antes de empezar, no después de chocar. Fue una lección de coordinación más que de técnica.

## Cómo manejamos las ramas hoy

En mi equipo trabajamos con una **definición de terminado (DoD)** adaptada a las medidas de la empresa: un cambio no está listo hasta que cumple lo acordado (pruebas, revisión, controles de seguridad, trazabilidad). Y combinamos **ramas de vida corta**, para el trabajo diario, con **ramas de vida larga** donde el proceso lo exige. Mi preferencia sigue siendo la corta, por todo lo que explicaba arriba sobre el dolor de integrar tarde.

## Herramientas y ajustes que ayudan

```bash
git config --global user.name  "Tu Nombre"
git config --global user.email "tu@correo.com"
git config --global init.defaultBranch main
git config --global pull.rebase false          # o true, según la convención del equipo
git config --global rerere.enabled true        # recuerda cómo resolviste conflictos repetidos
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global push.autoSetupRemote true  # el primer push crea la rama remota
```

- **Hooks** (`pre-commit`, `commit-msg`, `pre-push`): validan formato, pruebas rápidas y secretos antes de que algo salga de tu máquina (herramientas como `pre-commit` o `husky` los gestionan).
- **Commits firmados** (GPG/SSH) para verificar autoría.
- **`git worktree`**: varias ramas abiertas a la vez en carpetas distintas, sin clonar de nuevo.
- **Clones parciales y *sparse checkout*** para monorepos enormes.

## Monorepo o varios repositorios

| | **Monorepo** | **Varios repositorios** |
|---|---|---|
| Cambios que cruzan proyectos | Un solo PR atómico | Varios PR coordinados |
| Compartir código | Directo | Paquetes versionados |
| Permisos | Más difícil de acotar | Por repositorio |
| Rendimiento de Git/CI | Requiere herramientas (builds incrementales) | Sencillo por repositorio |
| Descubrimiento | Todo a la vista | Disperso |

No hay un ganador universal; depende de cómo se acoplan tus proyectos y del tamaño del equipo.

## Desastres comunes y cómo salir

| Desastre | Qué hacer |
|---|---|
| Hice commit en `main` en vez de en una rama (sin publicar) | `git switch -c mi-rama` (conserva el commit) → luego en `main`: `git reset --hard origin/main` |
| Cometí un error en el último commit | `git commit --amend` |
| `push` rechazado ("non-fast-forward") | `git fetch` y `git rebase origin/<rama>` (o `merge`); no uses `--force` a ciegas |
| Borré una rama con trabajo | `git reflog` → `git switch -c rescate <hash>` |
| Hice `reset --hard` y perdí commits | `git reflog` → recupera el hash |
| Subí un secreto | Revoca y rota **primero**; luego limpia la historia |
| Merge salió mal a medias | `git merge --abort` |
| Quiero ver quién cambió una línea y por qué | `git blame` y `git log -S` |
| Un commit viejo rompió algo y no sé cuál | `git bisect` |
| Necesito un solo cambio de otra rama | `git cherry-pick` |
| Mi rama está muy desactualizada y llena de conflictos | Integra `main` en etapas, o rebase interactivo para simplificar primero |

## Errores frecuentes

- **Commits gigantes** e imposibles de revisar.
- **Mensajes inútiles** ("fix", "cambios", "wip").
- **Trabajar directo en `main`.**
- **Ramas de semanas** que se integran con dolor.
- **`push --force`** sobre ramas compartidas.
- **Subir secretos o archivos generados.**
- **Rebase de ramas ya compartidas.**
- **No leer el mensaje de error de Git:** suele explicar el siguiente paso.
- **Aprender comandos sin el modelo mental**, y por eso temerles.

## Una hoja de referencia mínima

```text
Ver       status · diff · log --oneline --graph --all · show · blame
Preparar  add · add -p · restore --staged
Guardar   commit · commit --amend · stash
Ramas     switch · switch -c · branch -d · merge · rebase · cherry-pick
Remoto    fetch · pull · push · push -u · push --force-with-lease
Deshacer  restore · reset (--soft/--mixed/--hard) · revert · reflog
Buscar    bisect · log -S · grep
Marcar    tag
```

## Para finalizar

Git deja de intimidar cuando recuerdas tres ideas: la historia se compone de instantáneas enlazadas, las ramas son solo apuntadores baratos, y casi cualquier error es recuperable porque Git rara vez borra de verdad (el `reflog` es tu amigo).

A partir de ahí, lo que hace trabajar bien en equipo no son los comandos sino los hábitos: commits pequeños y con sentido, ramas cortas, revisión constante, nada de secretos en el repositorio y una convención compartida de cómo se integra. Es la base sobre la que se apoya todo lo demás: CI/CD, infraestructura como código y la confianza para cambiar un sistema sin miedo.
