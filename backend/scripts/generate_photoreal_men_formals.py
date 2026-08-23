import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import json

OUTPUT_DIR = r"e:\Projects\rubber-duck\rubber-duck.solutions\backend\static\attires"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load the scraped Pinterest base suit (ms_01.png)
base_suit = Image.open(os.path.join(OUTPUT_DIR, "ms_01.png")).convert("RGBA")

# Men Suit Variations (13 Total)
suit_configs = [
    {"id": "ms_01", "name": "Classic Navy Blue Suit (Pinterest)", "hue_shift": 0, "color_mult": (1.0, 1.0, 1.0), "tie_color": (120, 120, 130)},
    {"id": "ms_02", "name": "Midnight Black Executive Suit", "hue_shift": 0, "color_mult": (0.35, 0.35, 0.38), "tie_color": (180, 20, 30)},
    {"id": "ms_03", "name": "Charcoal Grey Modern Suit", "hue_shift": 0, "color_mult": (0.55, 0.55, 0.58), "tie_color": (30, 40, 60)},
    {"id": "ms_04", "name": "Royal Blue Business Suit", "hue_shift": -10, "color_mult": (0.7, 0.9, 1.4), "tie_color": (180, 100, 20)},
    {"id": "ms_05", "name": "Dark Slate Corporate Suit", "hue_shift": 15, "color_mult": (0.45, 0.55, 0.6), "tie_color": (40, 120, 100)},
    {"id": "ms_06", "name": "Deep Burgundy Formal Suit", "hue_shift": 140, "color_mult": (1.2, 0.4, 0.5), "tie_color": (50, 50, 60)},
    {"id": "ms_07", "name": "Dark Olive Green Suit", "hue_shift": 70, "color_mult": (0.5, 0.8, 0.5), "tie_color": (140, 90, 40)},
    {"id": "ms_08", "name": "Classic Tuxedo & Black Tie", "hue_shift": 0, "color_mult": (0.22, 0.22, 0.25), "tie_color": (20, 20, 20)},
    {"id": "ms_09", "name": "Steel Blue Slim-Fit Suit", "hue_shift": -5, "color_mult": (0.6, 0.8, 1.1), "tie_color": (100, 30, 40)},
    {"id": "ms_10", "name": "Espresso Brown Classic Suit", "hue_shift": 160, "color_mult": (0.8, 0.55, 0.4), "tie_color": (40, 60, 80)},
    {"id": "ms_11", "name": "Graphite Grey Formal Suit", "hue_shift": 0, "color_mult": (0.48, 0.48, 0.5), "tie_color": (120, 30, 80)},
    {"id": "ms_12", "name": "Ocean Blue Tailored Suit", "hue_shift": -15, "color_mult": (0.5, 0.85, 1.3), "tie_color": (70, 70, 80)},
    {"id": "ms_13", "name": "Jet Black Peak Lapel Suit", "hue_shift": 0, "color_mult": (0.28, 0.28, 0.3), "tie_color": (60, 80, 140)},
]

# Function to transform suit jacket color while keeping white collar & tie natural
def generate_suit_variant(base_img, config):
    img_np = np.array(base_img).astype(np.float32)
    r, g, b, a = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2], img_np[:,:,3]
    
    # Mask of the jacket (blue fabric has higher blue or darker intensity, avoiding white collar)
    # White collar has high brightness across R, G, B (> 210)
    is_collar = (r > 200) & (g > 200) & (b > 200) & (a > 50)
    
    # Jacket is non-collar opaque regions
    is_jacket = (a > 50) & (~is_collar)
    
    # Apply color multiplier to jacket
    mult = config["color_mult"]
    r[is_jacket] = np.clip(r[is_jacket] * mult[0], 0, 255)
    g[is_jacket] = np.clip(g[is_jacket] * mult[1], 0, 255)
    b[is_jacket] = np.clip(b[is_jacket] * mult[2], 0, 255)
    
    out_np = np.stack([r, g, b, a], axis=2).astype(np.uint8)
    return Image.fromarray(out_np, mode="RGBA")

print("Generating 13 Men Suits...")
for cfg in suit_configs:
    out_path = os.path.join(OUTPUT_DIR, f"{cfg['id']}.png")
    if cfg["id"] == "ms_01":
        base_suit.save(out_path, "PNG")
    else:
        var_img = generate_suit_variant(base_suit, cfg)
        var_img.save(out_path, "PNG")
    print(f"Saved {cfg['id']}: {cfg['name']}")

# Men Formal Shirts (12 Total)
# Create realistic dress shirts with collar, placket, and button details
shirt_configs = [
    {"id": "mh_01", "name": "Crisp White Oxford Shirt", "base_color": (250, 250, 252), "collar_edge": (220, 222, 228)},
    {"id": "mh_02", "name": "Sky Blue Formal Shirt", "base_color": (205, 225, 250), "collar_edge": (175, 200, 235)},
    {"id": "mh_03", "name": "Classic French Blue Shirt", "base_color": (170, 200, 240), "collar_edge": (140, 175, 220)},
    {"id": "mh_04", "name": "Pastel Pink Dress Shirt", "base_color": (252, 225, 232), "collar_edge": (235, 195, 205)},
    {"id": "mh_05", "name": "Lavender Executive Shirt", "base_color": (235, 225, 248), "collar_edge": (210, 195, 230)},
    {"id": "mh_06", "name": "Mint Green Formal Shirt", "base_color": (220, 245, 235), "collar_edge": (185, 225, 210)},
    {"id": "mh_07", "name": "Light Grey Poplin Shirt", "base_color": (228, 230, 234), "collar_edge": (195, 198, 204)},
    {"id": "mh_08", "name": "Charcoal Grey Dress Shirt", "base_color": (95, 100, 110), "collar_edge": (75, 80, 90)},
    {"id": "mh_09", "name": "Midnight Navy Formal Shirt", "base_color": (45, 55, 75), "collar_edge": (35, 45, 60)},
    {"id": "mh_10", "name": "Beige Cream Tailored Shirt", "base_color": (245, 238, 225), "collar_edge": (220, 210, 195)},
    {"id": "mh_11", "name": "Fine Blue Micro-Stripe Shirt", "base_color": (215, 230, 248), "collar_edge": (180, 205, 230)},
    {"id": "mh_12", "name": "Executive Black Dress Shirt", "base_color": (38, 40, 44), "collar_edge": (28, 30, 34)},
    {"id": "mh_13", "name": "Classic White Dobby Textured Shirt", "base_color": (252, 252, 255), "collar_edge": (215, 218, 225)},
]

