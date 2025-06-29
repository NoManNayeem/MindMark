from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Topic, Message
from .serializers import RegisterSerializer, TopicSerializer, MessageSerializer
from .agent import get_agent

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class RegisterView(generics.CreateAPIView):
    """
    Register a new user.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Register a new user.",
        responses={201: openapi.Response("User created")},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TopicViewSet(viewsets.ModelViewSet):
    """
    CRUD for Topics, user-specific.
    """
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Topic.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """
    CRUD for Messages within a Topic.
    Automatically generates agent response on create.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        topic_id = self.kwargs.get("topic_pk")
        return Message.objects.filter(topic__id=topic_id, topic__user=self.request.user)

    def perform_create(self, serializer):
        topic_id = self.kwargs.get("topic_pk")
        topic = get_object_or_404(Topic, id=topic_id, user=self.request.user)

        user_msg = serializer.validated_data['user_message']

        # 🔌 Invoke memory-powered agent
        agent = get_agent(user_id=self.request.user.id, topic_id=topic_id)
        response = agent.run(user_msg)

        # 💾 Save message and response
        serializer.save(topic=topic, agent_response=response.content)
