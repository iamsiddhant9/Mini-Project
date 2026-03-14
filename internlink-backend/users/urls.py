from django.urls import path
from .views import (
    RegisterView, LoginView, GoogleAuthView,
    ProfileView, SkillsView, SkillDetailView,
    StatsView, ComputeMatchScoresView, NotificationListView
)

urlpatterns = [
    path("auth/register/",         RegisterView.as_view(),           name="register"),
    path("auth/login/",            LoginView.as_view(),              name="login"),
    path("auth/google/",           GoogleAuthView.as_view(),         name="google_auth"),
    path("users/me/",              ProfileView.as_view(),            name="profile"),
    path("users/skills/",          SkillsView.as_view(),             name="skills"),
    path("users/skills/<int:skill_id>/", SkillDetailView.as_view(), name="skill_detail"),
    path("users/stats/",           StatsView.as_view(),              name="stats"),
    path("users/compute-matches/", ComputeMatchScoresView.as_view(), name="compute_matches"),
    path("users/notifications/",   NotificationListView.as_view(),   name="notifications"),
]