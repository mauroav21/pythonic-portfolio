from reflex import box, hstack, spacer, separator, Component, heading

from portfolio.config import AUTHOR_NAME, AUTHOR_USERNAME
from portfolio.components.atoms import link_styled


def navbar() -> Component:
    """
    Barra de navegación del portafolio. Consiste en
    un lateral izquierdo con un ícono y autor y del
    lado derecho las secciones del portafolio.

    Nota: Este componente está pensado únicamente para
    el uso en modo de escritorio.

    Returns:
        rx.box: Componente con la barra de navegación configurada.
    """
    return box(
        hstack(
            heading(f"{AUTHOR_NAME} | {AUTHOR_USERNAME}", class_name="nav_link pb-2"),
            spacer(),
            hstack(
                hstack(
                    link_styled("Sobre Mí", "/#"),
                    link_styled("Experiencia", "/experiencia"),
                    link_styled("Comunidades", "/comunidades"),
                    link_styled("Material", "/materiales"),
                    justify="end",
                    spacing="5",
                ),
                justify="between",
                align_items="right",
            ),
            align_items="right",
        ),
        separator(),
        padding="1.5em",
        top="15px",
        width="100%",
    )
