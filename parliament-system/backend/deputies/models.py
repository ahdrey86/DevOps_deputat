from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class User(AbstractUser):
    """Расширенная модель пользователя"""
    USER_TYPE_CHOICES = [
        ('deputy', 'Депутат'),
        ('admin', 'Администратор'),
        ('guest', 'Гость'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='guest')
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


class Party(models.Model):
    """Модель политической партии"""
    name = models.CharField(max_length=200, verbose_name='Название партии')
    short_name = models.CharField(max_length=50, verbose_name='Краткое название')
    logo = models.ImageField(upload_to='party_logos/', blank=True, null=True)
    description = models.TextField(blank=True, verbose_name='Описание')
    founded_date = models.DateField(null=True, blank=True, verbose_name='Дата основания')
    website = models.URLField(blank=True, verbose_name='Веб-сайт')
    color = models.CharField(max_length=7, default='#000000', verbose_name='Цвет партии (HEX)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Партия'
        verbose_name_plural = 'Партии'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def members_count(self):
        return self.deputies.count()


class Deputy(models.Model):
    """Модель депутата"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='deputy_profile', null=True, blank=True)
    first_name = models.CharField(max_length=100, verbose_name='Имя')
    last_name = models.CharField(max_length=100, verbose_name='Фамилия')
    middle_name = models.CharField(max_length=100, blank=True, verbose_name='Отчество')
    party = models.ForeignKey(Party, on_delete=models.SET_NULL, null=True, related_name='deputies', verbose_name='Партия')
    photo = models.ImageField(upload_to='deputy_photos/', blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True, verbose_name='Дата рождения')
    election_date = models.DateField(verbose_name='Дата избрания')
    district = models.CharField(max_length=200, verbose_name='Избирательный округ')
    biography = models.TextField(blank=True, verbose_name='Биография')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Депутат'
        verbose_name_plural = 'Депутаты'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.last_name} {self.first_name} {self.middle_name}'.strip()

    @property
    def full_name(self):
        return f'{self.last_name} {self.first_name} {self.middle_name}'.strip()

    @property
    def attendance_rate(self):
        """Процент посещаемости заседаний"""
        total_sessions = self.attendances.count()
        if total_sessions == 0:
            return 0
        present_sessions = self.attendances.filter(is_present=True).count()
        return round((present_sessions / total_sessions) * 100, 2)


class Session(models.Model):
    """Модель заседания"""
    SESSION_TYPE_CHOICES = [
        ('plenary', 'Пленарное'),
        ('committee', 'Комитет'),
        ('working_group', 'Рабочая группа'),
        ('extraordinary', 'Внеочередное'),
    ]
    
    title = models.CharField(max_length=300, verbose_name='Название заседания')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default='plenary')
    date = models.DateTimeField(verbose_name='Дата и время')
    agenda = models.TextField(verbose_name='Повестка дня')
    location = models.CharField(max_length=200, verbose_name='Место проведения')
    duration_minutes = models.IntegerField(default=60, verbose_name='Продолжительность (минут)')
    documents = models.FileField(upload_to='session_documents/', blank=True, null=True)
    is_closed = models.BooleanField(default=False, verbose_name='Закрытое заседание')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заседание'
        verbose_name_plural = 'Заседания'
        ordering = ['-date']

    def __str__(self):
        return f'{self.title} - {self.date.strftime("%d.%m.%Y")}'

    @property
    def attendance_rate(self):
        """Процент посещаемости заседания"""
        total_deputies = Deputy.objects.filter(is_active=True).count()
        if total_deputies == 0:
            return 0
        present_deputies = self.attendances.filter(is_present=True).count()
        return round((present_deputies / total_deputies) * 100, 2)


class Attendance(models.Model):
    """Модель посещаемости"""
    deputy = models.ForeignKey(Deputy, on_delete=models.CASCADE, related_name='attendances', verbose_name='Депутат')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='attendances', verbose_name='Заседание')
    is_present = models.BooleanField(default=False, verbose_name='Присутствовал')
    absence_reason = models.CharField(max_length=200, blank=True, verbose_name='Причина отсутствия')
    arrival_time = models.TimeField(null=True, blank=True, verbose_name='Время прибытия')
    departure_time = models.TimeField(null=True, blank=True, verbose_name='Время ухода')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Посещаемость'
        verbose_name_plural = 'Посещаемость'
        unique_together = ['deputy', 'session']
        ordering = ['session', 'deputy']

    def __str__(self):
        status = 'Присутствовал' if self.is_present else 'Отсутствовал'
        return f'{self.deputy} - {self.session} ({status})'


class Vote(models.Model):
    """Модель голосования"""
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='votes', verbose_name='Заседание')
    title = models.CharField(max_length=300, verbose_name='Вопрос голосования')
    description = models.TextField(verbose_name='Описание')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True, verbose_name='Активно')

    class Meta:
        verbose_name = 'Голосование'
        verbose_name_plural = 'Голосования'

    def __str__(self):
        return self.title

    @property
    def results(self):
        """Подсчет результатов голосования"""
        votes = self.deputy_votes.all()
        return {
            'for': votes.filter(choice='for').count(),
            'against': votes.filter(choice='against').count(),
            'abstain': votes.filter(choice='abstain').count(),
            'total': votes.count()
        }


class DeputyVote(models.Model):
    """Модель голоса депутата"""
    VOTE_CHOICES = [
        ('for', 'За'),
        ('against', 'Против'),
        ('abstain', 'Воздержался'),
    ]
    
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name='deputy_votes')
    deputy = models.ForeignKey(Deputy, on_delete=models.CASCADE, related_name='votes')
    choice = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Голос депутата'
        verbose_name_plural = 'Голоса депутатов'
        unique_together = ['vote', 'deputy']

    def __str__(self):
        return f'{self.deputy} - {self.get_choice_display()}'