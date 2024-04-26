from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from scotty.models import Chat, Message
import json
import logging


logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.debug(f"WebSocket connect attempt by user {self.scope['user']} for chat {self.scope['url_route']['kwargs']['id']}")

        if not self.scope["user"].is_authenticated:
            logger.info("Connection refused: User not authenticated")
            await self.close(code=4001)
            return

        self.chat_id = self.scope['url_route']['kwargs']['id']
        self.chat_group_name = f'chat_{self.chat_id}'
        self.channel_name = self.channel_name
        self.channel_layer = get_channel_layer()
        logger.debug(f"Adding to group {self.chat_group_name} with channel name {self.channel_name}")

        if await self.is_chat_participant(self.chat_id, self.scope['user']):
            await self.channel_layer.group_add(
                self.chat_group_name,
                self.channel_name
            )
            await self.accept()
            logger.info(f"User {self.scope['user']} successfully connected to chat {self.chat_id}")

            await self.send_past_messages(self.chat_id)
            logger.info(f"Sent past messages to user {self.scope['user']} in chat {self.chat_id}")
        else:
            logger.warning(f"User {self.scope['user']} not a participant of chat {self.chat_id}")
            await self.close()

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_error(self, message):
        # This helper coroutine sends an error message to the WebSocket client.
        await self.send_json({'error': message})
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            text_data_json = json.loads(text_data)
            content = text_data_json['content']
        logger.info(content)
        # logger.debug(f"Received message {content} from user {self.scope['user']} in chat {self.chat_id}")
        message = content
        await self.create_chat_message(self.chat_id, self.scope['user'], message)
        logger.debug(f"Sending message {message} from user {self.scope['user']} in chat {self.chat_id}")
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'chat_message',
                'author': self.scope['user'],
                'message': message
            }

        )
    
    async def chat_message(self, event):
        author_username = event['author'].username if hasattr(event['author'], 'username') else 'Unknown'
    
        await self.send_json({
            'message': event['message'],
            'author': author_username
        })

    @database_sync_to_async
    def create_chat_message(self, chat_id, user, message):
        chat = Chat.objects.get(id=chat_id)
        Message.objects.create(chat=chat, author=user, content=message)


    @database_sync_to_async
    def is_chat_participant(self, chat_id, user):
        #return Chat.objects.filter(chat_id, participants=user.exists())
        return Chat.objects.filter(id=chat_id, participants=user).exists()
    
    
    async def send_past_messages(self, chat_id):
        messages = await self.get_past_messages(chat_id)
        
        for msg in messages:
            author = await self.get_user(msg['author'])
            await self.send_json({
                'type': 'message',
                'author': author.username,
                'message': msg['content'],
                'creation_time': msg['creation_time'].isoformat()
            })
    
    @database_sync_to_async
    def get_past_messages(self, chat_id):
        logger.debug(f"Getting past messages for chat {chat_id}")

        return list(Message.objects.filter(chat=chat_id).order_by("creation_time").values('author', 'content', 'creation_time'))
    
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)