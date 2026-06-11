import reflex as rx
from portfolio.data.models import Experience
from portfolio.components.atoms.date_chip import date_chip
from portfolio.components.atoms.link_chip import link_chip


def mobile_certification_card(exp: Experience) -> rx.Component:
    """
    Caja para mostrar título, subtítulo,
    descripción, fecha y enlace externo de
    alguna certificación que tenga el usuario.

    Este es el layout de certification_card para
    dispositivos móviles.

    Args:
        exp: Elemento de tipo Experience para extracción
        de información sobre las certificaciones del usuario.

    Returns
        rx.vstack: Componente vstack con configuración de vstack
        con la información de exp.

    """
    return rx.vstack(
        rx.stack(
            rx.heading(exp.title, text_align="left", class_name="text-lg font-semibold"),
            rx.text(exp.subtitle, margin_top="0.2em", class_name="text-md"),
            rx.text(exp.description, opacity="0.8", text_align="left", class_name="text-sm"),
            rx.hstack(date_chip(exp.date), link_chip(exp.icon, exp.certificate)),
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
    )
