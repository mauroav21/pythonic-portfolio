from reflex import Component, box, center, flex, foreach
from portfolio.components.atoms import ext_icon_chip
from portfolio.data.technologies import technologies


def technologies_module() -> Component:
    """
    Crea el módulo de las tecnologías usadas por el usuario,
    creando un "chip" de ícono externo por cada una de las
    tecnologías.

    Returns:
        rx.box: Caja con las tecnologías del usuario estilizadas.
    """
    return box(
        center(
            flex(
                foreach(technologies, ext_icon_chip),
                wrap="wrap",
                spacing="2",
                justify="center",
                align="center",
                max_width=["100%", "80%", "700px"],
                width="100%",
            ),
        ),
        class_name="pb-5",
    )
