from django.urls import path
from . import views

urlpatterns = [
    path("applications/",                   views.ApplicationListView.as_view(),   name="application-list"),
    path("applications/stats/",             views.ApplicationStatsView.as_view(),  name="application-stats"),
    path("applications/<int:application_id>/", views.ApplicationDetailView.as_view(), name="application-detail"),
]
