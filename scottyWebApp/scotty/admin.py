from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Profile)
admin.site.register(Product)
admin.site.register(Comment)
admin.site.register(SubComment)
admin.site.register(Cart)
admin.site.register(Transaction)
admin.site.register(Review)
admin.site.register(Chat)
admin.site.register(Message)

# Yucheng: 
# when you define a model in models.py, 
# you need to register it here in admin.py,
# so that it shows up in the admin interface.

