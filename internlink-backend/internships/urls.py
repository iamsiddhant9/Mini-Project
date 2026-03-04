from django.urls import path
from . import views

urlpatterns = [
    path("internships/",                    views.InternshipListView.as_view(),    name="internship-list"),
    path("internships/recommendations/",    views.RecommendationsView.as_view(),   name="recommendations"),
    path("internships/filters/",            views.InternshipFiltersView.as_view(), name="internship-filters"),
    path("internships/<int:internship_id>/", views.InternshipDetailView.as_view(), name="internship-detail"),
    path("internships/seed/",               views.SeedInternshipsView.as_view(),   name="internship-seed"),
]