from django.core.cache import cache
from .models import User

def get_user_by_email(email):
    key = f"user_email_{email}"
    user = cache.get(key)
    if not user:
        user = User.objects.filter(email=email).first()
        cache.set(key, user, 60)  # cache for 1 minute
    return user