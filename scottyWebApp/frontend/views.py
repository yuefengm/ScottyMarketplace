from django.shortcuts import render

def index(request, id=None):
    return render(request, 'frontend/index.html')
