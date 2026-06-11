from reflex import divider, vstack, hstack

"""
La configuración de aquí debe coincidir con
lo que se encuentra en tailwind-theme.css para poder
ocupar las variables en class_name sin
tener que referirse a una clase en particular.
"""

tailwind_config = {
    "plugins": ["@tailwindcss/typography"],
    "theme": {
        "extend": {
            "colors": {
                "primary-color": "var(--primary-color)",
                "secondary-color": "var(--secondary-color)",
                "details-color": "var(--details-color)",
                "white": "var(--white)",
                "shadows-color": "var(--shadows-color)",
            },
        }
    },
}

BASE_STYLE = {
    "font_family": "Inter",
    divider: {"margin_bottom": "1em", "margin_top": "0.5em"},
    vstack: {"align_items": "center"},
    hstack: {"align_items": "center"},
}

STYLESHEETS = ["tailwind-theme.css"]
