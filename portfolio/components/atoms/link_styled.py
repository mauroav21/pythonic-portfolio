from reflex import el, Component


def link_styled(text: str, href: str) -> Component:
    """
    Regresa un componente link estilizado
    desde Tailwind.

    Args:
        text: Texto a usar en el link.
        href: Dirección del link.

    Returns:
        rx.el.a: Link configurado.
    """
    return el.a(
        f"{text}",
        href=href,
        is_external=False,
        class_name="nav_link",
    )
