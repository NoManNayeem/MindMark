from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import RegisterView, TopicViewSet, MessageViewSet
from .chat_views import ChatView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# 🔁 Main router for topics
router = DefaultRouter()
router.register(r"topics", TopicViewSet, basename="topics")

# 🔗 Nested router: /topics/{topic_id}/messages/
topic_router = NestedDefaultRouter(router, r"topics", lookup="topic")
topic_router.register(r"messages", MessageViewSet, basename="topic-messages")

urlpatterns = [
    # 🔐 Auth endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 📁 Topic & message routes
    path("", include(router.urls)),
    path("", include(topic_router.urls)),

    # 💬 Chat endpoint
    path("topics/<int:topic_id>/chat/", ChatView.as_view(), name="chat"),
]
