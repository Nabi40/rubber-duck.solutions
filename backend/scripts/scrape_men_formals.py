import os
import io
import re
import json
import urllib.parse
import requests
from PIL import Image, ImageOps, ImageFilter
from rembg import remove

OUTPUT_DIR = r"e:\Projects\rubber-duck\rubber-duck.solutions\backend\static\attires"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# List of high-quality Pinterest / web men formal suit & shirt template image URLs
# The main pin from user: https://in.pinterest.com/pin/643803709230486279/ -> dc84411864aff83b059d4ea53822e165.jpg
PIN_URLS = [
    # Top Suits
    "https://i.pinimg.com/originals/dc/84/41/dc84411864aff83b059d4ea53822e165.jpg", # Main requested pin (Blue Suit with Grey Tie)
    "https://i.pinimg.com/originals/41/d2/88/41d288ad786e680d98ca57c6b9ef25dc.png", # Classic Black Suit Red Tie
    "https://i.pinimg.com/originals/e8/30/1e/e8301e741a45ce3fdf1095fe206037bc.png", # Navy Blue Slim Fit
    "https://i.pinimg.com/originals/3c/6a/c7/3c6ac7138aa8ee4c783db9f7b0ce20a9.png", # Charcoal Grey Corporate
    "https://i.pinimg.com/originals/36/47/9b/36479b47e5898d9cb6ae67a14e9f7ebc.png", # Royal Blue Business
    "https://i.pinimg.com/originals/34/00/cb/3400cb598dfae0e87d0ecdfd0e5138f0.png", # Dark Slate Suit
    "https://i.pinimg.com/originals/a5/d8/77/a5d8778f6828555e09f8ae587d65b1aa.png", # Classic Tuxedo Bowtie
    "https://i.pinimg.com/originals/44/2c/3e/442c3e1e24bcbbd7a46d1e44fec5bdf5.png", # Navy Blue Pinstripe
    "https://i.pinimg.com/originals/5c/5a/bd/5c5abd715a31a967fbf7c1664bbd99c7.png", # Espresso Brown Formal
    "https://i.pinimg.com/originals/82/df/8a/82df8aa074adbe021f11283e33c67fe5.png", # Dark Olive Formal
    "https://i.pinimg.com/originals/03/ce/b1/03ceb1613d5069fe5a9296dbf5938d2f.png", # Steel Grey Modern
    "https://i.pinimg.com/originals/20/86/e1/2086e10faeb2df62ba6e5be386cb6c60.png", # Deep Burgundy Formal
    "https://i.pinimg.com/originals/7a/90/e5/7a90e5db799c7595c8ba079bb48fc286.png", # Executive Black Stripe

    # Top Shirts
    "https://i.pinimg.com/originals/02/76/9a/02769ab476f0c6fa4d5677ffbb77b55f.png", # White Oxford Formal
    "https://i.pinimg.com/originals/49/a0/fc/49a0fcd54dfd60e7e17ea47c945952d7.png", # Sky Blue Formal Shirt
    "https://i.pinimg.com/originals/c9/48/4f/c9484f2c5a176882f0c793ff646e3860.png", # Classic Light Blue
    "https://i.pinimg.com/originals/9f/61/c2/9f61c28c89bdf80f4f9db246039cbbe2.png", # French Blue Spread Collar
    "https://i.pinimg.com/originals/8f/3e/2a/8f3e2a04870f209cae497ec18b871929.png", # Pastel Pink Formal Shirt
    "https://i.pinimg.com/originals/48/db/ea/48dbeae47f0d0e659b85cce77f72264c.png", # Lavender Formal Shirt
    "https://i.pinimg.com/originals/0d/16/ef/0d16ef8ee0f7fcb5a19a9307b99ad5c6.png", # Mint Green Dress Shirt
    "https://i.pinimg.com/originals/59/1b/95/591b95b8cbca5fc5e37827878345fc53.png", # Light Grey Poplin
    "https://i.pinimg.com/originals/11/aa/ef/11aaef05b4b1a457d54972803b9ad6ee.png", # Charcoal Grey Formal Shirt
    "https://i.pinimg.com/originals/0e/f2/87/0ef287e0766a6a2414a34f9a0c71a3e8.png", # Navy Blue Button-Down
    "https://i.pinimg.com/originals/cb/80/7e/cb807eed6eef5ee918a38ec291244f77.png", # Beige / Cream Formal Shirt
    "https://i.pinimg.com/originals/08/94/a3/0894a37f59d57a4192b028da35ad0332.png", # Fine Blue Striped Shirt
    "https://i.pinimg.com/originals/47/3e/b3/473eb3bcbb6c48325dcfa1ef6891eb81.png", # Classic White Textured
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.pinterest.com/"
}

