from django.contrib import admin
from .models import Topic, Message


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at')
    search_fields = ('title', 'user__username')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'topic', 'user_message_short', 'timestamp')
    search_fields = ('user_message', 'agent_response', 'topic__title')
    list_filter = ('timestamp',)

    def user_message_short(self, obj):
        return obj.user_message[:50] + ('...' if len(obj.user_message) > 50 else '')
    user_message_short.short_description = 'User Message'
