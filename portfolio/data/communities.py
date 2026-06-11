from .models import Community

"""
Información del usuario sobre las comunidades en donde
participa.

Cada elemento incluye un ícono, título, descripción,
imágen y una URL al sitio principal de dicha comunidad.
"""

communities: list[Community] = [
    {
        "icon": "devicon-amazonwebservices-plain",
        "title": "AWS Student Builder Group at TecNM Saltillo",
        "description": "Comunidad para estudiantes. Su fin es aprender los fundamentos de la nube y desarrollar proyectos iniciales mediante mentorías y talleres prácticos.",
        "image": "images/communities/6.png",
        "url": "https://ejemplo.com/python-community",
    },
    {
        "icon": "devicon-amazonwebservices-plain",
        "title": "AWS User Group Saltillo",
        "description": "Comunidad para profesionales. Su fin es el networking, compartir casos de uso reales y discutir mejores prácticas técnicas en entornos de trabajo.",
        "image": "images/communities/7.jpg", 
        "url": "https://ejemplo.com/js-group",
    },
    {
        "icon": "devicon-javascript-plain",
        "title": "Club de Programación Competitiva ITS",
        "description": "Grupo de entrenamiento enfocado en resolver problemas de lógica, algoritmos y estructuras de datos bajo presión para participar en competencias oficiales.",
        "image": "images/communities/8.png",
        "url": "https://ejemplo.com/js-group",
    },
]
