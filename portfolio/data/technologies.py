from .models import Technology

"""
Lista de tecnologías usadas por el usuario.

Cada elemento contiene el nombre del ícono en
una librería externa (como Devicons) y el nombre de la
tecnología.

Para añadir una libreria de íconos externas revisa
../config/constants.py

NOTA: Puedes encontrar los nombres de íconos en https://devicon.dev/
"""

technologies: list[Technology] = [
    
    {"icon": "devicon-azure-plain", "name": "Azure"},
    {"icon": "devicon-azuredevops-plain", "name": "Azure DevOps"},
    {"icon": "devicon-amazonwebservices-plain", "name": "AWS"},
    {"icon": "devicon-googlecloud-plain", "name": "GCP"},
    {"icon": "devicon-googlecolab-plain", "name": "Google Colab"},
    {"icon": "devicon-python-plain", "name": "Python"},
    {"icon": "devicon-javascript-plain", "name": "JavaScript"},
    {"icon": "devicon-react-plain", "name": "React"},
    {"icon": "devicon-nodejs-plain", "name": "Node.js"},
    {"icon": "devicon-git-plain", "name": "Git"},
    {"icon": "devicon-github-plain", "name": "GitHub"},
    {"icon": "devicon-gitlab-plain", "name": "GitLab"},
    {"icon": "devicon-docker-plain", "name": "Docker"},
    {"icon": "devicon-postgresql-plain", "name": "PostgreSQL"},
    {"icon": "devicon-mongodb-plain", "name": "MongoDB"},
    {"icon": "devicon-linux-plain", "name": "Linux"},
    {"icon": "devicon-fedora-plain", "name": "Fedora"},
    {"icon": "devicon-python-plain", "name": "Ubuntu"},
    {"icon": "devicon-vscode-plain", "name": "VS Code"},
    {"icon": "devicon-html5-plain", "name": "HTML5"},
    {"icon": "devicon-css3-plain", "name": "CSS3"},
    {"icon": "devicon-tailwindcss-plain", "name": "Tailwind CSS"},
    {"icon": "devicon-typescript-plain", "name": "TypeScript"},
]
