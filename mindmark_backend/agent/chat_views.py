# agent/views.py

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Topic, Message
from .agent import get_agent

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class ChatView(APIView):
    """
    POST /api/topics/<topic_id>/chat/
    Sends a user message to the agent and returns a memory-aware response.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['user_message'],
            properties={
                'user_message': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The user's message to the agent"
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Agent response",
                examples={
                    "application/json": {
                        "agent_response": "Sure! Here's what I found..."
                    }
                }
            ),
            400: "Bad request: missing or invalid input",
            404: "Topic not found"
        },
        operation_description="Send a message to the agent within a specific topic. "
                              "The agent will use topic-specific memory to respond."
    )
    def post(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id, user=request.user)

        user_msg = request.data.get("user_message", "").strip()
        if not user_msg:
            return Response(
                {"error": "user_message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🧠 Get memory-aware agent for this topic
        agent = get_agent(user_id=request.user.id, topic_id=topic.id)

        # 💬 Save user's message
        Message.objects.create(
            topic=topic,
            role='user',
            content=user_msg
        )

        # 🤖 Get agent's response
        response = agent.run(user_msg)

        # 💬 Save agent's message
        Message.objects.create(
            topic=topic,
            role='assistant',
            content=response.content
        )

        return Response({"agent_response": response.content}, status=status.HTTP_200_OK)
