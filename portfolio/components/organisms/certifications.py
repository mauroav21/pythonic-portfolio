from portfolio.components.atoms.icon_title import icon_title
from reflex import Component, center, box, text, desktop_only, mobile_and_tablet
from portfolio.components.atoms import card_stack
from portfolio.components.molecules import certification_card, mobile_certification_card
from portfolio.data.certifications import certifications
from portfolio.config.constants import CERTIFICATION_MODULE_TEXT


def certification_module() -> Component:
    """
    Módulo para mostrar las certificaciones del usuario.
    Se llena con la información en ../data/certifications.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de las certificaciones del usuario.
    """

    return box(
        icon_title("graduation-cap", "Certificaciones", text_size="3xl"),
        text(CERTIFICATION_MODULE_TEXT, class_name="text-md pt-4 pb-4"),
        desktop_only(
            center(card_stack(certifications, certification_card)),
        ),
        mobile_and_tablet(
            center(card_stack(certifications, mobile_certification_card)),
        ),
        padding_left="30px",
        padding_right="30px",
    )
