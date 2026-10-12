from django.urls import path
from .views import listar_entidades, listar_experiencias

urlpatterns = [
    path("entidades/", listar_entidades, name="listar_entidades"),
    path("experiencias/", listar_experiencias, name="listar_experiencias"),
]