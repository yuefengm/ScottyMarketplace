from rest_framework.routers import DefaultRouter
from django.urls import path,include
from . import views



router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'subcomments', views.SubCommentViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'carts', views.CartViewSet, basename='cart')
router.register(r'chats', views.ChatViewSet, basename='chat')
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('logout/', views.logout_action, name='api_logout'),
    path('user/', views.current_user, name='api_current_user'),
    path('profile/<int:id>', views.profile_view, name='api_profile'),
    path('myprofile/', views.myprofile_view, name='api_myprofile'),
    path('home/', views.home_view, name='api_home'),
    path('productphoto/<int:id>', views.product_photo_action, name='api_product_photo'),
    path('profilephoto/<str:username>', views.profile_photo_action, name='api_profile_photo'),
    path('checkauth/', views.check_auth_status, name='api_check_auth_status'),
    path('follow/<int:user_id>', views.follow_action, name='follow'),
    path('unfollow/<int:user_id>', views.unfollow_action, name='unfollow'),
    path('startchat/', views.start_chat, name='start_chat'),
    path('fetch-subcomments/', views.FetchSubCommentsByCommentIDs.as_view(), name='fetch_subcomments'),
    path('create-order/', views.create_order, name='create_order'),
    path('approve-order/', views.approve_order, name='approve_order'),
    path('cancel-order/', views.cancel_order, name='cancel_order'),
]