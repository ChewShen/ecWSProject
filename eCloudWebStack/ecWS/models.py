from django.db import models
from django.contrib.auth.models import User


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10)  # "user" or "model"
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)



class UserFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_content = models.TextField()

    def __str__(self):
        return self.file_name