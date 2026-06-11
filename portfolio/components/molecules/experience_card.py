import reflex as rx
from portfolio.data.models import Experience
from portfolio.components.atoms.date_chip import date_chip
from portfolio.components.atoms.location_box_alt import location_box_alt


def experience_card(exp: Experience) -> rx.Component:
    """
    Caja para mostrar título, ubicación, subtítulo,
    descripción y fecha de la experiencia del usuario.

    Args:
        exp: Elemento de tipo Experience para extracción
        de información sobre la experiencia del usuario.

    Returns
        rx.hstack: Componente hstack con configuración de vstack
        con la información de exp.

    """

    return rx.hstack(
        rx.box(
            rx.heading(exp.title, class_name="text-xl font-semibold"),
            location_box_alt(exp.location),
            rx.text(exp.subtitle, margin_top="0.5em", class_name="text-md"),
            rx.text(exp.description, opacity="0.8", class_name="text-sm"),
            padding="1em",
        ),
        rx.spacer(),
        rx.box(
            rx.vstack(date_chip(exp.date)),
            padding="2em",
        ),
        class_name="card",
        width="100%",
    )
