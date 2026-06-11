from reflex import box, separator, Component


def box_separator() -> Component:
    """
    Crea un componente box con un separador dentro. Pensado
    como una línea separadora entre secciones.

    Returns:
        rx.Component: Box con separador dentro.
    """
    return (box(separator(), padding="1.5em", width="100%", class_name="content_container"),)
