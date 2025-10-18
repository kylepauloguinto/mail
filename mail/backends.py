from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    """
    Authenticate using either email or username.
    Works seamlessly with custom User models that use email as USERNAME_FIELD.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        
        # Accept either 'email' or 'username' keyword
        username = username or kwargs.get('email')

        # 'username' will contain whatever you passed into authenticate(username=...)
        if username is None or password is None:
            return None

        # Try to find user by email or username
        try:
            user = User.objects.filter(email=username).first()
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        # Check password
        if user.check_password(password):
            return user
        return None