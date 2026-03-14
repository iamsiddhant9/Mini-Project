from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/",             admin.site.urls),
    path("api/",               include("users.urls")),
    path("api/",               include("internships.urls")),
    path("api/",               include("applications.urls")),
    path("api/",               include("saved.urls")),
    path("api/",               include("recruiter.urls")),
    path("api/",               include("admindash.urls")),
    path("api/",               include("jobs.urls")),
    path("api/",               include("ai.urls")),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]