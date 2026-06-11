"""
Nota: Si, todas las dataclass aquí están
hechas de strings, pero la idea es que cada una
represente una área esperada en un portafolio.

A su vez, esto ayuda a crear componentes particulares
para cada uso.
"""

from dataclasses import dataclass
from typing import Optional, Protocol


@dataclass
class Experience:
    icon: str
    title: str
    subtitle: str
    description: str
    date: str
    location: Optional[str]
    certificate: Optional[str]


@dataclass
class Technology:
    icon: str
    name: str


@dataclass
class Project:
    icon: str
    title: str
    subtitle: str
    description: str
    image: str
    repo: str
    technologies: str


@dataclass
class Community:
    icon: str
    title: str
    description: str
    image: str
    url: str


@dataclass
class Material:
    icon: str
    title: str
    description: str
    image: str
    url: str


class CardData(Protocol):
    icon: str
    title: str
    description: str
    image: str
    url: str
