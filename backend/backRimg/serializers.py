# backRimg/serializers.py
from rest_framework import serializers
from .models import removed_bg_result


class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()


class PassportStampSerializer(serializers.Serializer):
    image = serializers.PrimaryKeyRelatedField(queryset=removed_bg_result.objects.all())
    bg_color = serializers.CharField(max_length=20)
    photo_size = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    page_size = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    rows = serializers.IntegerField(required=False)
    dpi = serializers.IntegerField(required=False, default=300)