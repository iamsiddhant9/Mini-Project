from django.urls import path
from . import views

urlpatterns = [
    path("hackathons/",                      views.HackathonListView.as_view(),            name="hackathon-list"),
    path("hackathons/recommendations/",      views.HackathonRecommendationsView.as_view(), name="hackathon-recommendations"),
    path("hackathons/<int:hackathon_id>/",   views.HackathonDetailView.as_view(),          name="hackathon-detail"),
    path("hackathons/seed/",                 views.SeedHackathonsView.as_view(),           name="hackathon-seed"),
]