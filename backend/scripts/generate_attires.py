import os
import json
from pathlib import Path
from PIL import Image, ImageDraw

BASE_DIR = Path(__file__).resolve().parent.parent
ATTIRES_DIR = BASE_DIR / "static" / "attires"
ATTIRES_DIR.mkdir(parents=True, exist_ok=True)

# Attire Definitions (50 templates: 25 suits, 25 formal shirts)
# Male Suits (13) + Female Suits (12) = 25 Suits
# Male Shirts (13) + Female Shirts (12) = 25 Shirts

ITEMS = [
    # --- MALE SUITS (13) ---
    {"id": "ms_01", "name": "Classic Black Suit & Red Tie", "gender": "male", "category": "suit",
     "jacket": "#1a1a1e", "lapel": "#0d0d10", "shirt": "#FFFFFF", "tie": "#b91c1c", "pattern": "solid", "type": "suit"},
    {"id": "ms_02", "name": "Midnight Navy Suit & Blue Tie", "gender": "male", "category": "suit",
     "jacket": "#0f172a", "lapel": "#020617", "shirt": "#FFFFFF", "tie": "#1e40af", "pattern": "solid", "type": "suit"},
    {"id": "ms_03", "name": "Charcoal Grey Suit & Gold Tie", "gender": "male", "category": "suit",
     "jacket": "#27272a", "lapel": "#18181b", "shirt": "#f8fafc", "tie": "#d97706", "pattern": "solid", "type": "suit"},
    {"id": "ms_04", "name": "Royal Blue Business Suit & Silver Tie", "gender": "male", "category": "suit",
     "jacket": "#1e3a8a", "lapel": "#172554", "shirt": "#FFFFFF", "tie": "#94a3b8", "pattern": "solid", "type": "suit"},
    {"id": "ms_05", "name": "Dark Slate Suit & Emerald Tie", "gender": "male", "category": "suit",
     "jacket": "#334155", "lapel": "#1e293b", "shirt": "#f1f5f9", "tie": "#047857", "pattern": "solid", "type": "suit"},
    {"id": "ms_06", "name": "Classic Tuxedo & Black Bowtie", "gender": "male", "category": "suit",
     "jacket": "#111827", "lapel": "#030712", "shirt": "#FFFFFF", "tie": "#030712", "pattern": "bowtie", "type": "suit"},
    {"id": "ms_07", "name": "Navy Blue Pinstripe Suit", "gender": "male", "category": "suit",
     "jacket": "#172554", "lapel": "#0f172a", "shirt": "#FFFFFF", "tie": "#7c2d12", "pattern": "pinstripe", "type": "suit"},
    {"id": "ms_08", "name": "Espresso Brown Suit & Bronze Tie", "gender": "male", "category": "suit",
     "jacket": "#3e2723", "lapel": "#271612", "shirt": "#fdfbf7", "tie": "#b45309", "pattern": "solid", "type": "suit"},
    {"id": "ms_09", "name": "Dark Olive Formal Suit", "gender": "male", "category": "suit",
     "jacket": "#1b3320", "lapel": "#0f2013", "shirt": "#FFFFFF", "tie": "#4d7c0f", "pattern": "solid", "type": "suit"},
    {"id": "ms_10", "name": "Steel Grey Modern Blazer", "gender": "male", "category": "suit",
     "jacket": "#475569", "lapel": "#334155", "shirt": "#e0f2fe", "tie": "#0369a1", "pattern": "solid", "type": "suit"},
    {"id": "ms_11", "name": "Deep Burgundy Formal Suit", "gender": "male", "category": "suit",
     "jacket": "#4a0404", "lapel": "#2b0202", "shirt": "#FFFFFF", "tie": "#18181b", "pattern": "solid", "type": "suit"},
    {"id": "ms_12", "name": "Executive Black Suit & Purple Tie", "gender": "male", "category": "suit",
     "jacket": "#1c1917", "lapel": "#0c0a09", "shirt": "#FFFFFF", "tie": "#6b21a8", "pattern": "solid", "type": "suit"},
    {"id": "ms_13", "name": "Navy Tuxedo with Satin Shawl", "gender": "male", "category": "suit",
     "jacket": "#1e1b4b", "lapel": "#0f0e26", "shirt": "#FFFFFF", "tie": "#0f0e26", "pattern": "bowtie", "type": "suit"},

    # --- FEMALE SUITS (12) ---
    {"id": "fs_01", "name": "Women's Black Formal Blazer", "gender": "female", "category": "suit",
     "jacket": "#18181b", "lapel": "#09090b", "shirt": "#FFFFFF", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_02", "name": "Women's Navy Business Suit", "gender": "female", "category": "suit",
     "jacket": "#0f172a", "lapel": "#020617", "shirt": "#f8fafc", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_03", "name": "Charcoal Grey Slim Blazer", "gender": "female", "category": "suit",
     "jacket": "#374151", "lapel": "#1f2937", "shirt": "#f0fdf4", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_04", "name": "Ivory White Executive Blazer", "gender": "female", "category": "suit",
     "jacket": "#f8fafc", "lapel": "#e2e8f0", "shirt": "#0f172a", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_05", "name": "Emerald Green Formal Jacket", "gender": "female", "category": "suit",
     "jacket": "#064e3b", "lapel": "#022c22", "shirt": "#FFFFFF", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_06", "name": "Deep Plum Professional Blazer", "gender": "female", "category": "suit",
     "jacket": "#581c87", "lapel": "#3b0764", "shirt": "#faf5ff", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_07", "name": "Tailored Taupe Blazer", "gender": "female", "category": "suit",
     "jacket": "#57534e", "lapel": "#292524", "shirt": "#ffffff", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_08", "name": "Cobalt Blue Power Suit", "gender": "female", "category": "suit",
     "jacket": "#1d4ed8", "lapel": "#1e3a8a", "shirt": "#ffffff", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_09", "name": "Burgundy Velvet Collar Blazer", "gender": "female", "category": "suit",
     "jacket": "#701a75", "lapel": "#4a044e", "shirt": "#fdf2f8", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_10", "name": "Slate Blue Collarless Jacket", "gender": "female", "category": "suit",
     "jacket": "#475569", "lapel": "#1e293b", "shirt": "#ffffff", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_11", "name": "Rosewood Formal Blazer", "gender": "female", "category": "suit",
     "jacket": "#881337", "lapel": "#4c0519", "shirt": "#fff1f2", "tie": None, "pattern": "female_blazer", "type": "suit"},
    {"id": "fs_12", "name": "Classic Herringbone Dark Suit", "gender": "female", "category": "suit",
     "jacket": "#1c1917", "lapel": "#0c0a09", "shirt": "#f1f5f9", "tie": None, "pattern": "female_blazer", "type": "suit"},

    # --- MALE SHIRTS (13) ---
    {"id": "mh_01", "name": "Crisp White Oxford Shirt", "gender": "male", "category": "shirt",
     "shirt": "#FFFFFF", "collar": "#e2e8f0", "buttons": "#cbd5e1", "pattern": "solid", "type": "shirt"},
    {"id": "mh_02", "name": "Sky Blue Business Shirt", "gender": "male", "category": "shirt",
     "shirt": "#dbeafe", "collar": "#bfdbfe", "buttons": "#93c5fd", "pattern": "solid", "type": "shirt"},
    {"id": "mh_03", "name": "Classic French Blue Shirt", "gender": "male", "category": "shirt",
     "shirt": "#60a5fa", "collar": "#3b82f6", "buttons": "#2563eb", "pattern": "solid", "type": "shirt"},
    {"id": "mh_04", "name": "Soft Pink Formal Shirt", "gender": "male", "category": "shirt",
     "shirt": "#fce7f3", "collar": "#fbcfe8", "buttons": "#f472b6", "pattern": "solid", "type": "shirt"},
    {"id": "mh_05", "name": "Pale Lavender Dress Shirt", "gender": "male", "category": "shirt",
     "shirt": "#ede9fe", "collar": "#ddd6fe", "buttons": "#c4b5fd", "pattern": "solid", "type": "shirt"},
    {"id": "mh_06", "name": "Mint Green Formal Shirt", "gender": "male", "category": "shirt",
     "shirt": "#dcfce7", "collar": "#bbf7d0", "buttons": "#86efac", "pattern": "solid", "type": "shirt"},
    {"id": "mh_07", "name": "Charcoal Formal Dress Shirt", "gender": "male", "category": "shirt",
     "shirt": "#334155", "collar": "#1e293b", "buttons": "#0f172a", "pattern": "solid", "type": "shirt"},
    {"id": "mh_08", "name": "Black Minimalist Dress Shirt", "gender": "male", "category": "shirt",
     "shirt": "#18181b", "collar": "#09090b", "buttons": "#27272a", "pattern": "solid", "type": "shirt"},
    {"id": "mh_09", "name": "Light Grey Business Shirt", "gender": "male", "category": "shirt",
     "shirt": "#e2e8f0", "collar": "#cbd5e1", "buttons": "#94a3b8", "pattern": "solid", "type": "shirt"},
    {"id": "mh_10", "name": "Cream / Ivory Formal Shirt", "gender": "male", "category": "shirt",
     "shirt": "#fef9c3", "collar": "#fef08a", "buttons": "#fde047", "pattern": "solid", "type": "shirt"},
    {"id": "mh_11", "name": "Fine Navy Stripe White Shirt", "gender": "male", "category": "shirt",
     "shirt": "#f8fafc", "collar": "#e2e8f0", "buttons": "#1e3a8a", "pattern": "stripe", "type": "shirt"},
    {"id": "mh_12", "name": "Steel Blue Button-Down", "gender": "male", "category": "shirt",
     "shirt": "#93c5fd", "collar": "#60a5fa", "buttons": "#1d4ed8", "pattern": "solid", "type": "shirt"},
    {"id": "mh_13", "name": "Teal Spread Collar Shirt", "gender": "male", "category": "shirt",
     "shirt": "#ccfbf1", "collar": "#99f6e4", "buttons": "#0d9488", "pattern": "solid", "type": "shirt"},

    # --- FEMALE SHIRTS & BLOUSES (12) ---
    {"id": "fh_01", "name": "Classic White Pointed Collar Blouse", "gender": "female", "category": "shirt",
     "shirt": "#FFFFFF", "collar": "#f1f5f9", "buttons": "#cbd5e1", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_02", "name": "Baby Blue Silk Formal Blouse", "gender": "female", "category": "shirt",
     "shirt": "#e0f2fe", "collar": "#bae6fd", "buttons": "#7dd3fc", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_03", "name": "Blush Pink Professional Shirt", "gender": "female", "category": "shirt",
     "shirt": "#ffe4e6", "collar": "#fecdd3", "buttons": "#fda4af", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_04", "name": "Elegant Champagne Formal Top", "gender": "female", "category": "shirt",
     "shirt": "#faeed9", "collar": "#f3e0b5", "buttons": "#e0c17a", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_05", "name": "Lilac Spread Collar Blouse", "gender": "female", "category": "shirt",
     "shirt": "#f3e8ff", "collar": "#e9d5ff", "buttons": "#d8b4fe", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_06", "name": "Sage Green Professional Blouse", "gender": "female", "category": "shirt",
     "shirt": "#d1fae5", "collar": "#a7f3d0", "buttons": "#6ee7b7", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_07", "name": "Midnight Black Tailored Blouse", "gender": "female", "category": "shirt",
     "shirt": "#18181b", "collar": "#09090b", "buttons": "#3f3f46", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_08", "name": "Cobalt Blue Button Blouse", "gender": "female", "category": "shirt",
     "shirt": "#2563eb", "collar": "#1d4ed8", "buttons": "#ffffff", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_09", "name": "Ivory Pleated Collar Top", "gender": "female", "category": "shirt",
     "shirt": "#fefce8", "collar": "#fef9c3", "buttons": "#fef08a", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_10", "name": "Slate Grey V-Collar Shirt", "gender": "female", "category": "shirt",
     "shirt": "#475569", "collar": "#334155", "buttons": "#94a3b8", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_11", "name": "Burgundy Classic Dress Shirt", "gender": "female", "category": "shirt",
     "shirt": "#881337", "collar": "#4c0519", "buttons": "#fda4af", "pattern": "female_shirt", "type": "shirt"},
    {"id": "fh_12", "name": "Sky Blue Spread Collar Blouse", "gender": "female", "category": "shirt",
     "shirt": "#bae6fd", "collar": "#7dd3fc", "buttons": "#0284c7", "pattern": "female_shirt", "type": "shirt"},
]


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def generate_suit_image(item, width=600, height=600):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    j_rgb = hex_to_rgb(item["jacket"])
    l_rgb = hex_to_rgb(item["lapel"])
    s_rgb = hex_to_rgb(item["shirt"])

    cx = width // 2
    top_neck_y = int(height * 0.18)
    shoulder_y = int(height * 0.32)
    bottom_y = height

    # 1. Main Jacket Body (Shoulders to bottom)
    left_shoulder = (int(width * 0.05), shoulder_y)
    right_shoulder = (int(width * 0.95), shoulder_y)
    neck_left = (int(width * 0.32), top_neck_y)
    neck_right = (int(width * 0.68), top_neck_y)

    jacket_polygon = [
        neck_left, (cx, int(top_neck_y * 1.05)), neck_right,
        right_shoulder, (width, bottom_y), (0, bottom_y), left_shoulder
    ]
    draw.polygon(jacket_polygon, fill=j_rgb + (255,))

    # Pinstripe effect if needed
    if item.get("pattern") == "pinstripe":
        for px in range(0, width, 18):
            draw.line([(px, shoulder_y), (px, bottom_y)], fill=(255, 255, 255, 35), width=1)

    # 2. Shirt V-neck opening
    v_bottom_y = int(height * 0.72)
    shirt_v = [(int(width * 0.38), top_neck_y), (int(width * 0.62), top_neck_y), (cx, v_bottom_y)]
    draw.polygon(shirt_v, fill=s_rgb + (255,))

    # 3. Shirt Collar Points
    collar_left = [(int(width * 0.36), top_neck_y - 10), (int(width * 0.44), int(height * 0.36)), (cx, int(height * 0.28))]
    collar_right = [(int(width * 0.64), top_neck_y - 10), (int(width * 0.56), int(height * 0.36)), (cx, int(height * 0.28))]
    draw.polygon(collar_left, fill=s_rgb + (255,), outline=(0, 0, 0, 40))
    draw.polygon(collar_right, fill=s_rgb + (255,), outline=(0, 0, 0, 40))

    # 4. Tie or Bowtie
    if item.get("tie"):
        t_rgb = hex_to_rgb(item["tie"])
        if item.get("pattern") == "bowtie":
            # Bowtie Knot and Wings
            draw.ellipse([cx - 15, int(height * 0.26), cx + 15, int(height * 0.32)], fill=t_rgb + (255,))
            draw.polygon([(cx - 10, int(height * 0.29)), (cx - 55, int(height * 0.24)), (cx - 55, int(height * 0.34))], fill=t_rgb + (255,))
            draw.polygon([(cx + 10, int(height * 0.29)), (cx + 55, int(height * 0.24)), (cx + 55, int(height * 0.34))], fill=t_rgb + (255,))
        else:
            # Tie knot
            knot = [(cx - 16, int(height * 0.28)), (cx + 16, int(height * 0.28)), (cx + 12, int(height * 0.35)), (cx - 12, int(height * 0.35))]
            draw.polygon(knot, fill=t_rgb + (255,))
            # Tie body
            tie_body = [(cx - 12, int(height * 0.35)), (cx + 12, int(height * 0.35)), (cx + 26, int(height * 0.85)), (cx, int(height * 0.95)), (cx - 26, int(height * 0.85))]
            draw.polygon(tie_body, fill=t_rgb + (255,), outline=(0, 0, 0, 50))

    # 5. Lapels (Left and Right)
    left_lapel = [
        (int(width * 0.32), top_neck_y),
        (int(width * 0.24), int(height * 0.38)),
        (int(width * 0.30), int(height * 0.40)),
        (cx - 2, v_bottom_y),
        (cx - 10, bottom_y),
        (int(width * 0.18), bottom_y),
        left_shoulder
    ]
    draw.polygon(left_lapel, fill=l_rgb + (255,), outline=(0, 0, 0, 60))

    right_lapel = [
        (int(width * 0.68), top_neck_y),
        (int(width * 0.76), int(height * 0.38)),
        (int(width * 0.70), int(height * 0.40)),
        (cx + 2, v_bottom_y),
        (cx + 10, bottom_y),
        (int(width * 0.82), bottom_y),
        right_shoulder
    ]
    draw.polygon(right_lapel, fill=l_rgb + (255,), outline=(0, 0, 0, 60))

    # Pocket square for select male suits
    if item["gender"] == "male" and item["id"] in ["ms_01", "ms_02", "ms_04", "ms_07"]:
        draw.polygon([(int(width * 0.74), int(height * 0.52)), (int(width * 0.84), int(height * 0.52)), (int(width * 0.79), int(height * 0.48))], fill=(255, 255, 255, 240))
        draw.line([(int(width * 0.72), int(height * 0.52)), (int(width * 0.86), int(height * 0.52))], fill=(0, 0, 0, 100), width=2)

    return img


