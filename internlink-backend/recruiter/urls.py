from django.urls import path
from . import views

urlpatterns = [
    path("recruiter/internships/",                          views.RecruiterInternshipListView.as_view(),    name="recruiter-internships"),
    path("recruiter/internships/<int:internship_id>/",      views.RecruiterInternshipDetailView.as_view(),  name="recruiter-internship-detail"),
    path("recruiter/internships/<int:internship_id>/applicants/", views.RecruiterApplicantsView.as_view(), name="recruiter-applicants"),
    path("recruiter/applications/<int:application_id>/",    views.RecruiterUpdateApplicationView.as_view(), name="recruiter-update-application"),
    path("recruiter/stats/",                                views.RecruiterStatsView.as_view(),             name="recruiter-stats"),
]