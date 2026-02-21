# backRimg/serializers.py
from rest_framework import serializers

class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()



class PassportStampSerializer(serializers.Serializer):
    image = serializers.ImageField()
    bg_color = serializers.CharField(default="#FFFFFF")
    photo_size = serializers.ChoiceField(choices=["1.5x1.9", "0.8x1"])
    page_size = serializers.ChoiceField(choices=["A4", "A5"])
    rows = serializers.IntegerField(min_value=1, max_value=30)
    dpi = serializers.IntegerField(min_value=150, max_value=600, required=False, default=300)