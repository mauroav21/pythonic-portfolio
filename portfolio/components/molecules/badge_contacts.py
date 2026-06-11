from reflex import flex, Component
from portfolio.components.molecules import avatar_section, social_stack


def badge_contacts() -> Component:
    """
    Componente pensado para ser usado en la configuración
    móvil. Crea un flex con la imágen del usuario y sus
    medios de contacto.

    El estilo busca emular el badge de usuario de plataformas
    como linktr.ee.

    Returns:
        rx.Component: Flex con la configuración de badge de
            usuario y sus medios de contacto.
    """
    return flex(
        avatar_section(),
        social_stack(),
        direction="column",
        align="center",
        justify="center",
        class_name="pb-1",
    )
