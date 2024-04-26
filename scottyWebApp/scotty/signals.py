from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from allauth.socialaccount.models import SocialAccount

from scotty.models import Profile, User

@receiver(user_signed_up)
def user_signed_up(request, user, **kwargs):
    social_account = SocialAccount.objects.filter(user_id=user.id).first()
    if social_account:
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'bio': '', 
                'picture': social_account.extra_data.get('picture', ''),  # Assuming `picture` key might be missing
                'content_type': 'url',
            }
        )