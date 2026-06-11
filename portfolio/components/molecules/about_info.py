import reflex as rx

from portfolio.components.atoms.location_box import location_box
from portfolio.config import ABOUT_ME_TEXT, AUTHOR_LOCATION, GREETING_MESSAGE, AUTHOR_OCCUPATIONS


def about_info() -> rx.Component:
    """
    Módulo de información básica del usuario: su saludo
    configurado, su ocupación, ubicación y semblanza.

    Returns:
        rx.flex: Componente configurado con la información
        básica del usuario.
    """
    return rx.flex(
        rx.heading(
            GREETING_MESSAGE,
            size="9",
            class_name="typewriter text-5xl pt-10 pr-10 pb-1 ",
            style={"fontSize": ["1.5rem", "2rem", "2.5rem"]},
        ),
        rx.el.h1(
            AUTHOR_OCCUPATIONS,
            class_name="typewriter-subtitle text-lg",
            style={"fontSize": ["0.875rem", "1rem", "1.125rem"]},
        ),
        location_box(AUTHOR_LOCATION),
        rx.separator(),
        rx.text(ABOUT_ME_TEXT, class_name="text-lg font-normal"),
        direction="column",
        spacing="2",
    )
