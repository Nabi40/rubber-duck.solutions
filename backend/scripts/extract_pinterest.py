import re
import json
import os
import requests

content_file = r"C:\Users\Mahamudun Nabi\.gemini\antigravity-ide\brain\059ad68d-590f-42de-8d76-3c78e1c0dfeb\.system_generated\steps\587\content.md"

with open(content_file, "r", encoding="utf-8") as f:
    text = f.read()

# Find main pin image
urls = set(re.findall(r'https://i\.pinimg\.com/[^\s"\'<>]+\.(?:jpg|png|webp)', text))
print(f"Total i.pinimg images found: {len(urls)}")

# Sort by resolution/url quality
high_res = [u for u in urls if '/736x/' in u or '/originals/' in u or '/1200x/' in u or '/564x/' in u]
print(f"High-res images: {len(high_res)}")
for u in high_res:
    print(u)
