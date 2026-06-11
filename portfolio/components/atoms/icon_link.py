from reflex import icon, Component, link


def icon_link(icon_name: str, href: str) -> Component:
    """
    Crea un componente Link con un badge de Lucide
    Icons.

    La lista de íconos disponibles se encuentra
    en https://lucide.dev/icons/

    Args:
        icon_name: Nombre del ícono a utilizar.
        href: Enlace externo a incluir en el componente.

    Returns:
        rx.link: Componente configurado con el ícono y enlace
        externo a utilizar.
    """
    return link(
        icon(
            icon_name,
            stroke_width=1,
            size=25,
            class_name="nav_link",
        ),
        href=href,
        is_external=True,
        as_child=False,
    )
