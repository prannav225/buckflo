import math
from PIL import Image

def generate():
    img = Image.open('public/buckflo_appicon.png').convert('RGB')
    bg_color = (238, 234, 228)
    fg_color = (217, 119, 87)
    
    # Calculate max distance (approx)
    max_dist = math.sqrt(sum((b - f)**2 for b, f in zip(bg_color, fg_color)))
    
    out = Image.new('RGBA', img.size)
    pixels = out.load()
    in_pixels = img.load()
    
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b = in_pixels[x, y]
            dist = math.sqrt((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)
            
            # alpha is proportional to distance from background
            alpha = int(min(255, max(0, (dist / max_dist) * 255)))
            
            # We want a pure white icon
            pixels[x, y] = (255, 255, 255, alpha)

    # The original is 2000x2000. Let's resize it to reasonable Android sizes.
    # The icon itself should have some padding. The standard is 24x24 dp.
    # Android sizes for mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
    sizes = {
        'mdpi': 24,
        'hdpi': 36,
        'xhdpi': 48,
        'xxhdpi': 72,
        'xxxhdpi': 96
    }
    import os
    for name, size in sizes.items():
        resized = out.resize((size, size), Image.Resampling.LANCZOS)
        dir_path = f'android/app/src/main/res/drawable-{name}'
        os.makedirs(dir_path, exist_ok=True)
        # remove any existing xml
        xml_path = os.path.join(dir_path, 'ic_stat_icon.xml')
        if os.path.exists(xml_path):
            os.remove(xml_path)
            
        resized.save(os.path.join(dir_path, 'ic_stat_icon.png'))
        
    # Also save one in default drawable
    dir_path = 'android/app/src/main/res/drawable'
    os.makedirs(dir_path, exist_ok=True)
    xml_path = os.path.join(dir_path, 'ic_stat_icon.xml')
    if os.path.exists(xml_path):
        os.remove(xml_path)
    out.resize((24, 24), Image.Resampling.LANCZOS).save(os.path.join(dir_path, 'ic_stat_icon.png'))
    print("Icons generated successfully.")

generate()
