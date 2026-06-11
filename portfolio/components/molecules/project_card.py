import reflex as rx
from portfolio.components.atoms.link_chip import link_chip
from portfolio.data.models import Project


def project_card(data: Project) -> rx.Component:
    """
    Tarjeta con diseño transparente y borde para
    mostrar imagen, nombre, descripción, tecnologías usadas
    y enlace externo sobre un projecto del usuario.

    Args:
        data: Elemento de tipo Project para extracción
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
                    rx.el.h3(
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
                rx.text(
                    data.technologies,
                    color="var(--white)",
                    line_height="1.6",
                    width="100%",
                    opacity="0.8",
                    class_name="text-xs italic pb-2",
                ),
                # Si es el caso, cambia esto por "GitLab" o el proveedor que aplique.
                link_chip("github", data.repo),
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
        href=data.repo,
        is_external=True,
        text_decoration="none",
        width="100%",
        max_width="230px",
        margin="0 auto",
    )
