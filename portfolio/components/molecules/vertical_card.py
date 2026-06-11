import reflex as rx
from portfolio.components.atoms.external_icon import external_icon
from portfolio.components.atoms.link_chip import link_chip
from portfolio.data.models import CardData


def vertical_card(data: CardData) -> rx.Component:
    """
    Tarjeta con diseño transparente y borde para
    mostrar imagen, nombre, descripción y enlace externo
    del objeto CardData.

    Args:
        data: Elemento de tipo CardData para extracción
        de información.

    Returns
        rx.link: Componente link con configuración de vstack
        con la información de data.

    """
    return rx.link(
        rx.vstack(
            # Imagen de la comunidad
            rx.box(
                rx.image(
                    src=data.image,
                    alt=data.title,
                    width="230px",
                    height="230px",
                    object_fit="cover",
                ),
                width="100%",
            ),
            # Contenido de la tarjeta
            rx.vstack(
                rx.hstack(
                    # devicon(data.icon),
                    rx.el.h3(
                        external_icon(data.icon),
                        data.title,
                        class_name="text-left text-lg font-medium text-white",
                    ),
                    direction="row",
                    align="center",
                    justify="start",
                    width="100%",
                ),
                rx.text(
                    data.description,
                    size="3",
                    color="var(--white)",
                    line_height="1.6",
                    width="100%",
                    opacity="0.8",
                ),
                link_chip("square-arrow-out-up-right", data.url),
                width="100%",
                spacing="2",
                padding="1.5rem",
                align="start",
            ),
            spacing="0",
            width="100%",
            class_name="card",
            align="start",
        ),
        href=data.url,
        is_external=True,
        text_decoration="none",
        width="100%",
        max_width="230px",
        margin="0 auto",
    )
