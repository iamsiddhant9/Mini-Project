from django.urls import path
from . import views

urlpatterns = [
    path("admin-panel/stats/",                          views.AdminStatsView.as_view(),             name="admin-stats"),
    path("admin-panel/users/",                          views.AdminUsersView.as_view(),              name="admin-users"),
    path("admin-panel/users/<int:user_id>/approve/",    views.AdminApproveRecruiterView.as_view(),   name="admin-approve"),
    path("admin-panel/users/<int:user_id>/toggle/",     views.AdminToggleUserView.as_view(),         name="admin-toggle"),
    path("admin-panel/users/<int:user_id>/detail/",     views.AdminUserDetailView.as_view(),         name="admin-user-detail"),
    path("admin-panel/internships/",                    views.AdminInternshipsView.as_view(),        name="admin-internships"),
    path("admin-panel/internships/<int:internship_id>/", views.AdminInternshipsView.as_view(),       name="admin-internship-detail"),
    path("admin-panel/pending-recruiters/",             views.AdminPendingRecruitersView.as_view(),  name="admin-pending"),
]