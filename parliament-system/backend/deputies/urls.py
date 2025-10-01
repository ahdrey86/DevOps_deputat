from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LogoutView, RegisterView,
    PartyViewSet, DeputyViewSet, SessionViewSet,
    VoteViewSet, StatisticsView
)

router = DefaultRouter()
router.register('parties', PartyViewSet)
router.register('deputies', DeputyViewSet)
router.register('sessions', SessionViewSet)
router.register('votes', VoteViewSet)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('', include(router.urls)),   # 👈 оставляем только роутер
]
