import reflex as rx

from portfolio.components.atoms.icon_link import icon_link
from portfolio.config import GITHUB_URL, LINKEDIN_URL, MAIL_URL, CV_ES_PATH


def social_stack() -> rx.Component:
    """
    Componente stack para mostrar los medios de contacto
    del usuario y su CV.

    Returns:
        rx.hstack. Componente configurado con la información
        de contacto del usuario.
    """
    return rx.hstack(
        icon_link("github", GITHUB_URL),
        icon_link("linkedin", LINKEDIN_URL),
        icon_link("mail", MAIL_URL),
        icon_link("file-user", CV_ES_PATH),
        spacing="5",
        justify_content=["center", "center", "end"],
        width="100%",
    )
