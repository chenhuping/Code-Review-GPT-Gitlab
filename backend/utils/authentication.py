"""
自定义认证类：从 Cookie 中读取 token 并验证
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from utils.redis_client import redis_client


class CookieUser:
    """
    模拟 Django User 对象，用于 DRF 认证
    """
    def __init__(self, username):
        self.username = username
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False

    def __str__(self):
        return self.username


class CookieTokenAuthentication(BaseAuthentication):
    """
    从 Cookie 中读取 auth_token 并验证
    """
    def authenticate(self, request):
        # 从 Cookie 获取 token
        token = request.COOKIES.get('auth_token')

        if not token:
            # 没有 token，返回 None（允许其他认证方式尝试）
            return None

        # 从 Redis 验证 token
        username = redis_client.get_token(token)

        if not username:
            # Token 无效或已过期
            raise AuthenticationFailed('Token 已过期或无效')

        # 返回用户对象和 token
        user = CookieUser(username)
        return (user, token)

    def authenticate_header(self, request):
        """
        返回 WWW-Authenticate header 的值
        """
        return 'Cookie'
