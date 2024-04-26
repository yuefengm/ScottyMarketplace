from django.urls import re_path
from scotty import consumers

websocket_urlpatterns = [
    re_path(r'^scotty/chat/(?P<id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]