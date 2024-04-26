from rest_framework import permissions

class IsAuthenticatedAndAndrewEmail(permissions.BasePermission):
    message = 'You are not allowed to access this page. Sign in with an andrew email.'
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.email.endswith("@andrew.cmu.edu")