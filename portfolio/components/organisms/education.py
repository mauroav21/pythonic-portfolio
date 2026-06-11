from reflex import Component, box, text, separator, desktop_only, mobile_and_tablet
from portfolio.components.atoms.icon_title import icon_title
from portfolio.components.molecules import experience_card, mobile_experience_card
from portfolio.components.atoms import card_stack
from portfolio.data.education import education_list
from portfolio.config.constants import EDUCATION_MODULE_TEXT


def education_module() -> Component:
    """
    Módulo para mostrar la formación académica del usuario.
    Se llena con la información en ../data/education.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de la formación académica del usuario.
    """
    return box(
        icon_title("school", "Educación"),
        text(EDUCATION_MODULE_TEXT, class_name="text-md pt-4 pb-4"),
        desktop_only(
            card_stack(education_list, experience_card),
        ),
        mobile_and_tablet(
            card_stack(education_list, mobile_experience_card),
        ),
        box(separator(), padding="1.5em", width="100%"),
        padding_left="30px",
        padding_right="30px",
    )
