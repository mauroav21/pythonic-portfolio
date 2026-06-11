from reflex import Component, hstack, vstack

from portfolio.components.molecules.about_info import about_info
from portfolio.components.molecules.avatar_section import avatar_section
from .technologies import technologies_module


def about() -> Component:
    """
    Componente para mostrar la información principal
    del usuario: información del usuario, semblanza
    y tecnologías principales.

    Returns:
        rx.vstack: Stack vertical con la información
        del usuario.
    """
    return vstack(
        hstack(
            avatar_section(),
            about_info(),
            width="100%",
            class_name="content_container",
        ),
        technologies_module(),
    )
