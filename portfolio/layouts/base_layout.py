from reflex import box, Component, desktop_only, mobile_and_tablet
from portfolio.components.organisms.navbar import navbar
from portfolio.components.organisms.footer import footer
from .mobile_layout import mobile_layout


def base_layout(*children: Component, **kwargs) -> Component:
    """
    Layout base para todas las páginas, con su navbar y footer.

    Args:
        *children: Contenido a renderizar entre el navbar y el footer.
        **kwargs: Otra configuración necesaria para ajustar la estilización del contenido.

    Returns:
        rx.Component: Layout de la página pre-configurado.
    """

    default_class = "bg-primary-color backgrnd min-h-screen"
    class_name = kwargs.pop("class_name", default_class)

    return box(
        desktop_only(
            navbar(),
            *children,
            footer(),
        ),
        mobile_and_tablet(
            mobile_layout(),
        ),
        **kwargs,
        class_name=class_name,
    )
