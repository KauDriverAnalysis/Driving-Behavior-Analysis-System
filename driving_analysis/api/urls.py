from .views import mark_notification_read

urlpatterns = [
    # ... your existing URLs
    path('mark-notification-read/', mark_notification_read, name='mark-notification-read'),
]