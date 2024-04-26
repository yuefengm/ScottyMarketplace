import os
import json
import time

import requests
from requests.auth import HTTPBasicAuth

from collections import defaultdict

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import logout
from django.http import JsonResponse, HttpResponse, Http404
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import ValidationError

from scotty.models import *
from scotty.forms import *
from scotty.serializer import *
from scotty.permissions import *
import json


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['seller', 'category']

    def get_queryset(self):
        """
        Optionally filters the returned products by a list of IDs passed via the 'ids' query parameter.
        """
        queryset = super().get_queryset()  # Get the original queryset
        ids = self.request.query_params.get('ids')

        if ids:
            id_list = ids.split(',')  # Assume IDs are passed as a comma-separated string
            queryset = queryset.filter(id__in=id_list)
        return queryset

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubCommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    queryset = SubComment.objects.all()
    serializer_class = SubCommentCreateSerializer

    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)

class FetchSubCommentsByCommentIDs(APIView):
    def get(self, request):
        comment_ids_str = request.query_params.get('comment_ids', '')
        comment_ids = json.loads(comment_ids_str) if comment_ids_str else []
        
        result_dict = defaultdict(list)
        
        subcomments = SubComment.objects.filter(comment_id__in=comment_ids)
        
        for subcomment in subcomments:
            result_dict[subcomment.comment_id].append(subcomment)
        
        serialized_data = {}
        for comment_id, subcomments in result_dict.items():
            serializer = SubCommentDetailSerializer(subcomments, many=True)
            serialized_data[comment_id] = serializer.data
        
        return Response(serialized_data)

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    serializer_class = CartSerializer

    # Override the get_queryset method to return only the user's cart
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if not product_id:
            return JsonResponse({'detail': 'Product ID required'}, status=400)
        
        # Check if the product is already in the cart
        cart_item_exists = Cart.objects.filter(user=request.user, product_id=product_id).exists()
        if cart_item_exists:
            return JsonResponse({'detail': 'Item already in cart'}, status=400)
        
        product = get_object_or_404(Product, id=product_id)
        cart_item = Cart.objects.create(user=request.user, product=product, creation_time=timezone.now())
        serializer = self.get_serializer(cart_item)
        return JsonResponse(serializer.data, status=201)


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    serializer_class = ChatSerializer

    # Override the get_queryset method to return only the user's cart
    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user)

    def get_serializer_context(self):
        # This method ensures that the request context is passed to the serializer
        return {'request': self.request}
    
    # Custom action to get or create a chat session with another user
    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        other_user_id = request.data.get('other_user_id')
        if not other_user_id:
            raise ValidationError({'detail': 'Other user ID is required.'})
        
        other_user = get_object_or_404(User, id=other_user_id)
        chat_sessions = Chat.objects.filter(participants=request.user).filter(participants=other_user)
        if chat_sessions.exists():
            chat_session = chat_sessions.first()
            created = False
        else:
            # Create a new chat session
            chat_session = Chat.objects.create()
            chat_session.participants.add(request.user, other_user)
            created = True
        serializer = self.get_serializer(chat_session)
        return JsonResponse(serializer.data, status=200 if not created else 201)

class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndAndrewEmail]
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        """
        Override to return messages for the chat session specified in the request,
        ensuring the user is a participant of the session.
        """
        chat_id = self.request.query_params.get('chat')
        chat = get_object_or_404(Chat, id=chat_id)
        if chat:
            return Message.objects.filter(chat=chat)
        else:
            return Message.objects.none()  # Empty queryset if user not part of the session or session does not exist
    
    def perform_create(self, serializer):
        chat_id = self.request.data.get('chat_id')
        content = self.request.data.get('content')
        chat = get_object_or_404(Chat, id=chat_id)

        # Ensure the user is a participant of the chat session
        if self.request.user not in chat.participants.all():
            return JsonResponse({'detail': 'You are not a participant of this chat session'}, status=400)
        
        # Now safely save the message
        serializer.save(author=self.request.user, chat=chat, content=content)

@api_view(['GET'])
@permission_classes([IsAuthenticatedAndAndrewEmail])
def check_auth_status(request):
    # If the request reaches this point, the user is authenticated
    # You can add additional checks and return more user information if needed
    return JsonResponse({'success': True, 'message': 'User is authenticated'})

def current_user(request):
    if request.user.is_authenticated:
        # Customize the response based on your User model or extend it with a Profile model
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'picture': request.user.profile.picture.url if request.user.profile.picture else None,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })
    else:
        # Return a default response for unauthenticated users
        return JsonResponse({'error': 'User is not authenticated', 'id': None}, status=200)
    
