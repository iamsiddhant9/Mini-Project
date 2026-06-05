from django.urls import path
from . import views

urlpatterns = [
    path("jobs/fetch/",      views.FetchAdzunaJobsView.as_view(),  name="fetch-jobs"),
    # POST  → kick off background fetch (returns 202 immediately)
    # GET   → poll current fetch status
    path("jobs/fetch-all/",  views.AdzunaKeywordsView.as_view(),   name="fetch-all-jobs"),
]