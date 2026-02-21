# backRimg/utils/passport_stamp.py
from __future__ import annotations

from pathlib import Path
from typing import Tuple

from PIL import Image, ImageColor


# Page sizes in inches (ISO)
PAGE_SIZES_IN = {
    "A4": (8.27, 11.69),
    "A5": (5.83, 8.27),
}

PHOTO_PRESETS = {
    # name: (width_in, height_in, per_row)
    "1.5x1.9": (1.7, 2.1,4),
    "0.8x1": (0.8, 1.0, 9),
}

DEFAULT_DPI = 300


def _parse_hex_color(bg_color: str) -> Tuple[int, int, int]:
    return ImageColor.getrgb(bg_color)


def add_bg_color(rgba_path: str, bg_color: str, out_path: str) -> str:
    rgb = _parse_hex_color(bg_color)

    img = Image.open(rgba_path).convert("RGBA")
    bg = Image.new("RGBA", img.size, color=(rgb[0], rgb[1], rgb[2], 255))
    composed = Image.alpha_composite(bg, img).convert("RGB")

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    composed.save(out, format="PNG")
    return str(out)


def inches_to_px(inches: float, dpi: int) -> int:
    return int(round(inches * dpi))


def build_passport_sheet(
    photo_rgb_path: str,
    output_path: str,
    page_size: str,
    photo_size: str,
    rows: int,
    dpi: int = DEFAULT_DPI,
) -> str:
    if page_size not in PAGE_SIZES_IN:
        raise ValueError(f"Invalid page_size: {page_size}. Use A4 or A5.")

    if photo_size not in PHOTO_PRESETS:
        raise ValueError(f"Invalid photo_size: {photo_size}. Use one of {list(PHOTO_PRESETS.keys())}")

    if rows < 1 or rows > 30:
        raise ValueError("rows must be between 1 and 30")

    page_w_in, page_h_in = PAGE_SIZES_IN[page_size]
    photo_w_in, photo_h_in, per_row = PHOTO_PRESETS[photo_size]

    page_w_px = inches_to_px(page_w_in, dpi)
    page_h_px = inches_to_px(page_h_in, dpi)

    photo_w_px = inches_to_px(photo_w_in, dpi)
    photo_h_px = inches_to_px(photo_h_in, dpi)

    photo = Image.open(photo_rgb_path).convert("RGB")
    photo = photo.resize((photo_w_px, photo_h_px), resample=Image.LANCZOS)

    sheet = Image.new("RGB", (page_w_px, page_h_px), color=(255, 255, 255))

    total_cols = per_row
    total_rows = rows

    # ✅ Fixed margins (exactly as you asked)
    MARGIN = 50# px (top, bottom, left, right)

    # Prefer 50px gaps, but clamp to fit the page while keeping 50px margins.
    preferred_gap_x = 50
    preferred_gap_y = 50

    available_w = page_w_px - 2 * MARGIN
    available_h = page_h_px - 2 * MARGIN

    if total_cols * photo_w_px > available_w:
        raise ValueError("Grid too wide for page with 50 margins. Choose smaller photo/page.")
    if total_rows * photo_h_px > available_h:
        raise ValueError("Grid too tall for page with 50 margins. Choose smaller photo/page.")

    max_gap_x = (available_w - total_cols * photo_w_px) // max(total_cols - 1, 1)
    max_gap_y = (available_h - total_rows * photo_h_px) // max(total_rows - 1, 1)

    gap_x = 0 if total_cols <= 1 else min(preferred_gap_x, max_gap_x)
    gap_y = 0 if total_rows <= 1 else min(preferred_gap_y, max_gap_y)

    # Size the grid
    grid_w = total_cols * photo_w_px + (total_cols - 1) * gap_x
    grid_h = total_rows * photo_h_px + (total_rows - 1) * gap_y

    # Ensure it fits within page after margins
    if grid_w > (page_w_px - 2 * MARGIN):
        raise ValueError("Grid too wide for page with 50 margins. Reduce gap_x or choose smaller photo/page.")
    if grid_h > (page_h_px - 2 * MARGIN):
        raise ValueError("Grid too tall for page with 50 margins. Reduce rows/gap_y or choose bigger page.")

    # ✅ Start position:
    # x starts at left margin
    start_x = MARGIN

    # ✅ y for bottom row:
    # bottom margin + photo height => y coordinate of bottom row top-left
    bottom_row_y = page_h_px - MARGIN - photo_h_px

    # ✅ Fill bottom → top, and left → right
    for r in range(total_rows):
        y = bottom_row_y - r * (photo_h_px + gap_y)  # go upward each row

        for c in range(total_cols):
            x = start_x + c * (photo_w_px + gap_x)
            sheet.paste(photo, (x, y))

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, format="PNG", dpi=(dpi, dpi))
    return str(out)
