from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Party, Deputy, Session, Attendance, Vote, DeputyVote


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'is_staff']
    list_filter = ['user_type', 'is_active', 'is_staff']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('user_type', 'phone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Дополнительная информация', {'fields': ('user_type', 'phone')}),
    )


@admin.register(Party)
class PartyAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'founded_date', 'members_count']
    search_fields = ['name', 'short_name']
    list_filter = ['founded_date']
    ordering = ['name']


@admin.register(Deputy)
class DeputyAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'party', 'district', 'is_active', 'attendance_rate']
    list_filter = ['party', 'is_active', 'election_date']
    search_fields = ['first_name', 'last_name', 'middle_name', 'district']
    ordering = ['last_name', 'first_name']
    raw_id_fields = ['user', 'party']
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'ФИО'
    
    def attendance_rate(self, obj):
        return f"{obj.attendance_rate}%"
    attendance_rate.short_description = 'Посещаемость'


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'session_type', 'date', 'location', 'is_closed', 'attendance_rate_display']
    list_filter = ['session_type', 'is_closed', 'date']
    search_fields = ['title', 'agenda', 'location']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    def attendance_rate_display(self, obj):
        return f"{obj.attendance_rate}%"
    attendance_rate_display.short_description = 'Явка'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['deputy', 'session', 'is_present', 'absence_reason', 'created_at']
    list_filter = ['is_present', 'session__date', 'deputy__party']
    search_fields = ['deputy__first_name', 'deputy__last_name', 'session__title', 'absence_reason']
    raw_id_fields = ['deputy', 'session']
    ordering = ['-session__date', 'deputy__last_name']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'session', 'is_active', 'get_results', 'created_at']
    list_filter = ['is_active', 'created_at', 'session__session_type']
    search_fields = ['title', 'description']
    raw_id_fields = ['session']
    ordering = ['-created_at']
    
    def get_results(self, obj):
        results = obj.results
        return f"За: {results['for']}, Против: {results['against']}, Воздержались: {results['abstain']}"
    get_results.short_description = 'Результаты'


@admin.register(DeputyVote)
class DeputyVoteAdmin(admin.ModelAdmin):
    list_display = ['deputy', 'vote', 'choice', 'created_at']
    list_filter = ['choice', 'created_at', 'deputy__party']
    search_fields = ['deputy__first_name', 'deputy__last_name', 'vote__title']
    raw_id_fields = ['deputy', 'vote']
    ordering = ['-created_at']