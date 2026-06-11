from .models import Experience

"""
Información del usuario sobre su educación.

Cada elemento incluye un ícono, título, subtítulo,
descripción, fechas (o estado si es "En Curso"), y ubicación
de donde se completó/se está cursando dicha educación.
"""

education_list: list[Experience] = [
    {
        "icon": "school",
        "title": "Ingeniería en Sistemas Computacionales",
        "subtitle": "TecNM Saltillo",
        "description": "Formación  en desarrollo de software, algoritmos, arquitectura de sistemas, gestión de desarrollo de software, combinada con el diseño de infraestructura en la nube y automatización de procesos para el ciclo de vida del software.",
        "date": "2021 - 2027",
        "location": "Saltillo, México",
    },
]
