# backRimg/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.pipeline import remove_bg
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
from django.conf import settings
import os

class RemoveBGAPIView(APIView):

    def post(self, request, *args, **kwargs):

        # If both cases: single or multiple uploads
        files = request.FILES.getlist('image')

        if not files:
            return Response({"error": "No image uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        output_urls = []  # list for multiple results

        for uploaded_file in files:

            # Save temporarily inside media/temp/
            temp_path = default_storage.save(
                f"temp/{uploaded_file.name}",
                ContentFile(uploaded_file.read())
            )
            temp_full_path = Path(settings.MEDIA_ROOT) / temp_path

            # Create output directory media/remove_bg_results/
            output_dir = Path(settings.MEDIA_ROOT) / "remove_bg_results"
            output_dir.mkdir(parents=True, exist_ok=True)

            # Call background removal helper
            output_path = remove_bg(str(temp_full_path), str(output_dir))

            # Delete temp file to save space
            if os.path.exists(temp_full_path):
                os.remove(temp_full_path)

            # Extract the filename only
            filename = Path(output_path).name

            # Correct media URL: /media/remove_bg_results/filename.png
            relative_url = settings.MEDIA_URL + "remove_bg_results/" + filename

            # Convert to full absolute URL
            absolute_url = request.build_absolute_uri(relative_url)

            # Add to results list
            output_urls.append(absolute_url)

        # If only one image was uploaded, return single URL
        if len(output_urls) == 1:
            return Response({"url": output_urls[0]}, status=status.HTTP_200_OK)

        # Else multiple
        return Response({"urls": output_urls}, status=status.HTTP_200_OK)


class PassportStampProcessAPIView(APIView):
    """
    POST multipart/form-data:
      - image: file
      - bg_color: "#FFFFFF"
      - photo_size: "1.5x1.9" or "0.8x1"
      - page_size: "A4" or "A5"
      - rows: int
      - dpi: optional (default 300)
    Response:
      { "sheet_url": "https://.../media/passport_sheets/xxx.png" }
    """

    def post(self, request, *args, **kwargs):
        ser = PassportStampSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        image_file = ser.validated_data["image"]
        bg_color = ser.validated_data["bg_color"]
        photo_size = ser.validated_data["photo_size"]
        page_size = ser.validated_data["page_size"]
        rows = ser.validated_data["rows"]
        dpi = ser.validated_data.get("dpi", 300)

        # 1) Save temp input
        temp_path = default_storage.save(
            f"temp/{image_file.name}",
            ContentFile(image_file.read())
        )
        temp_full_path = Path(settings.MEDIA_ROOT) / temp_path

        try:
            # 2) remove background (outputs RGBA PNG)
            remove_dir = Path(settings.MEDIA_ROOT) / "remove_bg_results"
            remove_dir.mkdir(parents=True, exist_ok=True)
            no_bg_path = remove_bg(str(temp_full_path), str(remove_dir))

            # 3) apply background color
            colored_dir = Path(settings.MEDIA_ROOT) / "passport_colored"
            colored_dir.mkdir(parents=True, exist_ok=True)
            colored_path = colored_dir / f"{Path(no_bg_path).stem}_bg.png"
            colored_path_str = add_bg_color(no_bg_path, bg_color, str(colored_path))

            # 4) build sheet
            sheets_dir = Path(settings.MEDIA_ROOT) / "passport_sheets"
            sheets_dir.mkdir(parents=True, exist_ok=True)
            sheet_filename = f"{Path(temp_full_path).stem}_{page_size}_{photo_size}_{rows}rows.png"
            sheet_path = sheets_dir / sheet_filename

            final_sheet_path = build_passport_sheet(
                photo_rgb_path=colored_path_str,
                output_path=str(sheet_path),
                page_size=page_size,
                photo_size=photo_size,
                rows=rows,
                dpi=dpi,
            )

            # URL
            relative_url = settings.MEDIA_URL + "passport_sheets/" + Path(final_sheet_path).name
            absolute_url = request.build_absolute_uri(relative_url)

            return Response({"sheet_url": absolute_url}, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        finally:
            # cleanup temp upload
            if temp_full_path.exists():
                try:
                    os.remove(temp_full_path)
                except Exception:
                    pass