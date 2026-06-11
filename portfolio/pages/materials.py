import reflex as rx

from portfolio.layouts import base_layout
from portfolio.config.metadata import MATERIALS_PAGE_META
from portfolio.components.organisms.materials import materials_module


@rx.page(**MATERIALS_PAGE_META)
def materials() -> rx.Component:
    """
    Página para mostrar, si aplica, el material que ha creado
    el usuario para difusión pública.

    Returns:
        rx.Component: Página del material que ha creado el usuario.c
    """
    return base_layout(materials_module())
