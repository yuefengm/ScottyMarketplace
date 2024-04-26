from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    bio = models.CharField(max_length=420, blank=True)
    picture = models.FileField(blank=True)
    following = models.ManyToManyField(User, related_name='followers')
    content_type = models.CharField(max_length=50, default='image/jpeg')

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('cat1', 'Clothing & Apparel'),
        ('cat2', 'Electronics'),
        ('cat3', 'Home & Garden'),
        ('cat4', 'Health & Beauty'),
        ('cat5', 'Sports & Outdoors'),
    ]
    seller = models.ForeignKey(User, default=None, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    picture = models.FileField(blank=True)
    content_type = models.CharField(max_length=50, default='image/jpeg')
    name = models.CharField(max_length=50, default='')
    description = models.CharField(max_length=500)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    availability = models.BooleanField(default=True)
    creation_time = models.DateTimeField(auto_now_add=True)
    paypal_email = models.EmailField(max_length=254, blank=True)

class Comment(models.Model):
    user = models.ForeignKey(User, default=None, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    creation_time = models.DateTimeField(auto_now_add=True)

class SubComment(models.Model):
    from_user = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='sent_subcomment')
    to_user = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='receied_subcomment')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    creation_time = models.DateTimeField(auto_now_add=True)

class Cart(models.Model):
    user = models.ForeignKey(User, default=None, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    creation_time = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
    buyer = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='buyer')
    seller = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='seller')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    creation_time = models.DateTimeField(auto_now_add=True)
    completed_time = models.DateTimeField(auto_now=True)

class Review(models.Model):
    reviewer = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='reviewer')
    reviewed = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='reviewed')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    rating = models.IntegerField()
    creation_time = models.DateTimeField(auto_now_add=True)

class Chat(models.Model):
    participants = models.ManyToManyField(User)

class Message(models.Model):
    author = models.ForeignKey(User, default=None, on_delete=models.PROTECT, related_name='sender')
    chat = models.ForeignKey(Chat, default=None ,on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    creation_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content[:50]
    
    class Meta:
        ordering = ['creation_time']
