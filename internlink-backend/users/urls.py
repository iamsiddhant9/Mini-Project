from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(),    name="register"),
    path("auth/login/",    views.LoginView.as_view(),       name="login"),
    path("users/me/",      views.ProfileView.as_view(),     name="profile"),
    path("users/stats/",   views.StatsView.as_view(),       name="stats"),
    path("users/skills/",  views.SkillsView.as_view(),      name="skills"),
    path("users/skills/<int:skill_id>/", views.SkillDetailView.as_view(), name="skill-detail"),
]
