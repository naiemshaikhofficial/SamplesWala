import os
from PIL import Image

brain_dir = r'C:\Users\Naiem Shaikh\.gemini\antigravity\brain\fb94e136-96f7-4980-8d54-923118df64c9'
files = [f for f in os.listdir(brain_dir) if f.endswith('.png')]

for f in files:
    path = os.path.join(brain_dir, f)
    try:
        with Image.open(path) as img:
            print(f"{f}: {img.size[0]}x{img.size[1]} ({os.path.getsize(path)} bytes)")
    except:
        print(f"{f}: Could not open")
