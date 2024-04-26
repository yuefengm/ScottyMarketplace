from django.urls import path
from . import views
urlpatterns = [
    path('', views.index),
    path('home', views.index),
    path('login', views.index),
    path('register', views.index),
    path('shop', views.index),
    path('shop/product/<int:id>', views.index),
    path('shop/category/<int:id>', views.index),
    path('sell', views.index),
    path('about', views.index),
    path('cart', views.index),
    # path('item/<int:id>', views.index),
    path('profile/<int:id>', views.index),
    path('myprofile', views.index),
    path('chats', views.index),
    path('chat/<int:id>', views.index)
]