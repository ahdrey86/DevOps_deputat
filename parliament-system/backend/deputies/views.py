from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import User, Party, Deputy, Session, Attendance, Vote, DeputyVote
from .serializers import (
    UserSerializer, LoginSerializer, PartySerializer,
    DeputyListSerializer, DeputyDetailSerializer,
    SessionListSerializer, SessionDetailSerializer,
    AttendanceSerializer, VoteSerializer, DeputyVoteSerializer,
    StatisticsSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Разрешение для редактирования только владельцем"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return request.user.is_staff


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Вы успешно вышли из системы'})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        data = request.data.copy()
        data['user_type'] = 'guest'  # Новые пользователи всегда гости
        
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=data['username'],
                email=data.get('email', ''),
                password=data['password'],
                user_type='guest',
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Получить список депутатов партии"""
        party = self.get_object()
        deputies = party.deputies.filter(is_active=True)
        serializer = DeputyListSerializer(deputies, many=True)
        return Response(serializer.data)


class DeputyViewSet(viewsets.ModelViewSet):
    queryset = Deputy.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DeputyListSerializer
        return DeputyDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по партии
        party_id = self.request.query_params.get('party')
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        
        # Поиск
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(middle_name__icontains=search) |
                Q(district__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """Получить посещаемость депутата"""
        deputy = self.get_object()
        attendances = deputy.attendances.select_related('session')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def votes(self, request, pk=None):
        """Получить голоса депутата"""
        deputy = self.get_object()
        votes = deputy.votes.select_related('vote')
        serializer = DeputyVoteSerializer(votes, many=True)
        return Response(serializer.data)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SessionListSerializer
        return SessionDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по типу заседания
        session_type = self.request.query_params.get('type')
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        
        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Только открытые заседания для гостей
        if (not self.request.user.is_authenticated 
            or getattr(self.request.user, "user_type", "guest") == "guest"):
            queryset = queryset.filter(is_closed=False)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Отметить посещаемость депутата"""
        if getattr(request.user, "user_type", "guest") not in ['deputy', 'admin']:
            return Response(
                {'detail': 'У вас нет прав для этого действия'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        session = self.get_object()
        deputy_id = request.data.get('deputy_id')
        is_present = request.data.get('is_present', True)
        absence_reason = request.data.get('absence_reason', '')
        
        try:
            deputy = Deputy.objects.get(id=deputy_id)
            attendance, created = Attendance.objects.update_or_create(
                deputy=deputy,
                session=session,
                defaults={
                    'is_present': is_present,
                    'absence_reason': absence_reason
                }
            )
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        except Deputy.DoesNotExist:
            return Response(
                {'detail': 'Депутат не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.filter(is_active=True)
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def cast_vote(self, request, pk=None):
        """Проголосовать"""
        if getattr(request.user, "user_type", "guest") != 'deputy':
            return Response(
                {'detail': 'Только депутаты могут голосовать'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        vote = self.get_object()
        choice = request.data.get('choice')
        
        if choice not in ['for', 'against', 'abstain']:
            return Response(
                {'detail': 'Неверный выбор голоса'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            deputy = request.user.deputy_profile
            deputy_vote, created = DeputyVote.objects.update_or_create(
                vote=vote,
                deputy=deputy,
                defaults={'choice': choice}
            )
            serializer = DeputyVoteSerializer(deputy_vote)
            return Response(serializer.data)
        except Deputy.DoesNotExist:
            return Response(
                {'detail': 'Профиль депутата не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class StatisticsView(APIView):
    """Общая статистика"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Общая статистика
        total_deputies = Deputy.objects.count()
        active_deputies = Deputy.objects.filter(is_active=True).count()
        total_parties = Party.objects.count()
        total_sessions = Session.objects.count()
        
        # Средняя посещаемость
        avg_attendance = Attendance.objects.filter(
            is_present=True
        ).aggregate(
            avg=Count('id') * 100.0 / Count('session__attendances')
        )['avg'] or 0
        
        # Предстоящие заседания
        upcoming_sessions = Session.objects.filter(
            date__gt=timezone.now()
        ).count()
        
        # Недавние заседания
        recent_sessions = Session.objects.filter(
            date__lte=timezone.now()
        ).order_by('-date')[:5]
        
        # Топ депутатов по посещаемости
        top_attendees = Deputy.objects.filter(is_active=True).annotate(
            present_count=Count('attendances', filter=Q(attendances__is_present=True)),
            total_count=Count('attendances')
        ).filter(total_count__gt=0).order_by('-present_count')[:10]
        
        data = {
            'total_deputies': total_deputies,
            'active_deputies': active_deputies,
            'total_parties': total_parties,
            'total_sessions': total_sessions,
            'average_attendance': round(avg_attendance, 2),
            'upcoming_sessions': upcoming_sessions,
            'recent_sessions': SessionListSerializer(recent_sessions, many=True).data,
            'top_attendees': DeputyListSerializer(top_attendees, many=True).data
        }
        
        return Response(data)
