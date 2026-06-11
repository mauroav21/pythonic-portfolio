from reflex import Component, badge, icon


def icon_chip(tech_icon: str) -> Component:
    """
    Crea un componente "chip" que incluye un ícono
    de Lucide Icons.

    La lista de íconos disponibles se encuentra
    en https://lucide.dev/icons/

    Args:
        tech_icon: Nombre del ícono a utilizar.

    Returns:
        rx.badge: Componente "chip" con un ícono.


    """
    return badge(
        icon(tech_icon),
        class_name="tech_chip pt-2",
        radius="full",
        variant="outline",
        size="2",
        color_scheme="gray",
    )
