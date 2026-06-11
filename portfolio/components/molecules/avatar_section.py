from reflex import Component, box, section, flex, image, text
from portfolio.config.constants import AUTHOR_NAME, AVATAR_PATH, AUTHOR_USERNAME


def avatar_section() -> Component:
    """
    Componente que crea la sección la imágen de avatar, nombre y username
    del usuario.

    Returns:
        rx.box: Componente con la imágen de avatar, nombre y username
    del usuario estilizados.
    """
    return box(
        section(
            flex(
                image(
                    src=AVATAR_PATH,
                    width=["100%", "280px"],
                    height="auto",
                    border_radius="20px",
                ),
                text(AUTHOR_NAME, weight="bold", size="4", class_name="pt-3"),
                text(
                    AUTHOR_USERNAME,
                    class_name="nav_link font-light font-mono",
                ),
                direction="column",
                align="center",
                width="100%",
            )
        ),
        padding_x=["0.5rem", "1rem"],
        width="100%",
        class_name="page_container",
    )
