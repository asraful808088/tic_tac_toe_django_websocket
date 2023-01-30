from django.urls import path

from .consumers import ChatWebSocket

urls_patterns=[
    path('ws/game/<str:params>',ChatWebSocket.as_asgi(),name="chetwebsocket")
]