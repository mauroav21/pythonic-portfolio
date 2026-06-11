from portfolio.components.atoms.icon_title import icon_title
from reflex import Component, box, separator, text, mobile_and_tablet, desktop_only
from portfolio.components.atoms import card_stack
from portfolio.components.molecules import experience_card, mobile_experience_card
from portfolio.data.experience import experiences
from portfolio.config.constants import EXPERIENCE_MODULE_TEXT


def experience_module() -> Component:
    """
    Módulo para mostrar la experiencia laboral del usuario.
    Se llena con la información en ../data/experience.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de la experiencia laboral del usuario.
    """
    return box(
        icon_title("user-cog", "Experiencias Laborales"),
        text(
            EXPERIENCE_MODULE_TEXT,
            class_name="text-md pt-4 pb-4",
        ),
        desktop_only(
            card_stack(experiences, experience_card),
        ),
        mobile_and_tablet(
            card_stack(experiences, mobile_experience_card),
        ),
        box(separator(), padding="1.5em", width="100%"),
        padding_left="30px",
        padding_right="30px",
    )
