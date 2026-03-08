from django.db import models

# Create your models here.
class removed_bg_result(models.Model):
    image = models.ImageField(upload_to='images/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class passport_stamp_result(models.Model):
    image_id = models.ForeignKey(removed_bg_result, on_delete=models.CASCADE)
    image1 = models.ImageField(upload_to='images/')
    passport_stamp = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
