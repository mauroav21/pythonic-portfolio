from reflex import vstack, stack, heading, text, Component
from portfolio.data.models import Experience
from portfolio.components.atoms.date_chip import date_chip
from portfolio.components.atoms.location_box_alt import location_box_alt


def mobile_experience_card(exp: Experience) -> Component:
    """
    Caja para mostrar título, ubicación, subtítulo,
    descripción y fecha de la experiencia del usuario.

    Este componente está pensado para ser el layout
    de experience_card para dispositivos móviles.

    Args:
        exp: Elemento de tipo Experience para extracción
        de información sobre la experiencia del usuario.

    Returns
        rx.stack: Componente stack con configuración de vstack
        con la información de exp.

    """

    return vstack(
        stack(
            heading(exp.title, class_name="text-lg font-semibold", text_align="left"),
            location_box_alt(exp.location),
            text(exp.subtitle, class_name="text-md"),
            text(exp.description, opacity="0.8", class_name="text-sm", text_align="left"),
            date_chip(exp.date),
            padding="1em",
            gap="0.5em",
            align="start",
            direction="column",
            justify="start",
            wrap="wrap",
            as_child=False,
            width="100%",
        ),
        class_name="card",
        width="100%",
        spacing="4",
    )