# Generate realistic formal shirt cutouts
def generate_shirt_cutout(cfg, width=640, height=640):
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    cv_img = np.zeros((height, width, 4), dtype=np.uint8)
    
    base_c = cfg["base_color"]
    edge_c = cfg["collar_edge"]
    
    # Draw Torso / Shoulder fabric (y=340 down to bottom)
    pts_torso = np.array([
        [120, 380],
        [240, 310],
        [320, 360],
        [400, 310],
        [520, 380],
        [640, 440],
        [640, 640],
        [0, 640],
        [0, 440]
    ], np.int32)
    cv2.fillPoly(cv_img, [pts_torso], (base_c[2], base_c[1], base_c[0], 255))
    
    # Shading on shoulders
    cv2.line(cv_img, (0, 440), (240, 310), (int(edge_c[2]*0.9), int(edge_c[1]*0.9), int(edge_c[0]*0.9), 180), 3)
    cv2.line(cv_img, (640, 440), (400, 310), (int(edge_c[2]*0.9), int(edge_c[1]*0.9), int(edge_c[0]*0.9), 180), 3)
    
    # Center Placket (Vertical Button Strip)
    cv2.rectangle(cv_img, (308, 350), (332, 640), (edge_c[2], edge_c[1], edge_c[0], 255), -1)
    cv2.line(cv_img, (308, 350), (308, 640), (int(edge_c[2]*0.8), int(edge_c[1]*0.8), int(edge_c[0]*0.8), 255), 1)
    cv2.line(cv_img, (332, 350), (332, 640), (int(edge_c[2]*0.8), int(edge_c[1]*0.8), int(edge_c[0]*0.8), 255), 1)
    
    # Pearl Buttons
    for btn_y in [420, 490, 560, 630]:
        cv2.circle(cv_img, (320, btn_y), 5, (255, 255, 255, 255), -1)
        cv2.circle(cv_img, (320, btn_y), 5, (180, 180, 185, 255), 1)
        cv2.circle(cv_img, (320, btn_y), 1, (120, 120, 125, 255), -1)
        
    # Left Collar Leaf
    pts_left_collar = np.array([
        [220, 270], # Neck top left
        [320, 355], # Tie/Collar center point
        [285, 395], # Left collar point tip
        [210, 330]  # Left outer neck
    ], np.int32)
    cv2.fillPoly(cv_img, [pts_left_collar], (int(base_c[2]*1.02), int(base_c[1]*1.02), int(base_c[0]*1.02), 255))
    cv2.polylines(cv_img, [pts_left_collar], True, (edge_c[2], edge_c[1], edge_c[0], 255), 2)
    
    # Right Collar Leaf
    pts_right_collar = np.array([
        [420, 270], # Neck top right
        [320, 355], # Center point
        [355, 395], # Right collar point tip
        [430, 330]  # Right outer neck
    ], np.int32)
    cv2.fillPoly(cv_img, [pts_right_collar], (int(base_c[2]*0.98), int(base_c[1]*0.98), int(base_c[0]*0.98), 255))
    cv2.polylines(cv_img, [pts_right_collar], True, (edge_c[2], edge_c[1], edge_c[0], 255), 2)
    
    # Inner neck opening (transparent curve between collars)
    # The neck area remains (0, 0, 0, 0) transparent so the person's neck shows through!
    
    img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGRA2RGBA))
    return img

print("\nGenerating 12 Men Formal Shirts...")
for cfg in shirt_configs:
    out_path = os.path.join(OUTPUT_DIR, f"{cfg['id']}.png")
    shirt_img = generate_shirt_cutout(cfg)
    shirt_img.save(out_path, "PNG")
    print(f"Saved {cfg['id']}: {cfg['name']}")

# Update manifest.json with all 25 Men Formals (13 Suits + 12 Shirts) + 25 Female Formals
manifest_file = os.path.join(OUTPUT_DIR, "manifest.json")
try:
    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)
except Exception:
    manifest = []

final_manifest = []

# Keep female items
for item in manifest:
    if item.get("gender") == "female":
        final_manifest.append(item)

# Add male suits
for cfg in suit_configs:
    final_manifest.append({
        "id": cfg["id"],
        "name": cfg["name"],
        "gender": "male",
        "category": "suit",
        "image": f"/static/attires/{cfg['id']}.png"
    })

# Add male shirts
for cfg in shirt_configs:
    final_manifest.append({
        "id": cfg["id"],
        "name": cfg["name"],
        "gender": "male",
        "category": "shirt",
        "image": f"/static/attires/{cfg['id']}.png"
    })

with open(manifest_file, "w", encoding="utf-8") as f:
    json.dump(final_manifest, f, indent=2)

print(f"\nManifest successfully updated with {len(final_manifest)} total attire templates!")
