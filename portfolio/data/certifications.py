from .models import Experience

"""
Información del usuario sobre sus certificaciones.

Cada elemento incluye un ícono, título, subtítulo,
descripción, fechas de validez de la certificación
y una URL al certificado de la misma.
"""


certifications: list[Experience] = [
    {
        "icon": "scroll",
        "title": "AWS Cloud Practitioner",
        "subtitle": "Certificación expedida por AWS",
        "description": "Acreditación base que valida el dominio de conceptos fundamentales, seguridad, servicios y modelos de precios dentro del ecosistema de Amazon Web Services (AWS).",
        "date": "2026 - ",
        "certificate": "https://ejemplo.com/certificado/123456",
    },
  
]

