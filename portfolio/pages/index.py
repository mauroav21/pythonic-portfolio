import reflex as rx

from portfolio.layouts import base_layout
from portfolio.components.organisms import about
from portfolio.config.metadata import HOME_PAGE_META


@rx.page(**HOME_PAGE_META)
def index() -> rx.Component:
    """
    Página inicial del portafolio. A saber, es la página
    index.

    Returns:
        rx.Component: Página inicial del portafolio.
    """
    return base_layout(about())
