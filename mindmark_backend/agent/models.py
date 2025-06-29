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
    topic = models.ForeignKey(
        Topic, on_delete=models.CASCADE, related_name='messages'
    )
    user_message = models.TextField()
    agent_response = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']  # ✅ Messages in order by time

    def __str__(self):
        return f"Message in {self.topic.title} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
