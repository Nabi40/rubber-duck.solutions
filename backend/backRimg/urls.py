# backRimg/urls.py
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import RemoveBGAPIView  , PassportStampProcessAPIView

urlpatterns = [
    path('remove-bg/', RemoveBGAPIView.as_view(), name='remove-bg'),
    path("passport-stamp/", PassportStampProcessAPIView.as_view(), name="passport-stamp"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)