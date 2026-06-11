from reflex import el, Component, badge

from portfolio.data import Technology


def ext_icon_chip(tech: Technology) -> Component:
    """
    Crea un componente "chip" que incluye un ícono
    de una libreria externa a Lucide Icons.

    Las librerías de íconos se importan desde
    portfolio/config/constants.py y se cargan
    al ejecutar la aplicación.

    Args:
        tech: Instancia de tipo Technology desde
        la cual se cargará la información del
        ícono.

    Returns:
        rx.badge: Componente badge con el ícono cargado.
    """
    return badge(
        el.i(class_name=f"{tech.icon} text-xl", style={"color": "var(--white)"}),
        class_name="devicon_chip pt-2",
        radius="full",
        variant="outline",
        size="2",
        color_scheme="gray",
    )
