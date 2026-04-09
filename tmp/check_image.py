from PIL import Image
import os

try:
    img = Image.open('public/Logo.png')
    print(f"Format: {img.format}")
    print(f"Size: {img.size}")
    print(f"Mode: {img.mode}")
except Exception as e:
    print(f"Error: {e}")
