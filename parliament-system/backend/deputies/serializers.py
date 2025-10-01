from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Party, Deputy, Session, Attendance, Vote, DeputyVote


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone', 'first_name', 'last_name']
        read_only_fields = ['id', 'user_type']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Аккаунт деактивирован')
                data['user'] = user
            else:
                raise serializers.ValidationError('Неверные учетные данные')
        else:
            raise serializers.ValidationError('Необходимо указать имя пользователя и пароль')
        
        return data


class PartySerializer(serializers.ModelSerializer):
    members_count = serializers.ReadOnlyField()
    founded_year = serializers.SerializerMethodField()

    class Meta:
        model = Party
        fields = [
            'id', 'name', 'short_name', 'logo', 'description',
            'founded_date', 'founded_year',  # 👈 добавили год
            'website', 'color', 'members_count'
        ]

    def get_founded_year(self, obj):
        return obj.founded_date.year if obj.founded_date else None

class DeputyListSerializer(serializers.ModelSerializer):
    party_name = serializers.CharField(source='party.name', read_only=True)
    party_color = serializers.CharField(source='party.color', read_only=True)
    attendance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Deputy
        fields = [
            'id', 'full_name', 'photo', 'party', 'party_name', 
            'party_color', 'district', 'attendance_rate', 'is_active'
        ]


class DeputyDetailSerializer(serializers.ModelSerializer):
    party = PartySerializer(read_only=True)
    party_id = serializers.PrimaryKeyRelatedField(
        queryset=Party.objects.all(), 
        source='party', 
        write_only=True
    )
    attendance_rate = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Deputy
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 'full_name',
            'party', 'party_id', 'photo', 'birth_date', 'election_date',
            'district', 'biography', 'email', 'phone', 'is_active',
            'attendance_rate', 'created_at', 'updated_at'
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    deputy_name = serializers.CharField(source='deputy.full_name', read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'deputy', 'deputy_name', 'session', 'session_title',
            'is_present', 'absence_reason', 'arrival_time', 'departure_time'
        ]


class SessionListSerializer(serializers.ModelSerializer):
    attendance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Session
        fields = [
            'id', 'title', 'session_type', 'date', 'location',
            'attendance_rate', 'is_closed'
        ]


class SessionDetailSerializer(serializers.ModelSerializer):
    attendance_rate = serializers.ReadOnlyField()
    attendances = AttendanceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Session
        fields = [
            'id', 'title', 'session_type', 'date', 'agenda', 'location',
            'duration_minutes', 'documents', 'is_closed', 'attendance_rate',
            'attendances', 'created_at', 'updated_at'
        ]


class DeputyVoteSerializer(serializers.ModelSerializer):
    deputy_name = serializers.CharField(source='deputy.full_name', read_only=True)
    
    class Meta:
        model = DeputyVote
        fields = ['id', 'deputy', 'deputy_name', 'choice', 'created_at']


class VoteSerializer(serializers.ModelSerializer):
    results = serializers.ReadOnlyField()
    deputy_votes = DeputyVoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Vote
        fields = [
            'id', 'session', 'title', 'description', 
            'results', 'deputy_votes', 'is_active', 'created_at'
        ]


class StatisticsSerializer(serializers.Serializer):
    total_deputies = serializers.IntegerField()
    active_deputies = serializers.IntegerField()
    total_parties = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    average_attendance = serializers.FloatField()
    upcoming_sessions = serializers.IntegerField()
    recent_sessions = SessionListSerializer(many=True)
    top_attendees = DeputyListSerializer(many=True)