from reflex import badge, Component


def date_chip(date: str) -> Component:
    """
    Componente que crea una caja para texto con diseño
    específico. Se busca que el componente sea usado para
    mostrar temporalidades del usuario en sus secciones de
    experiencia.

    Args:
        date: Fechas a mostrar en el componente, en formato de texto.

    Returns:
        rx.box: Componente con la información de una
        ubicación del usuario.
    """
    return badge(date, radius="full", high_contrast=True, variant="solid", size="3")
