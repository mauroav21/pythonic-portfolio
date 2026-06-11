from portfolio.components.atoms.icon_title import icon_title
from reflex import Component, text, center, box
from portfolio.components.atoms import card_stack
from portfolio.components.molecules.vertical_card import vertical_card
from portfolio.data.materials import materials
from portfolio.config.constants import MATERIALS_MODULE_TEXT


def materials_module() -> Component:
    """
    Módulo para mostrar los materiales realizados por el usuario.
    Se llena con la información en ../data/materials.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de los materiales creados por el usuario.
    """
    return box(
        icon_title("pencil-ruler", "Materiales"),
        text(
            MATERIALS_MODULE_TEXT,
            class_name="section_title",
        ),
        center(
            card_stack(materials, vertical_card),
        ),
        padding_left="30px",
        padding_right="30px",
    )
