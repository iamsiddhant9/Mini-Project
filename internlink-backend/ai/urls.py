# ai/urls.py
from django.urls import path
from .views import MatchExplanationView, SkillGapView, ResumeGeneratorView

urlpatterns = [
    path("ai/match-explanation/", MatchExplanationView.as_view(), name="ai-match-explanation"),
    path("ai/skill-gap/",         SkillGapView.as_view(),         name="ai-skill-gap"),
    path("ai/generate-resume/",   ResumeGeneratorView.as_view(),  name="ai-generate-resume"),
]
