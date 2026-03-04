from django.urls import path
from . import views

urlpatterns = [
    path("saved/",                      views.SavedListView.as_view(),   name="saved-list"),
    path("saved/<int:internship_id>/",  views.SavedDetailView.as_view(), name="saved-detail"),
]