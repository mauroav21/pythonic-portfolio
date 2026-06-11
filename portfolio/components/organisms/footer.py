from reflex import (
    Component,
    el,
    box,
    text,
    mobile_and_tablet,
    desktop_only,
    separator,
    divider,
    flex,
)
from portfolio.components.molecules.social_stack import social_stack
from portfolio.config import AUTHOR_NAME


def desktop_footer() -> Component:
    """
    Configuración del footer para escritorios.

    Returns:
        rx.Component: Componente que del lado izquierdo da el aviso de
    copyright y del lado derecho los medios de contacto
    del autor.
    """
    return el.div(
        divider(),
        el.div(
            el.div(
                el.h3(
                    f"© 2026 {AUTHOR_NAME}",
                    class_name="text-left text-white",
                ),
            ),
            el.div(
                social_stack(),
            ),
            class_name="grid grid-cols-1 md:grid-cols-2 gap-7 text-center md:text-left",
        ),
    )


def mobile_layout() -> Component:
    """
    Configuración del footer para dispositivos móviles.
    A comparación del footer de escritorio, ésta es una
    versión en vertical del mismo.

    Returns:
        rx.Component: Componente con el layout para el
            footer para dispositivos móviles, aviso de
            copyright y posteriormente medios de contacto.
    """
    return flex(
        flex(
            box(separator(), width="100%"),
            social_stack(),
            direction="column",
            align="center",
            justify="center",
            spacing="1",
        ),
        text(
            f"© 2026 {AUTHOR_NAME}",
            class_name="text-center text-white font-light",
            size="2",
        ),
        direction="column",
        align="center",
        justify="center",
        spacing="4",
        width="100%",
        padding_y="2rem",
        padding_x="1rem",
    )


def footer() -> Component:
    """
    Footer del portafolio. Carga la configuración
    correcta según el user-agent detectado al abrir
    la aplicación.

    Returns:
        rx.el.footer: Footer del portafolio.
    """
    return el.footer(
        desktop_only(desktop_footer()),
        mobile_and_tablet(mobile_layout()),
        class_name="page_container mx-auto px-3 py-8",
    )
