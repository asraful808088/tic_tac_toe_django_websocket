from django.db import models

class GameGroup(models.Model):
    group_name = models.CharField(max_length=200)
    user_name = models.CharField(max_length=200)
