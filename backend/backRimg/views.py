# backRimg/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.pipeline import remove_bg
from .utils.passport_stamp import add_bg_color, build_passport_sheet
from .models import removed_bg_result, passport_stamp_result
from .serializers import PassportStampSerializer
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

        results = []  # list for multiple results {id, url}

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

            # Save to database
            filename = Path(output_path).name
            with open(output_path, 'rb') as f:
                result = removed_bg_result()
                result.image.save(filename, ContentFile(f.read()), save=True)

            # Build absolute URL from stored image
            absolute_url = request.build_absolute_uri(result.image.url)
            absolute_url = absolute_url.replace("http://", "https://", 1)

            # Clean up duplicate file in remove_bg_results/
            if os.path.exists(output_path):
                os.remove(output_path)

            results.append({"id": result.id, "url": absolute_url})

        # If only one image was uploaded, return single result
        if len(results) == 1:
            return Response({"id": results[0]["id"], "url": results[0]["url"]}, status=status.HTTP_200_OK)

        # Else multiple
        return Response({"results": results}, status=status.HTTP_200_OK)


class PassportStampProcessAPIView(APIView):
    def post(self, request, *args, **kwargs):
        ser = PassportStampSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        removed_bg = ser.validated_data["image"]
        bg_color = ser.validated_data["bg_color"]
        photo_size = ser.validated_data.get("photo_size")
        page_size = ser.validated_data.get("page_size")
        rows = ser.validated_data.get("rows")
        dpi = ser.validated_data.get("dpi", 300)

        no_bg_path = removed_bg.image.path

        try:
            # 1) apply background color first
            colored_dir = Path(settings.MEDIA_ROOT) / "passport_colored"
            colored_dir.mkdir(parents=True, exist_ok=True)

            colored_filename = f"{removed_bg.id}_{Path(no_bg_path).stem}_bg.png"
            colored_path = colored_dir / colored_filename

            colored_path_str = add_bg_color(no_bg_path, bg_color, str(colored_path))

            # -------------------------------------------------
            # CASE A: only image + bg_color => return colored image
            # -------------------------------------------------
            if not photo_size and not page_size and rows is None:
                with open(colored_path_str, "rb") as f:
                    result = passport_stamp_result(
                        image_id=removed_bg,
                        passport_stamp="bg_only",
                    )
                    result.image1.save(colored_filename, ContentFile(f.read()), save=True)

                absolute_url = request.build_absolute_uri(result.image1.url)
                absolute_url = absolute_url.replace("http://", "https://", 1)

                return Response(
                    {
                        "id": result.id,
                        "image_url": absolute_url
                    },
                    status=status.HTTP_200_OK
                )

            # -------------------------------------------------
            # CASE B: full passport/stamp sheet generation
            # -------------------------------------------------
            if not photo_size or not page_size or rows is None:
                return Response(
                    {
                        "error": "photo_size, page_size, and rows are required to generate a passport/stamp sheet."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            sheets_dir = Path(settings.MEDIA_ROOT) / "passport_sheets"
            sheets_dir.mkdir(parents=True, exist_ok=True)

            sheet_filename = f"{removed_bg.id}_{page_size}_{photo_size}_{rows}rows.png"
            sheet_path = sheets_dir / sheet_filename

            final_sheet_path = build_passport_sheet(
                photo_rgb_path=colored_path_str,
                output_path=str(sheet_path),
                page_size=page_size,
                photo_size=photo_size,
                rows=rows,
                dpi=dpi,
            )

            stamp_label = f"{page_size}_{photo_size}_{rows}rows"
            with open(final_sheet_path, "rb") as f:
                stamp_result = passport_stamp_result(
                    image_id=removed_bg,
                    passport_stamp=stamp_label,
                )
                stamp_result.image1.save(sheet_filename, ContentFile(f.read()), save=True)

            absolute_url = request.build_absolute_uri(stamp_result.image1.url)
            absolute_url = absolute_url.replace("http://", "https://", 1)

            return Response(
                {
                    "id": stamp_result.id,
                    "sheet_url": absolute_url
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)