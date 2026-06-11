from reflex import center, Component, text, box
from portfolio.components.molecules.project_card import project_card
from portfolio.components.atoms import icon_title, card_stack
from portfolio.data.projects import projects
from portfolio.config.constants import PROJECTS_MODULE_TEXT


def projects_module() -> Component:
    """
    Módulo para mostrar los proyectos realizados por el usuario.
    Se llena con la información en ../data/projects.

    Returns:
        rx.box: Componente box con un stack de tarjetas
        de los proyectos creados por el usuario.
    """

    return box(
        icon_title("blocks", "Proyectos"),
        text(
            PROJECTS_MODULE_TEXT,
            class_name="section_title",
        ),
        center(
            card_stack(projects, project_card),
        ),
        padding_left="30px",
        padding_right="30px",
    )
