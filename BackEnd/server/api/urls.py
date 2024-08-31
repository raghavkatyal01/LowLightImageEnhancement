from django.urls import path
from .views import ProcessImageView

urlpatterns = [
    path('predict/', ProcessImageView.as_view(), name='process_image'),
]
