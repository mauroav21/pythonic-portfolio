from .models import Project

"""
Información del usuario sobre los proyectos que ha
creado. Material =/= proyectos.

Cada elemento incluye un ícono, título, subtítulo,
descripción, imágen, una URL a dónde se puede
consultar dicho proyecto (un repo) y la serie de
tecnologías usadas en el mismo.
"""

projects: list[Project] = [
    {
        "icon": "code",
        "title": "Sistema de Gestión de Tareas",
        "subtitle": "Aplicación Web Full Stack",
        "description": "Aplicación web para gestión de proyectos y tareas con autenticación de usuarios, asignación de tareas y seguimiento en tiempo real.",
        "image": "images/projects/project.jpeg",
        "repo": "https://github.com/tuusername/task-manager",
        "technologies": "React, Node.js, MongoDB, Express",
    },
    {
        "icon": "shopping-cart",
        "title": "E-Commerce Platform",
        "subtitle": "Tienda en Línea Completa",
        "description": "Plataforma de comercio electrónico con carrito de compras, pasarela de pagos, gestión de inventario y panel de administración.",
        "image": "images/projects/project.jpeg",
        "repo": "https://github.com/tuusername/ecommerce-platform",
        "technologies": "Python, Django, PostgreSQL, Stripe",
    },
    {
        "icon": "brain",
        "title": "Clasificador de Imágenes con IA",
        "subtitle": "Machine Learning Project",
        "description": "Modelo de aprendizaje profundo para clasificación de imágenes usando redes neuronales convolucionales con interfaz web.",
        "image": "images/projects/project.jpeg",
        "repo": "https://github.com/tuusername/image-classifier",
        "technologies": "Python, TensorFlow, Flask, Docker",
    },
]
