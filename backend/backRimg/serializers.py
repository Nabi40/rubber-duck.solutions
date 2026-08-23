# backRimg/serializers.py
from rest_framework import serializers
from .models import removed_bg_result


class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()


class PassportStampSerializer(serializers.Serializer):
    image = serializers.PrimaryKeyRelatedField(queryset=removed_bg_result.objects.all())
    bg_color = serializers.CharField(max_length=20)
    photo_size = serializers.CharField(max_length=30, required=False, allow_null=True, allow_blank=True)
    page_size = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    rows = serializers.IntegerField(required=False)
    dpi = serializers.IntegerField(required=False, default=300)
    custom_width = serializers.FloatField(required=False, allow_null=True)
    custom_height = serializers.FloatField(required=False, allow_null=True)
    count = serializers.IntegerField(required=False, allow_null=True)
    attire_id = serializers.CharField(max_length=50, required=False, allow_null=True, allow_blank=True)
    attire_scale = serializers.FloatField(required=False, default=1.0)
    attire_offset_y = serializers.FloatField(required=False, default=0.0)
    attire_offset_x = serializers.FloatField(required=False, default=0.0)