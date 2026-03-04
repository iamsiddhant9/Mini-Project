from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        class SimpleUser:
            def __init__(self, uid):
                self.id = int(uid)
                self.pk = int(uid)
                self.is_active = True
                self.is_authenticated = True
            def __str__(self):
                return str(self.id)

        return SimpleUser(user_id)