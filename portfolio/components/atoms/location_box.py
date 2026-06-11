from reflex import box, hstack, icon, text, Component


def location_box(location: str) -> Component:
    """
    Componente que crea una caja con el ícono de "map-pin"
    y un texto. Se busca que este componente sea usado para
    mostrar ubicaciones del usuario.

    Args:
        location: Ubicación a mostrar, en formato de texto.

    Returns:
        rx.box: Componente con la información de una
        ubicación del usuario.
    """
    return box(
        hstack(
            icon("map-pin", size=15, stroke_width=2, class_name="nav_link"),
            text(f" {location}", class_name="pr-4, text-lg-300"),
            spacing="2",
        )
    )
