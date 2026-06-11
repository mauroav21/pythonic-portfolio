from portfolio.config.constants import AUTHOR_NAME, SITE_DESCRIPTION, SITE_AUTHOR, AUTHOR_USERNAME


def get_page_metadata(
    title: str, description: str = SITE_DESCRIPTION, route: str = "/", **kwargs
) -> dict:
    """
    Generador de metadata base para las distintas páginas del portafolio.

    Args:
        title: Título de la página (que se juntará con el nombre del autor.)
        description: Descripción de la página.
        route: Ruta a usar.
        **kwargs: Otros argumentos a utilizar.

    Returns:
        Diccionario con la metadata de la página pre-configurada.
    """
    return {
        "route": route,
        "title": f"{title} | {AUTHOR_NAME}",
        "description": description,
        "image": "assets/images/avatar.jpg",
        "meta": [
            {"name": "author", "content": SITE_AUTHOR},
            {"name": "language", "content": "Spanish"},
            *kwargs.get("meta", []),
        ],
    }


HOME_PAGE_META = get_page_metadata(title=AUTHOR_USERNAME, route="/")

EXPERIENCE_PAGE_META = get_page_metadata(title="Experiencia", route="/experiencia")

COMMUNITIES_PAGE_META = get_page_metadata(title="Comunidades", route="/comunidades")

MATERIALS_PAGE_META = get_page_metadata(title="Materiales", route="/materiales")
