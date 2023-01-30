
from django.urls import path

from .views import Home

urlpatterns = [
   path('join/<str:params>',Home,name='home')
]
