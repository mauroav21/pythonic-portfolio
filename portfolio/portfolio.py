"""
Archivo de creación de la aplicación de Reflex.
Desde aquí toda la configuración de las páginas
y demás archivos es cargada para crear el portafolio.
"""

from reflex import el, App, theme

from portfolio.styles.styles import BASE_STYLE, STYLESHEETS
from portfolio.config import AUTHOR_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, DEVICON_CDN

# Se importan todas la páginas para que Reflex registre las rutas.
# Puede que parezca que no se usan pero es todo lo contrario.
# No se importan como * de nuevo por la forma en la que Reflex funciona.
from .pages import index, experience, projects, communities, materials

head_components = (
    [
        el.meta(charset="UTF-8"),
        el.meta(name="viewport", content="width=device-width, initial-scale=1.0"),
        el.meta(name="description", content=SITE_DESCRIPTION),
        el.meta(name="keywords", content=SITE_KEYWORDS),
        el.meta(property="og:title", content=AUTHOR_NAME),
        el.meta(property="og:description", content=SITE_DESCRIPTION),
        el.meta(property="og:type", content="website"),
        el.meta(property="og:locale", content="es_MX"),
        el.link(rel="icon", type="image/x-icon", href="/favicon.ico"),
        el.link(rel="stylesheet", href=DEVICON_CDN),
        el.meta(
            name="viewport",
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes",
        ),
    ],
)

app = App(
    style=BASE_STYLE,
    stylesheets=STYLESHEETS,
    head_components=head_components,
    theme=theme(has_background=True, scaling="95%", panel_background="solid"),
    enable_state=False,
)
