from reflex import stack, foreach, Component


def card_stack(information: list, card: Component) -> Component:
    """
    Crea un stack de tarjetas dada la información de usuario
    sobre su experiencia laboral, proyectos, etc.

    Args:
        information: Lista de información. Véase lo que se encuentra en ../data
        card: Componente de tarjeta, se espera que sea una vertical_card, experience_card
            o certification_card.

    Returns:
        rx.stack: Componente stack con las tarjetas acomodadas y creadas.
    """

    return stack(foreach(information, card), align="start", wrap="wrap")
