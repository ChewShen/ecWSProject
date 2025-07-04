from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    # github_url =  models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.user.username
