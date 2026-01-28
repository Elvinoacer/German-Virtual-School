from PIL import Image, ImageDraw, ImageFont, ImageOps
import os

# Paths
BASE_IMG_PATH = "/home/elvin/.gemini/antigravity/brain/1b6b31c6-bd49-4df7-b9d1-a1d604506504/gvs_banner_v3_1769335054790.png"
QR_PATH = "/home/elvin/.gemini/antigravity/brain/1b6b31c6-bd49-4df7-b9d1-a1d604506504/uploaded_image_1769335928340.png"
OUTPUT_PATH = "/home/elvin/.gemini/antigravity/brain/1b6b31c6-bd49-4df7-b9d1-a1d604506504/final_banner_v4.png"

# Fonts
FONT_REGULAR = "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Black.ttf"

def create_final_banner():
    # Load Main Image
    base = Image.open(BASE_IMG_PATH).convert("RGBA")
    width, height = base.size
    
    # --- STEP 1: REMOVE WATERMARK (CROP & ZOOM) ---
    # Crop 25 pixels from bottom and right to remove any edge watermarks
    # crop box: (left, top, right, bottom)
    crop_pixels = 25
    base = base.crop((0, 0, width - crop_pixels, height - crop_pixels))
    # Resize back to original dimensions
    base = base.resize((width, height), Image.Resampling.LANCZOS)
    
    # --- STEP 2: PREPARE FOOTER ---
    # Footer covers bottom 12%
    footer_height = int(height * 0.12)
    footer_y = height - footer_height
    
    draw = ImageDraw.Draw(base)
    # Draw Footer Background (Opaque)
    draw.rectangle([(0, footer_y), (width, height)], fill=(30, 41, 59, 255))
    
    # --- STEP 3: ADD TEXT ---
    font_size = int(footer_height * 0.35)
    try:
        font = ImageFont.truetype(FONT_BOLD, font_size)
    except:
        font = ImageFont.load_default()
        
    email = "germanvirtualschool@gmail.com"
    phone = "0742318300"
    url = "germanvirtualschool.com"
    full_text = f"Email: {email}   |   Phone: {phone}   |   Visit: {url}"
    
    # Text Layout
    try:
        text_w = draw.textlength(full_text, font=font)
    except:
         text_w = font_size * len(full_text) * 0.5
         
    text_x = (width - text_w) / 2
    text_y = footer_y + (footer_height - font_size) / 2
    
    draw.text((text_x, text_y), full_text, font=font, fill=(255, 255, 255, 255))

    # --- STEP 4: ADD QR CODE ---
    qr = Image.open(QR_PATH).convert("RGBA")
    
    # Resize QR
    qr_size = int(height * 0.18)
    qr = qr.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    
    # Position: Bottom Right with Padding
    padding = int(width * 0.03)
    qr_x = width - qr_size - padding
    qr_y = height - qr_size - padding
    
    # White background for QR
    draw.rectangle(
        [(qr_x - 5, qr_y - 5), (qr_x + qr_size + 5, qr_y + qr_size + 5)], 
        fill=(255, 255, 255, 255)
    )
    
    base.paste(qr, (qr_x, qr_y), qr)

    # Save
    base.save(OUTPUT_PATH)
    print(f"Banner saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    create_final_banner()
