from django.urls import path
from . import views

urlpatterns = [
    path("jobs/fetch/",      views.FetchAdzunaJobsView.as_view(),    name="fetch-jobs"),
    path("jobs/fetch-all/",  views.AdzunaKeywordsView.as_view(),     name="fetch-all-jobs"),
]