from reflex import el, icon, Component, hstack


def icon_title(icon_name: str, title: str, text_size: str = "3xl", icon_size=40) -> Component:
    """
    Regresa un componente div que incluye un ícono
    (de la librería de Lucide Icons) y un título.
    Pensado para tener un elemento gráfico en el
    lateral de un título.

    La lista de íconos disponibles se encuentra
    en https://lucide.dev/icons/

    Args:
        icon_name: Nombre del ícono a utilizar.
        text_size: Tamaño del texto en el título.
        title: Texto a utilizar en el título.
        icon_size: Tamaño del ícono a ocupar.

    Returns:
        rx.el.div: Componente con, de izquierda
        a derecha, un ícono y un título.

    """
    class_name = f"icon_title text-{text_size}"
    return el.div(
        hstack(
            icon(
                icon_name,
                stroke_width=1,
                size=icon_size,
                class_name="nav_link pl-1",
            ),
            el.h3(
                title,
                class_name=class_name,
            ),
            direction="row",
            align="start",
        ),
    )