def generate_shirt_image(item, width=600, height=600):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    s_rgb = hex_to_rgb(item["shirt"])
    c_rgb = hex_to_rgb(item["collar"])
    b_rgb = hex_to_rgb(item["buttons"])

    cx = width // 2
    top_neck_y = int(height * 0.18)
    shoulder_y = int(height * 0.32)
    bottom_y = height

    # 1. Main Shirt Body
    left_shoulder = (int(width * 0.08), shoulder_y)
    right_shoulder = (int(width * 0.92), shoulder_y)
    neck_left = (int(width * 0.34), top_neck_y)
    neck_right = (int(width * 0.66), top_neck_y)

    shirt_polygon = [
        neck_left, (cx, int(top_neck_y * 1.08)), neck_right,
        right_shoulder, (int(width * 0.96), bottom_y), (int(width * 0.04), bottom_y), left_shoulder
    ]
    draw.polygon(shirt_polygon, fill=s_rgb + (255,))

    # Stripes if pattern
    if item.get("pattern") == "stripe":
        for px in range(0, width, 14):
            draw.line([(px, shoulder_y), (px, bottom_y)], fill=(30, 58, 138, 45), width=2)

    # 2. Placket (Center vertical button strip)
    placket_w = 28
    draw.rectangle([cx - placket_w // 2, int(height * 0.28), cx + placket_w // 2, bottom_y], fill=c_rgb + (255,), outline=(0, 0, 0, 30))

    # Buttons
    for by in range(int(height * 0.36), bottom_y - 20, 65):
        draw.ellipse([cx - 6, by - 6, cx + 6, by + 6], fill=b_rgb + (255,), outline=(0, 0, 0, 70))

    # 3. Collar (Left & Right points)
    if item["gender"] == "male":
        # Spread collar
        c_left = [(int(width * 0.34), top_neck_y - 12), (int(width * 0.44), int(height * 0.36)), (cx, int(height * 0.26))]
        c_right = [(int(width * 0.66), top_neck_y - 12), (int(width * 0.56), int(height * 0.36)), (cx, int(height * 0.26))]
    else:
        # Female classic blouse collar
        c_left = [(int(width * 0.35), top_neck_y - 10), (int(width * 0.43), int(height * 0.38)), (cx, int(height * 0.30))]
        c_right = [(int(width * 0.65), top_neck_y - 10), (int(width * 0.57), int(height * 0.38)), (cx, int(height * 0.30))]

    draw.polygon(c_left, fill=c_rgb + (255,), outline=(0, 0, 0, 50))
    draw.polygon(c_right, fill=c_rgb + (255,), outline=(0, 0, 0, 50))

    # Collar inner fold shadow
    draw.polygon([(int(width * 0.38), top_neck_y - 5), (cx, int(height * 0.24)), (int(width * 0.62), top_neck_y - 5)], fill=(0, 0, 0, 35))

    return img


def main():
    manifest = []
    for item in ITEMS:
        filename = f"{item['id']}.png"
        filepath = ATTIRES_DIR / filename

        if item["type"] == "suit":
            img = generate_suit_image(item)
        else:
            img = generate_shirt_image(item)

        img.save(filepath, format="PNG")

        manifest.append({
            "id": item["id"],
            "name": item["name"],
            "gender": item["gender"],
            "category": item["category"],
            "image": f"/static/attires/{filename}",
        })

    # Save manifest.json
    manifest_path = ATTIRES_DIR / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Generated {len(manifest)} formal attire templates in {ATTIRES_DIR}")


if __name__ == "__main__":
    main()
