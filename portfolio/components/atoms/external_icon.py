from reflex import el, Component


def external_icon(icon_name: str) -> Component:
    """
    Crea un componente para poder trabajar con íconos
    de librerias externas a Lucide Icons. Las librerías
    de íconos se importan desde portfolio/config/constants.py
    y se cargan al ejecutar la aplicación.

    Args:
        icon_name: Nombre del ícono a usar.

    Returns:
        rx.Component: Componente con un ícono de la libreria externa.

    """
    return el.i(class_name=f"{icon_name} text-xl pr-2 pt-1 py-2", style={"color": "var(--white)"})
