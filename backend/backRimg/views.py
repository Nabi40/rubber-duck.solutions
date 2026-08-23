# backRimg/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.pipeline import remove_bg
from .utils.passport_stamp import add_bg_color, build_passport_sheet, apply_attire_composite
from .models import removed_bg_result, passport_stamp_result
from .serializers import PassportStampSerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
from django.conf import settings
import os

def format_media_url(request, rel_url):
    url = request.build_absolute_uri(rel_url)
    if not settings.DEBUG and "localhost" not in request.get_host() and "127.0.0.1" not in request.get_host():
        url = url.replace("http://", "https://", 1)
    return url

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
            absolute_url = format_media_url(request, result.image.url)

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

        custom_width = ser.validated_data.get("custom_width")
        custom_height = ser.validated_data.get("custom_height")
        count = ser.validated_data.get("count")

        attire_id = ser.validated_data.get("attire_id")
        attire_scale = ser.validated_data.get("attire_scale", 1.0)
        attire_offset_y = ser.validated_data.get("attire_offset_y", 0.0)
        attire_offset_x = ser.validated_data.get("attire_offset_x", 0.0)

        no_bg_path = removed_bg.image.path

        try:
            # 1) If attire is selected, composite attire onto portrait first
            portrait_src_path = no_bg_path
            if attire_id:
                attire_file = Path(settings.BASE_DIR) / "static" / "attires" / f"{attire_id}.png"
                if attire_file.exists():
                    attire_dir = Path(settings.MEDIA_ROOT) / "attire_composites"
                    attire_dir.mkdir(parents=True, exist_ok=True)
                    composite_filename = f"{removed_bg.id}_{attire_id}_composite.png"
                    composite_path = attire_dir / composite_filename
                    portrait_src_path = apply_attire_composite(
                        portrait_rgba_path=no_bg_path,
                        attire_png_path=str(attire_file),
                        out_path=str(composite_path),
                        scale=attire_scale,
                        offset_x_pct=attire_offset_x,
                        offset_y_pct=attire_offset_y,
                    )

            # 2) apply background color
            colored_dir = Path(settings.MEDIA_ROOT) / "passport_colored"
            colored_dir.mkdir(parents=True, exist_ok=True)

            colored_filename = f"{removed_bg.id}_{Path(portrait_src_path).stem}_bg.png"
            colored_path = colored_dir / colored_filename

            colored_path_str = add_bg_color(portrait_src_path, bg_color, str(colored_path))

            # -------------------------------------------------
            # CASE A: only image + bg_color => return colored image
            # -------------------------------------------------
            if not photo_size and not page_size and rows is None and not custom_width:
                with open(colored_path_str, "rb") as f:
                    result = passport_stamp_result(
                        image_id=removed_bg,
                        passport_stamp="bg_only",
                    )
                    result.image1.save(colored_filename, ContentFile(f.read()), save=True)

                absolute_url = format_media_url(request, result.image1.url)

                return Response(
                    {
                        "id": result.id,
                        "image_url": absolute_url
                    },
                    status=status.HTTP_200_OK
                )

            # -------------------------------------------------
            # CASE B: full passport/stamp/custom sheet generation
            # -------------------------------------------------
            if photo_size == "custom":
                if not custom_width or not custom_height:
                    return Response({"error": "custom_width and custom_height are required for custom photo_size."}, status=status.HTTP_400_BAD_REQUEST)
                page_size = page_size or "A4"
                rows = count or rows or 1
            elif not photo_size or not page_size or rows is None:
                return Response(
                    {
                        "error": "photo_size, page_size, and rows are required to generate a passport/stamp sheet."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            sheets_dir = Path(settings.MEDIA_ROOT) / "passport_sheets"
            sheets_dir.mkdir(parents=True, exist_ok=True)

            if photo_size == "custom":
                sheet_filename = f"{removed_bg.id}_{page_size}_custom_{custom_width}x{custom_height}_{count}pcs.png"
                stamp_label = f"{page_size}_custom_{custom_width}x{custom_height}_{count}pcs"
            else:
                sheet_filename = f"{removed_bg.id}_{page_size}_{photo_size}_{rows}rows.png"
                stamp_label = f"{page_size}_{photo_size}_{rows}rows"

            sheet_path = sheets_dir / sheet_filename

            final_sheet_path = build_passport_sheet(
                photo_rgb_path=colored_path_str,
                output_path=str(sheet_path),
                page_size=page_size,
                photo_size=photo_size,
                rows=rows,
                dpi=dpi,
                custom_width=custom_width,
                custom_height=custom_height,
                count=count,
            )

            with open(final_sheet_path, "rb") as f:
                stamp_result = passport_stamp_result(
                    image_id=removed_bg,
                    passport_stamp=stamp_label,
                )
                stamp_result.image1.save(sheet_filename, ContentFile(f.read()), save=True)

            absolute_url = format_media_url(request, stamp_result.image1.url)

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