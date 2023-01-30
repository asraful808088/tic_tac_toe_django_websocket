from django.shortcuts import render
from game.models import GameGroup




def Home(req,params):
    context={'params':params}
    return render(req,'home.html',context)