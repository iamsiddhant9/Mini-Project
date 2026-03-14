from django.db import models

class Notification(models.Model):
    user_id = models.IntegerField()
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=[
        ('match', 'New Match'),
        ('deadline', 'Deadline Update'),
        ('update', 'Application Update'),
        ('system', 'System Message'),
    ], default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.type}] {self.title} for {self.user.email}"
