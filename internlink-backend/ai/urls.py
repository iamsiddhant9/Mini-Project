# ai/urls.py
from django.urls import path
from .views import MatchExplanationView, SkillGapView, ResumeGeneratorView, CareerCoachView, GenerateRoadmapView

urlpatterns = [
    path("ai/match-explanation/", MatchExplanationView.as_view(), name="ai-match-explanation"),
    path("ai/skill-gap/",         SkillGapView.as_view(),         name="ai-skill-gap"),
    path("ai/generate-resume/",   ResumeGeneratorView.as_view(),  name="ai-generate-resume"),
    path("ai/career-coach/",      CareerCoachView.as_view(),      name="ai-career-coach"),
    path("ai/generate-roadmap/",  GenerateRoadmapView.as_view(),  name="ai-generate-roadmap"),
]
