import reflex as rx
from portfolio.data.models import Experience
from portfolio.components.atoms.date_chip import date_chip
from portfolio.components.atoms.link_chip import link_chip


def certification_card(exp: Experience) -> rx.Component:
    """
    Caja para mostrar título, subtítulo,
    descripción, fecha y enlace externo de
    alguna certificación que tenga el usuario.

    Args:
        exp: Elemento de tipo Experience para extracción
        de información sobre las certificaciones del usuario.

    Returns
        rx.hstack: Componente hstack con configuración de vstack
        con la información de exp.

    """
    return rx.hstack(
        rx.box(
            rx.heading(exp.title, class_name="text-xl font-semibold"),
            rx.text(exp.subtitle, margin_top="0.2em", class_name="text-md"),
            rx.text(exp.description, opacity="0.8", class_name="text-sm"),
            padding="1em",
        ),
        rx.spacer(),
        rx.box(
            rx.vstack(date_chip(exp.date), link_chip(exp.icon, exp.certificate)),
            padding="2em",
        ),
        class_name="card",
        width="100%",
    )
