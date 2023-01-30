from django.contrib import admin
from .models import GameGroup
def  clear_db():
    GameGroup.objects.all().delete()
admin.site.register(GameGroup)
