import reflex as rx

from portfolio.components.organisms import education_module, certification_module, experience_module
from portfolio.config.metadata import EXPERIENCE_PAGE_META
from portfolio.layouts import base_layout


@rx.page(**EXPERIENCE_PAGE_META)
def experience() -> rx.Component:
    """
    Página para mostrar la experiencia del usuario.
    Educación, trabajos y certificaciones.

    Returns:
        rx.Component: Página con los módulos de educación, trabajo y certificaciones.
    """
    return base_layout(education_module(), experience_module(), certification_module())
