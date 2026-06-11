from .models import Experience

"""
Información del usuario sobre su experiencia laboral.

Cada elemento incluye un ícono, título, subtítulo,
descripción, fechas (o estado si es "En Curso"), y ubicación
de donde se completó/se está trabajando al momento.
"""


experiences: list[Experience] = [
    {
        "icon": "code",
        "title": "SCM Engineer",
        "subtitle": "Softtek",
        "description": "Gestión de configuración de software, administración de control de versiones y automatización de procesos de build y release. Diseño de pipelines de CI/CD para asegurar la integridad y entrega continua del código. Configuración de ambientes y gestión de IaC & CaC",
        "date": "2025 - En Curso",
        "location": "Monterrey, México",
    },
]