def remove_white_or_solid_bg(img: Image.Image) -> Image.Image:
    """Removes white or near-white/solid background cleanly from collar & shoulders."""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    
    # Sample corner pixels to check background color
    corners = [data[0], data[img.width-1], data[(img.height-1)*img.width], data[-1]]
    avg_bg_r = sum(c[0] for c in corners) // 4
    avg_bg_g = sum(c[1] for c in corners) // 4
    avg_bg_b = sum(c[2] for c in corners) // 4
    
    is_white_bg = (avg_bg_r > 240 and avg_bg_g > 240 and avg_bg_b > 240)
    
    if is_white_bg:
        for item in data:
            # If close to white, make transparent
            if item[0] > 238 and item[1] > 238 and item[2] > 238:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        return img
    else:
        # Use rembg for non-white/complex backgrounds
        try:
            return remove(img)
        except Exception:
            return img

def process_and_save_attire(src_url, out_path, target_width=800, target_height=1000):
    try:
        res = requests.get(src_url, headers=headers, timeout=10)
        if res.status_code != 200:
            print(f"Failed to fetch {src_url} (HTTP {res.status_code})")
            return False
        
        raw_img = Image.open(io.BytesIO(res.content)).convert("RGBA")
        
        # Remove background cleanly
        clean_img = remove_white_or_solid_bg(raw_img)
        
        # Auto crop to non-transparent bounding box
        bbox = clean_img.getbbox()
        if bbox:
            clean_img = clean_img.crop(bbox)
            
        # Fit into standard aspect ratio canvas with padding at bottom
        canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
        
        # Scale to fill width ~92%
        scale = (target_width * 0.94) / clean_img.width
        new_w = int(clean_img.width * scale)
        new_h = int(clean_img.height * scale)
        scaled_img = clean_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Position at bottom center
        pos_x = (target_width - new_w) // 2
        pos_y = target_height - new_h
        canvas.paste(scaled_img, (pos_x, max(0, pos_y)), scaled_img)
        
        canvas.save(out_path, "PNG", optimize=True)
        print(f"Successfully processed and saved: {os.path.basename(out_path)}")
        return True
    except Exception as e:
        print(f"Error processing {src_url}: {e}")
        return False

# Execute scraping and processing
suit_names = [
    "Navy Blue Modern Suit (Pinterest)",
    "Classic Black Suit & Red Tie",
    "Midnight Navy Slim Fit",
    "Charcoal Grey Executive",
    "Royal Blue Professional",
    "Dark Slate Business Suit",
    "Classic Tuxedo & Bowtie",
    "Navy Blue Pinstripe Suit",
    "Espresso Brown Formal",
    "Dark Olive Formal Suit",
    "Steel Grey Modern Fit",
    "Deep Burgundy Formal",
    "Executive Black Pinstripe"
]

shirt_names = [
    "Crisp White Oxford Shirt",
    "Sky Blue Formal Shirt",
    "Classic Light Blue Dress Shirt",
    "French Blue Spread Collar",
    "Pastel Pink Formal Shirt",
    "Lavender Dress Shirt",
    "Mint Green Formal Shirt",
    "Light Grey Poplin Shirt",
    "Charcoal Grey Dress Shirt",
    "Navy Blue Button-Down",
    "Beige Cream Formal Shirt",
    "Fine Blue Striped Shirt",
    "Classic White Textured Shirt"
]

print("Processing Men Suits...")
for i, name in enumerate(suit_names, 1):
    out_id = f"ms_{i:02d}"
    out_file = os.path.join(OUTPUT_DIR, f"{out_id}.png")
    url = PIN_URLS[i-1] if i-1 < len(PIN_URLS) else PIN_URLS[0]
    process_and_save_attire(url, out_file)

print("\nProcessing Men Shirts...")
for i, name in enumerate(shirt_names, 1):
    out_id = f"mh_{i:02d}"
    out_file = os.path.join(OUTPUT_DIR, f"{out_id}.png")
    url_idx = 13 + (i-1)
    url = PIN_URLS[url_idx] if url_idx < len(PIN_URLS) else PIN_URLS[13]
    process_and_save_attire(url, out_file)

print("\nUpdating manifest.json...")
# Load existing manifest to preserve female attires
manifest_file = os.path.join(OUTPUT_DIR, "manifest.json")
try:
    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)
except Exception:
    manifest = []

# Update male items with names
updated_manifest = []
# Keep female items
for item in manifest:
    if item.get("gender") == "female":
        updated_manifest.append(item)

# Add male suits
for i, name in enumerate(suit_names, 1):
    out_id = f"ms_{i:02d}"
    updated_manifest.append({
        "id": out_id,
        "name": name,
        "gender": "male",
        "category": "suit",
        "image": f"/static/attires/{out_id}.png"
    })

# Add male shirts
for i, name in enumerate(shirt_names, 1):
    out_id = f"mh_{i:02d}"
    updated_manifest.append({
        "id": out_id,
        "name": name,
        "gender": "male",
        "category": "shirt",
        "image": f"/static/attires/{out_id}.png"
    })

with open(manifest_file, "w", encoding="utf-8") as f:
    json.dump(updated_manifest, f, indent=2)

print(f"Manifest updated with {len(updated_manifest)} total attire items!")
