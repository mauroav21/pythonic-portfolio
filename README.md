# Pythonic Portfolio

Portafolio de desarrollador, desarrollado con Reflex (Python) y TailwindCSS.

La idea del proyecto es poder desplegar un portafolio web, tanto en escritorio como
para dispositivos móviles, ajustando una cantidad de archivos
mucho menor que con código realizado de manera tradicional, como con React.

## Índice

- [Demo](#demo)
  - [Versión de Escritorio](#versión-de-escritorio)
  - [Versión Móvil](#versión-móvil)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guía de Instalación](#guía-de-instalación)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Ejecución](#ejecución)
- [Personalización y Ajustes Necesarios](#personalización)
  - [Datos Personales](#datos-personales)
  - [Assets](#assets)
  - [Estilos CSS](#estilos-css)
  - [Configuración](#configuración)
- [Despliegue](#despliegue)
  - [Archivos de Configuración](#archivos-de-configuración)
  - [Pasos para Desplegar](#pasos-para-desplegar)


## Demo
Más allá de las imágenes mostradas aquí, puedes ver el proyecto en funcionamiento
[en esta liga](https://wallsified.is-a.dev/)

### Versión de Escritorio

https://github.com/user-attachments/assets/0a2bba12-4336-487f-8d19-11a30db85f22

### Versión Móvil

https://github.com/user-attachments/assets/6d2d9be9-19d8-4027-b149-b975765c93a4

## Estructura del Proyecto

```
├── portfolio/                      # Directorio principal de la aplicación
│   ├── components/                 # Componentes reutilizables
│   │   ├── atoms/                  # Componentes básicos
│   │   ├── molecules/              # Componentes intermedios
│   │   └── organisms/              # Componentes complejos
│   ├── config/                     # Configuraciones de la aplicación
│   ├── data/                       # Datos del portafolio
│   ├── layouts/                    # Layouts de la aplicación
│   ├── pages/                      # Páginas de la aplicación
│   ├── styles/                     # Configuración de estilos
│   └── portfolio.py                # Punto de entrada de la aplicación
├── assets/                         # Recursos estáticos
│   ├── documents/                  # Documentos (CV, etc.)
│   ├── images/                     # Imágenes
│   ├── favicon.ico                 # Icono del sitio
│   └── tailwind-theme.css          # Tema de TailwindCSS
├── .pre-commit-config.yaml         # Configuración de pre-commit
├── pyproject.toml                  # Configuración del proyecto Python
├── ruff.toml                       # Configuración de Ruff
├── rxconfig.py                     # Configuración de Reflex
├── uv.lock                         # Lock file de uv
├── requirements.txt                # Dependencias Python
├── vercel.json                     # Configuración de Vercel
└── build.sh                        # Script de construcción
```

## Guía de Instalación

### Requisitos Previos

- Python 3.10 o superior
- uv


### Instalación
- Clonar el repositorio:
```bash
git clone <repository-url>
cd pythonic-portfolio
```
- Instalar dependencias con uv. Esto creará automáticamente un entorno virtual e instalará todas las dependencias especificadas en `pyproject.toml` y `uv.lock`.

```bash
uv sync
```

- Activar el entorno virtual:

```bash
# En Linux/macOS
source .venv/bin/activate

# En Windows
.venv\Scripts\activate
```

- Instalar pre-commit hooks:

```bash
pre-commit install
```

Esto configurará automáticamente los hooks de pre-commit que ejecutarán:
- Ruff format: formateo automático del código
- Verificaciones de archivos (trailing whitespace, EOF, YAML, TOML, etc.)

### Ejecución

```bash
# Para inicializar Reflex
reflex init
# Para iniciar la aplicación
reflex run
# Formatear código
ruff format .
# Verificar linting
ruff check .
# Corregir automáticamente
ruff check --fix .
# Ejecutar hooks de pre-commit en todos los archivos
pre-commit run --all-files
# Ejecutar en archivos staged
pre-commit run
```

La aplicación estará disponible en `http://localhost:3000`. Puedes ejecutarla y ver como se ve
con la información de ejemplo.

> [!NOTE]
> También se inicializa el puerto 8000, pero no se utiliza al ser únicamente un frontend.


## Personalización

Para adaptar este portafolio a tu información personal, debes modificar los siguientes archivos:

### Datos Personales

Modifica todos los archivos en `portfolio/data/` y `portfolio/config/constants.py`.
Cada archivo te indica la forma en la que deben ser editados.

- `constants.py`: Las constantes a ocupar en tu proyecto: username, correo, etc.
- `certifications.py`: Tus certificaciones
- `communities.py`: Comunidades en las que participas
- `education.py`: Tu formación académica
- `experience.py`: Tu experiencia laboral
- `materials.py`: Materiales, charlas o recursos que hayas creado
- `projects.py`: Tus proyectos personales o profesionales
- `technologies.py`: Tecnologías en las que puedes demostrar habilidad.

### Assets

Reemplaza o añade tus propios recursos en `assets/`:

- `assets/images/`: Foto de perfil, logos, capturas de proyectos, etc.)
- `assets/documents/`: CV y otros documentos que necesites.
- `assets/favicon.ico`: Reemplaza con tu propio favicon.

### Estilos CSS

Ajusta los estilos para que concuerden con tu identidad visual:

- `portfolio/styles/styles.py`: Contiene la configuración de estilos y tema de TailwindCSS
- `assets/tailwind-theme.css`: Define las variables CSS y el tema global

> [!IMPORTANT]
> Asegúrate de que las variables de los colores sean consistentes entre ambos archivos, de manera contraria
> no podrás usar dichos colores en algún otro ajuste que tú realices desde las `class_name` los componentes.

### Configuración

- `rxconfig.py`: Modifica el nombre de la aplicación si lo deseas
- `pyproject.toml`: Actualiza el nombre, versión y descripción del proyecto

> [!IMPORTANT]
> El nombre del proyecto debe coincidir no solo en estos archivos, sino también
> debe ser el nombre de la carpeta donde se encuentren los componentes y el nombre
> del archivo desde donde se ejecutan.

## Despliegue

Este proyecto está pensado para desplegarse en Vercel como un sitio estático. Eso no significa
que no puedas hacerlo en otro sitio.

### Archivos de Configuración

- `vercel.json`: Configura el proceso de build y las rutas
- `build.sh`: Script que ejecuta Vercel para construir el proyecto

### Pasos para Desplegar

- Conecta tu repositorio a Vercel:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Vercel detectará automáticamente la configuración de `vercel.json`

- Configuración en Vercel:
   - Framework Preset: Other
   - Build Command: `bash build.sh`
   - Output Directory: `public/`

- Despliegue
> [!NOTE]
> Vercel desplegará automáticamente en cada push a tu rama principal. Esto se realiza mediante `build.sh`
> que se encargará de:
  - Crear un entorno virtual
  - Instalar dependencias
  - Exportar la aplicación como sitio estático
  - Generar el directorio `public/` con todos los archivos

## FAQs

### ¿Por qué en algo tan poco ortodoxo como Python?
Simplemente por qué Reflex lo permite hacer. Es una manera distinta de crear
aplicaciones web y no por eso significa que sea una mala idea.

### ¿Cómo es qué funciona en móvil también?
La aplicación tiene componentes que se ajustan a esos dispositivos y otros más
están configurados para solo aparecer en ellos. Reflex ya cuenta con funciones que
permiten usarlos según el caso.

### ¿En qué cambia la versión móvil a la de escritorio?
El layout de ésta versión está pensado como una unica web que deslizas, por lo que
no hay una navbar y la forma en la que presenta la información de usuario se ajusta.
Fuera de eso, en ambas versiones existe la misma información.

### ¿Qué bibliotecas de íconos se utilizan?
Por default, Reflex trabaja con [Lucide Icons](https://lucide.dev/icons/), pero
puedes añadir una desde [constants.py](portfolio/config/constants.py) indicando
su hoja de estilos. En mi caso uso también [Devicons](https://devicon.dev/)

### ¿Algúna otra forma de despliegue que recomiendes?
Si utilizas [build.sh](build.sh) de manera local y obtienes el archivo comprimido
con el puro frontend, puedes desplegarlo usando AWS Amplify, con todo lo que
eso involucra.

### Algunas de las secciones del portafolio no aplican conmigo, ¿puedo quitarlas?
Se puede hacer, pero debes tener cuidado con lo que se elimina.
Para eliminarlas debes:
- Retirarlas de [navbar.py](portfolio/components/organisms/navbar.py)
- Quitar la metadata correspondiente en [metadata.py](portfolio/config/metadata.py)
- Borrar los archivos correspondientes en [/pages](portfolio/pages), [/organisms](portfolio/components/organisms)
y [/data](portfolio/data)
- Borrar los imports correspondientes de los archivos `__init__.py` de las carpetas de arriba.
- Borrar los módulos correspondientes en [mobile_layout.py](portfolio/layouts/mobile_layout.py)
- Borrar los imports de las páginas del archivo de ejecución (por default es [portfolio.py](portfolio/portfolio.py))

## Copyright
El código original del este repo es obra de [wallsified](https://wallsified.is-a.dev/), pero cualquier modificación
posterior a este repo es por y pertenece a la comunidad [Sudo FCiencias](https://linktr.ee/sudo_FCiencias).
