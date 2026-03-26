from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
import time

START_TIME = time.time()


def ping(request):
    return HttpResponse("ok", content_type="text/plain")


def health(request):
    uptime = int(time.time() - START_TIME)
    return JsonResponse({
        "status": "ok",
        "uptime_seconds": uptime,
        "uptime_human": f"{uptime // 3600}h {(uptime % 3600) // 60}m {uptime % 60}s",
    })


urlpatterns = [
    path("",                   ping,                            name="ping"),
    path("api/health/",        health,                          name="health"),
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