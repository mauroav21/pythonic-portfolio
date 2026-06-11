"""
Constantes globales. La idea es que aquí definas tu información
base (nombre, username, correo, etc.) a usar en distintos componentes
y lugares de la página.

Lo demás, como tu experiencia laboral, se espera que esté alojada en
portfolio/data.
"""

# CSS para utilizar los Devicons en /atoms/external_icon.py y /atoms/ext_icon_chip.py
DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"

# Información personal - Reemplaza con tus datos
AUTHOR_NAME = "Mauro Alvarado"
AUTHOR_USERNAME = "@mauroav.dev"
AUTHOR_EMAIL = "contacto@mauroav.dev"
AUTHOR_LOCATION = "Saltillo, México"
AUTHOR_OCCUPATIONS = "Computer Systems Engineering | SCM Engineer | DevOps & Cloud Enthusiast"
GREETING_MESSAGE = "Hola, soy Mauro Alvarado."

# URLs de tus redes y/o medios de contacto.
GITHUB_URL = "https://github.com/mauroav21"
LINKEDIN_URL = "https://www.linkedin.com/in/mauroav/"
MAIL_URL = f"mailto:{AUTHOR_EMAIL}"

# Metadatos del sitio
SITE_TITLE = "Tu Nombre | Portfolio"
SITE_DESCRIPTION = "Portfolio profesional de [Tu Nombre]."
SITE_LANGUAGE = "es_MX"  # Cambia según tu idioma (e.g., en_US, es_ES)
SITE_AUTHOR = AUTHOR_NAME
SITE_KEYWORDS = "portfolio, desarrollo web, programación, tu nombre, tus tecnologías"

# El que estas rutas no tengan "assets/" al inicio es por cuestión
# de como Reflex maneja lo que se encuentra dentro de la carpeta assets/.
CV_ES_PATH = "documents/CV_TuNombre.pdf"
AVATAR_PATH = "images/avatar.jpg"

# Textos descriptivos de las secciones
ABOUT_ME_TEXT = """I am a Computer Systems Engineer currently working as an SCM Engineer, with a deep specialization in DevOps and cloud-native ecosystems. My career is driven by a passion for cloud computing, technical leadership, and driving digital transformation through scalable infrastructure.

In addition to my engineering role, I have a proven track record of building and leading high-impact tech communities. """

EDUCATION_MODULE_TEXT = "Instituciones donde me he formado académicamente."
EXPERIENCE_MODULE_TEXT = (
    "Empresas y organizaciones donde he aplicado mis conocimientos profesionalmente."
)
CERTIFICATION_MODULE_TEXT = "Certificaciones y cursos que avalan mi conocimiento."
PROJECTS_MODULE_TEXT = "Proyectos destacados que he desarrollado utilizando diversas tecnologías."
COMMUNITIES_MODULE_TEXT = (
    "Comunidades técnicas y grupos donde participo activamente compartiendo conocimiento."
)
MATERIALS_MODULE_TEXT = "Contenido educativo, charlas y talleres que he creado y presentado."
