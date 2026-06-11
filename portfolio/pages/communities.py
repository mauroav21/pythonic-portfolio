import reflex as rx

from portfolio.layouts import base_layout
from portfolio.config.metadata import COMMUNITIES_PAGE_META
from portfolio.components.organisms.communities import communities_module


@rx.page(**COMMUNITIES_PAGE_META)
def communities() -> rx.Component:
    """
    Página para mostrar las comunidades, si aplica, a las que el usuario
    pertenece y aporta.

    Returns:
        rx.Component: Página con la información de las comunidades del usuario.
    """
    return base_layout(communities_module())
