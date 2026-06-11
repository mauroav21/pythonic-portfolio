import reflex as rx


def link_chip(icon_name: str, link: str) -> rx.Component:
    """
    Crea un componente link con un badge
    para poder incluir referencias a sitios externos
    al portafolio.

    Args:
        icon_name: Nombre del ícono a utilizar en el badge.
        link: Enlace a utilizar en el componente.

    Returns:
        rx.link: Componente configurado con la información
        para el enlace externo.
    """
    return rx.link(
        rx.badge(
            rx.icon(icon_name, size=18),
            class_name="tech_chip pt-2",
            radius="full",
            variant="outline",
            size="2",
            color_scheme="gray",
        ),
        href=link,
        is_external=True,
    )
