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
    "1.5x1.9": (1.7, 2.1, 4),
    "0.8x1": (0.8, 1.0, 9),
    "combo": (1.7, 2.1, 7),
    "passport_stamp": (1.7, 2.1, 7),
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


def apply_attire_composite(
    portrait_rgba_path: str,
    attire_png_path: str,
    out_path: str,
    scale: float = 1.0,
    offset_x_pct: float = 0.0,
    offset_y_pct: float = 0.0,
) -> str:
    portrait = Image.open(portrait_rgba_path).convert("RGBA")
    pw, ph = portrait.size

    attire = Image.open(attire_png_path).convert("RGBA")
    aw, ah = attire.size

    # Attire fits container width preserving its intrinsic aspect ratio (matching CSS object-contain)
    aspect = ah / aw
    target_w = max(1, int(round(pw * scale)))
    target_h = max(1, int(round(pw * aspect * scale)))

    attire_resized = attire.resize((target_w, target_h), resample=Image.LANCZOS)

    # Position relative to container center with X and Y percentage translation
    base_x = int(round((pw - target_w) / 2.0 + pw * offset_x_pct))
    base_y = int(round((ph - target_h) / 2.0 + ph * offset_y_pct))

    composite = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    composite.alpha_composite(portrait, (0, 0))
    composite.alpha_composite(attire_resized, (base_x, base_y))

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    composite.save(out, format="PNG")
    return str(out)


def inches_to_px(inches: float, dpi: int) -> int:
    return int(round(inches * dpi))


def build_combo_passport_stamp_sheet(
    photo_rgb_path: str,
    output_path: str,
    page_size: str = "A4",
    rows: int = 1,
    dpi: int = DEFAULT_DPI,
) -> str:
    """Builds a sheet with 3 Passport photos + 4 Stamp photos (2x2) per row."""
    if page_size not in PAGE_SIZES_IN:
        raise ValueError(f"Invalid page_size: {page_size}. Use A4 or A5.")

    if rows < 1 or rows > 5:
        raise ValueError("rows must be between 1 and 5 for combo sheet")

    page_w_in, page_h_in = PAGE_SIZES_IN[page_size]
    page_w_px = inches_to_px(page_w_in, dpi)
    page_h_px = inches_to_px(page_h_in, dpi)

    pp_w_px = inches_to_px(1.7, dpi)
    pp_h_px = inches_to_px(2.1, dpi)

    st_w_px = inches_to_px(0.8, dpi)
    st_h_px = inches_to_px(1.0, dpi)

    photo_orig = Image.open(photo_rgb_path).convert("RGB")
    pp_img = photo_orig.resize((pp_w_px, pp_h_px), resample=Image.LANCZOS)
    st_img = photo_orig.resize((st_w_px, st_h_px), resample=Image.LANCZOS)

    sheet = Image.new("RGB", (page_w_px, page_h_px), color=(255, 255, 255))

    MARGIN = 50
    gap_x = 50
    gap_y = 50
    st_gap_y = pp_h_px - (2 * st_h_px)
    if st_gap_y < 0:
        st_gap_y = 10
    st_gap_x = 30

    start_x = MARGIN
    start_y = MARGIN

    for r in range(rows):
        row_y = start_y + r * (pp_h_px + gap_y)

        # 3 Passport photos on the left
        for c in range(3):
            px = start_x + c * (pp_w_px + gap_x)
            sheet.paste(pp_img, (px, row_y))

        # 4 Stamp photos on the right (2x2 grid)
        stamp_start_x = start_x + 3 * (pp_w_px + gap_x)

        # Stamp 1 (Top-Left)
        sheet.paste(st_img, (stamp_start_x, row_y))
        # Stamp 2 (Top-Right)
        sheet.paste(st_img, (stamp_start_x + st_w_px + st_gap_x, row_y))
        # Stamp 3 (Bottom-Left)
        sheet.paste(st_img, (stamp_start_x, row_y + st_h_px + st_gap_y))
        # Stamp 4 (Bottom-Right)
        sheet.paste(st_img, (stamp_start_x + st_w_px + st_gap_x, row_y + st_h_px + st_gap_y))

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, format="PNG", dpi=(dpi, dpi))
    return str(out)


def build_custom_sheet(
    photo_rgb_path: str,
    output_path: str,
    custom_w_in: float,
    custom_h_in: float,
    count: int = 1,
    page_size: str = "A4",
    dpi: int = DEFAULT_DPI,
) -> str:
    """Builds a sheet with custom photo dimensions (in inches) and count."""
    if page_size not in PAGE_SIZES_IN:
        raise ValueError(f"Invalid page_size: {page_size}. Use A4 or A5.")

    if custom_w_in <= 0.2 or custom_h_in <= 0.2:
        raise ValueError("Custom width and height must be greater than 0.2 inches")

    if count < 1:
        count = 1

    page_w_in, page_h_in = PAGE_SIZES_IN[page_size]
    page_w_px = inches_to_px(page_w_in, dpi)
    page_h_px = inches_to_px(page_h_in, dpi)

    photo_w_px = inches_to_px(custom_w_in, dpi)
    photo_h_px = inches_to_px(custom_h_in, dpi)

    photo = Image.open(photo_rgb_path).convert("RGB")
    from PIL import ImageOps
    photo = ImageOps.fit(photo, (photo_w_px, photo_h_px), method=Image.LANCZOS, centering=(0.5, 0.5))

    sheet = Image.new("RGB", (page_w_px, page_h_px), color=(255, 255, 255))

    MARGIN = 50
    gap_x = 40
    gap_y = 40

    available_w = page_w_px - 2 * MARGIN
    available_h = page_h_px - 2 * MARGIN

    cols = max(1, (available_w + gap_x) // (photo_w_px + gap_x))
    rows = max(1, (available_h + gap_y) // (photo_h_px + gap_y))
    max_photos = cols * rows

    total_to_place = min(count, max_photos)

    start_x = MARGIN
    start_y = MARGIN

    for i in range(total_to_place):
        r = i // cols
        c = i % cols

        x = start_x + c * (photo_w_px + gap_x)
        y = start_y + r * (photo_h_px + gap_y)

        sheet.paste(photo, (x, y))

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, format="PNG", dpi=(dpi, dpi))
    return str(out)


def build_passport_sheet(
    photo_rgb_path: str,
    output_path: str,
    page_size: str,
    photo_size: str,
    rows: int = None,
    dpi: int = DEFAULT_DPI,
    custom_width: float = None,
    custom_height: float = None,
    count: int = None,
) -> str:
    if photo_size == "custom":
        w = float(custom_width or 2.0)
        h = float(custom_height or 2.0)
        c = int(count or rows or 1)
        return build_custom_sheet(
            photo_rgb_path=photo_rgb_path,
            output_path=output_path,
            custom_w_in=w,
            custom_h_in=h,
            count=c,
            page_size=page_size or "A4",
            dpi=dpi,
        )

    if photo_size in ["combo", "passport_stamp", "3pp_4stamp"]:
        return build_combo_passport_stamp_sheet(
            photo_rgb_path=photo_rgb_path,
            output_path=output_path,
            page_size=page_size,
            rows=rows or 1,
            dpi=dpi,
        )

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
    # y starts at top margin
    start_y = MARGIN

    # ✅ Fill top → bottom, and left → right
    for r in range(total_rows):
        y = start_y + r * (photo_h_px + gap_y)

        for c in range(total_cols):
            x = start_x + c * (photo_w_px + gap_x)
            sheet.paste(photo, (x, y))

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, format="PNG", dpi=(dpi, dpi))
    return str(out)
