# usersManagement/apps.py
from django.apps import AppConfig

class UsersmanagementConfig(AppConfig):
    name = 'usersManagement'

    def ready(self):
        import usersManagement.signals  # Ensure the signals are registered
