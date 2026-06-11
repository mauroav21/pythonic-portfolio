from reflex import Component, box, center, vstack

from portfolio.components.atoms import box_separator
from portfolio.components.molecules import about_info, badge_contacts
from portfolio.components.organisms import (
    technologies_module,
    certification_module,
    communities_module,
    projects_module,
    materials_module,
    education_module,
    experience_module,
    footer,
)


def mobile_layout() -> Component:
    """
    Layout/reacomodo de la información del portafolio como una sola
    página dentro de /index para visualización en dispositivos móviles.

    Returns:
        rx.box: Componente box con toda la información del portafolio
        reacomodada como un único componente global.

    """
    return box(
        center(
            vstack(
                badge_contacts(),
                about_info(),
                width="100%",
                spacing="4",
                padding_x=["1rem", "1.5rem"],
                align="center",
            ),
            technologies_module(),
            box_separator(),
            box(
                education_module(),
                experience_module(),
                certification_module(),
                box_separator(),
                projects_module(),
                box_separator(),
                communities_module(),
                box_separator(),
                materials_module(),
                class_name="max-w-5xl mx-auto",
                width="100%",
            ),
            vstack(
                footer(),
                width="100%",
                spacing="4",
            ),
            width="100%",
            max_width="100vw",
            overflow_x="hidden",
            spacing="6",
            align="stretch",
            direction="column",
        )
    )
