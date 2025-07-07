# agent/models.py

from django.db import models
from django.contrib.auth.models import User


class Topic(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='topics'
    )
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # ✅ Newer topics first

    def __str__(self):
        return f"{self.title} ({self.user.username})"


class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    topic = models.ForeignKey(
        Topic, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']  # ✅ Messages in order by time

    def __str__(self):
        return f"[{self.role}] in {self.topic.title} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
