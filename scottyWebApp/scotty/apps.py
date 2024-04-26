from django.apps import AppConfig


class ScottyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'scotty'

    def ready(self):
        import scotty.signals
