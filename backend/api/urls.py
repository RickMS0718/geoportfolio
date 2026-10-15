
from django.urls import path

from .views import (
    listar_entidades,
    listar_experiencias,
    listar_formaciones,
    listar_trabajos_academicos,
)

urlpatterns = [
    path("entidades/", listar_entidades, name="listar_entidades"),
    path("experiencias/", listar_experiencias, name="listar_experiencias"),
    path("formaciones/", listar_formaciones, name="listar_formaciones"),
    path("trabajos-academicos/", listar_trabajos_academicos, name="listar_trabajos_academicos"),
]
