from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__' # all fields in the model for test purpose

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__' # all fields in the model for test purpose

class SubCommentDetailSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    class Meta:
        model = SubComment
        fields = '__all__'

class SubCommentCreateSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    class Meta:
        model = SubComment
        fields = '__all__' # all fields in the model for test purpose

class CartSerializer(serializers.ModelSerializer):
    # Display the product name instead of the product id
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'product', 'creation_time']
    
    def validate_product(self, value):
        if value.availability:
            return value
        raise serializers.ValidationError("The product is not available")

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Profile
        fields = '__all__' # all fields in the model for test purpose

class MessageSerializer(serializers.ModelSerializer):
    # Display the author's detail instead of only the author's id
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__' # all fields in the model for test purpose

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField(read_only=True)
    last_message = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'participants', 'messages', 'other_user', 'last_message']
    
    def get_other_user(self, obj):
        # Assuming the request user is available via the serialization context
        request_user = self.context['request'].user
        other_user = obj.participants.exclude(id=request_user.id).first()
        if other_user:
            return {
                'id': other_user.id,
                'username': other_user.username,
                'first_name': other_user.first_name,
                'last_name': other_user.last_name
            }
        return None
    
    def get_last_message(self, obj):
        # Get the last message for this chat based on the creation_time
        last_message = obj.message_set.last()  # message_set is the related name from Chat to Message
        if last_message:
            # Return the serialized data for the last message
            return MessageSerializer(last_message).data
        return None
