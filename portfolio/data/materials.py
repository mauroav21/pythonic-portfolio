from .models import Material

"""
Información del usuario sobre el material que ha
creado. Material =/= proyectos.

Cada elemento incluye un ícono, título,
descripción, imágen y una URL a dónde se puede
consultar dicho material.
"""


materials: list[Material] = [
    {
        "icon": "devicon-amazonwebservices-plain",
        "title": "Mís Articulos en AWS Builder Center",
        "description": "Conoce mis artículos en AWS Builder Center, donde comparto conocimientos sobre la nube, mejores prácticas y guías para desarrolladores interesados en el ecosistema de AWS.",
        "image": "images/materials/material.jpg",
        "url": "https://builder.aws.com/community/@mauroav?tab=articles",
    },
    {
        "icon": "devicon-react-plain",
        "title": "Mís Articulos en Dev.to",
        "description": "Conoce mis artículos en Dev.to, donde comparto conocimientos sobre desarrollo de software, tecnologías y experiencias personales en el mundo de la programación.",
        "image": "images/materials/material.jpg",
        "url": "https://dev.to/mauroavdev",
    },
]
