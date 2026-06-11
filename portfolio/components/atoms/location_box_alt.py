from reflex import box, hstack, icon, text, Component


def location_box_alt(location: str) -> Component:
    """
    Componente que crea una caja con el ícono de "map-pin"
    y un texto, con una configuración de estilo distinta
    a la original. Se busca que este componente sea usado para
    mostrar ubicaciones del usuario en su información de experiencia
    laboral.

    Args:
        location: Ubicación a mostrar, en formato de texto.

    Returns:
        rx.box: Componente con la información de una
        ubicación del usuario.
    """
    return box(
        hstack(
            icon("map-pin", size=12, stroke_width=2, class_name="nav_link"),
            text(f" {location}", class_name="text-sm", opacity="0.8"),
            spacing="2",
        )
    )
