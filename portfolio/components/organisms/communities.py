from portfolio.components.atoms.icon_title import icon_title
from reflex import Component, box, text, center
from portfolio.components.molecules import vertical_card
from portfolio.components.atoms import card_stack
from portfolio.data.communities import communities
from portfolio.config.constants import COMMUNITIES_MODULE_TEXT


def communities_module() -> Component:
    """
    Módulo para mostrar las comunidades en las que
    el usuario participa.
    Se llena con la información en ../data/communities.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de las comunidades en donde el usuario participa.
    """
    return box(
        icon_title("users", "Comunidades"),
        text(
            COMMUNITIES_MODULE_TEXT,
            class_name="section_title",
        ),
        center(card_stack(communities, vertical_card)),
        padding_left="30px",
        padding_right="30px",
    )
