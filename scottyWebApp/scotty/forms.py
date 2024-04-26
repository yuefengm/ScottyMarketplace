from django import forms

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
from urllib.parse import urlparse


MAX_UPLOAD_SIZE = 2500000

class LoginForm(forms.Form):
    username = forms.CharField(max_length=20, label='Username')
    password = forms.CharField(max_length=200, widget=forms.PasswordInput(), label='Password')

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            raise forms.ValidationError("Invalid username or password!")
        return cleaned_data
    
class RegisterForm(forms.Form):
    username = forms.CharField(max_length=20, label='Username')
    password = forms.CharField(max_length=200, widget=forms.PasswordInput(), label='Password')
    #confirm_password = forms.CharField(max_length=200, widget=forms.PasswordInput(), label='Confirm Password')
    email = forms.EmailField(max_length=50, widget=forms.EmailInput(), label='Email')
    #first_name = forms.CharField(max_length=20, label='First Name')
    #last_name  = forms.CharField(max_length=20, label='Last Name')

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        # confirm_password = cleaned_data.get('confirm_password')
        # if password != confirm_password:
        #     raise forms.ValidationError("Passwords do not match!")
        return cleaned_data
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("Username already exists!")
        return username

class ProfileBioForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('bio',)

        widgets = {
            'bio': forms.Textarea(attrs={'id':'bio_input_text', 'rows': 3, 'cols': 50}),
        }

        labels = {
            'bio': '',
        }

    def clean_bio(self):
        bio = self.cleaned_data.get('bio')
        if len(bio) > 430:
            raise forms.ValidationError("Bio is too long!")
        return bio
    

class ProfilePicForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('picture',)

        widgets = {
            'picture': forms.FileInput(attrs={'id':'profile_picture'}),
        }

        labels = {
            'picture': 'Upload Image',
        }

    def clean_picture(self):

        picture = self.cleaned_data.get('picture', None)
     
        if isinstance(picture, str) and urlparse(picture).scheme in ['http', 'https']:
        # It's a URL, not a file. Validate or just return the URL.
            return picture
        elif hasattr(picture, 'file'):
        # It's a file upload. Proceed with your existing checks.
            if picture.size > MAX_UPLOAD_SIZE:
                raise forms.ValidationError(f"Image file too large. Maximum size allowed is {MAX_UPLOAD_SIZE} bytes.")
            return picture
        else:
            raise forms.ValidationError("Invalid input for picture.")