def logout_action(request):
    logout(request)
    return JsonResponse({'success': True, 'redirect': '/login'}) 

def profile_photo_action(request, username):
    user = get_object_or_404(User, username=username)  
    if not user.profile.picture:
        raise Http404("No profile picture found.")

    # Assuming the profile picture exists, serve it
    if user.profile.picture:
        with user.profile.picture.open('rb') as picture:
            response = HttpResponse(picture, content_type=user.profile.content_type)
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(picture.name)
            return response
    else:
        raise Http404("No photo found for user.")

def myprofile_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    if request.method == 'GET':
        bio = request.user.profile.bio if request.user.profile.bio else "No bio available"
        picture = 'http://team21.cmu-webapps.com/scotty/profilephoto/' + request.user.username if str(request.user.profile.picture).endswith('g') else str(request.user.profile.picture.url)[1:]
        product_list = [product.id for product in Product.objects.filter(seller=request.user)] if Product.objects.filter(seller=request.user).exists() else []
        transactions = Transaction.objects.filter(buyer=request.user)
        return JsonResponse({
            'self': True,
            'username': request.user.username, 
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email, 
            'bio': bio, 
            'picture':  picture, 
            'product_list': product_list,
            'following': [{'id': users.id, 'username': users.username} for users in list(request.user.profile.following.all())],
            'transactions': [{'id': transaction.product.id, 'product': transaction.product.name, 'price': transaction.price, 'status': 
                              transaction.status, 'order_time': transaction.creation_time.date(), 'seller_id': transaction.seller.id, 
                              'seller_name': transaction.seller.username} for transaction in transactions]
        })
    
    elif request.method == 'POST':
        user_profile = get_object_or_404(Profile, user=request.user)  # Adjust Profile to your model
        if request.FILES:
            form = ProfilePicForm(request.POST, request.FILES, instance=user_profile)
        else:
            form = ProfileBioForm(request.POST, instance=user_profile)
        if form.is_valid():
            form.save()
            picture_url = 'http://team21.cmu-webapps.com/scotty/profilephoto/' + request.user.username
            return JsonResponse({'success': True, 'picture_url': picture_url })
        else:
            errors = form.errors.as_json()
            return JsonResponse({'error': errors, 'success': False}, status=400)
    
    else:
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    
def profile_view(request, id):
    user = get_object_or_404(User, id=id)
    if user == request.user:
        return JsonResponse({'self': True})
    if request.method == 'GET':
        picture = 'http://team21.cmu-webapps.com/scotty/profilephoto/' + user.username if str(user.profile.picture).endswith('g') else str(user.profile.picture.url)[1:]
        if user.profile.following.filter(id=request.user.id).exists():
            has_login_user_followed = request.user.id
        else:
            has_login_user_followed = False
        if request.user.profile.following.filter(id=id).exists():
            followed_by_login_user = True
        else:
            followed_by_login_user = False
        return JsonResponse({'self': False,
                        'username': user.username, 
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email if user.email else "No email available", 
                        'bio': user.profile.bio, 
                        'has_login_user_followed': has_login_user_followed,
                        'followed_by_login_user': followed_by_login_user,
                        'picture': picture, 
                        'following': [{'id': users.id, 'username': users.username} for users in list(user.profile.following.all())],
                        'product_list': [product.id for product in Product.objects.filter(seller=user)],
                        })
    else:
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    
def follow_action(request, user_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    user = get_object_or_404(User, id=user_id)
    if user == request.user:
        return JsonResponse({'error': 'You cannot follow yourself', 'success': False}, status=400)
    request.user.profile.following.add(user)
    request.user.profile.save()
    return JsonResponse({'success': True})

def unfollow_action(request, user_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    user = get_object_or_404(User, id=user_id)
    request.user.profile.following.remove(user)
    request.user.profile.save()
    return JsonResponse({'success': False})

def start_chat(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required', 'success': False}, status=401)

    data = json.loads(request.body)
    other_user_id = data.get('other_user_id')
    if not other_user_id:
        return JsonResponse({'error': 'Other user ID is required', 'success': False}, status=400)
    
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found', 'success': False}, status=404)
    
    chat = Chat.objects.filter(participants=request.user).filter(participants=other_user).first()

    if not chat:
        chat = Chat.objects.create()
        chat.participants.add(request.user, other_user)

    return JsonResponse({'success': True, 'chat_id': chat.id})

def home_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    return JsonResponse({'success': True, 'redirect': '/home'}) ## have not configured the redirect home page yet

def products_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)

def product_photo_action(request, id):
    product = get_object_or_404(Product, id=id)
    if not product.picture:
        raise Http404
    
    return HttpResponse(product.picture, content_type=product.content_type)

@transaction.atomic
def create_order(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    data = json.loads(request.body.decode('utf-8'))
    product_ids = data.get('product_ids')
    if not product_ids:
        return JsonResponse({'error': 'Product IDs required', 'success': False}, status=400)
    
    with transaction.atomic():
        # Check if all products are available
        products = Product.objects.select_for_update().filter(id__in=product_ids)
        unavailable_product_ids = [product.id for product in products if not product.availability]
        
        if unavailable_product_ids:
            # If any product is not available, return an error response
            return JsonResponse({'error': 'One or more products are not available, please refresh the cart and remove unavailable items', 'success': False, 'unavailable_product_ids': unavailable_product_ids}, status=400)


        order_ids = []
        for product in products:
            product.availability = False
            product.save()
            order = Transaction.objects.create(
                buyer=request.user,
                seller=product.seller,
                product=product,
                price=product.price,
                status='PENDING'
                )
            order.save()
            order_ids.append(order.id)
        return JsonResponse({'success': True, 'order_ids': order_ids})

def approve_order(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    
    order_ids = json.loads(request.body.decode('utf-8')).get('order_ids')
    if not order_ids:
        return JsonResponse({'error': 'Order ID required', 'success': False}, status=400)
    
    prices = []
    ids = []
    for order_id in order_ids:
        order = get_object_or_404(Transaction, id=order_id)
        cart = Cart.objects.filter(user=request.user, product=order.product)
        if cart.exists():
            cart.delete()
        order.status = 'APPROVED'
        order.save()
        prices.append(order.product.price)
        ids.append(order.product.id)
    transfer_money_to_seller(prices, ids)
    return JsonResponse({'success': True})

def cancel_order(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'You are not logged in', 'success': False}, status=400)
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method', 'success': False}, status=405)
    
    order_ids = json.loads(request.body.decode('utf-8')).get('order_ids')
    if not order_ids:
        return JsonResponse({'error': 'Order ID required', 'success': False}, status=400)
    
    for order_id in order_ids:
        order = get_object_or_404(Transaction, id=order_id)
        product = order.product
        product.availability = True
        product.save()
        order.delete()
    return JsonResponse({'success': True})

def get_paypal_access_token():
    url = settings.PAYPAL_API_URL + '/v1/oauth2/token'
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    auth = HTTPBasicAuth(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET)
    body = {
        "grant_type": "client_credentials"
    }

    response = requests.post(url, headers=headers, data=body, auth=auth)
    if response.status_code == 200:
        return response.json().get('access_token')
    else:
        raise Exception(f"Failed to get access token: {response.text}")

def transfer_money_to_seller(prices, ids):   
    access_token = get_paypal_access_token()
    url = settings.PAYPAL_API_URL + '/v1/payments/payouts'
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    sender_batch_id = "batch_" + str(int(time.time()))  # 使用当前时间戳创建唯一的sender batch id
    payout_items = [
        {
            "recipient_type": "EMAIL",
            "amount": {
                "value": str(price),  # 将项目价格转换为字符串
                "currency": "USD"
            },
            "receiver": "fakepersonalaccount@gmail.com",
            "sender_item_id": f"product_{id}",
            "recipient_wallet": "PAYPAL"
        }
        for price, id in zip(prices, ids)
    ]

    payout_items = []
    for price, id in zip(prices, ids):
        product = get_object_or_404(Product, id=id)
        paypal_email = product.paypal_email  # Get the PayPal email from the product object
        item = {
            "recipient_type": "EMAIL",
            "amount": {
                "value": str(price),  # Convert the price to a string
                "currency": "USD"
            },
            "receiver": paypal_email,  # Use the PayPal email as the receiver
            "sender_item_id": f"product_{id}",
            "recipient_wallet": "PAYPAL"
        }
        payout_items.append(item)
    
    data = {
        "sender_batch_header": {
            "sender_batch_id": sender_batch_id,
            "email_subject": "You have a payment!",
            "email_message": "You have received a payment. Thanks for using our service!"
        },
        "items": payout_items
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code == 201:
        print("Payout created successfully")
        return response.json()
    else:
        print("Failed to create payout")
        print(response.text)
        return None
