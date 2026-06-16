import math
import random
import os

W_CELLS = 24
H_CELLS = 24
CELL_SIZE = 1 # We'll scale up in viewport
PADDING = 0.1

BASE_COLOR = "#d97757" # Dark Orange
MID_COLOR = "#FF7043"  # Vibrant Orange
CORE_COLOR = "#FFD54F" # Yellow

def flame_cell(x, y):
    cx = W_CELLS / 2
    
    # Flame gets narrower towards the top (y=0 is top)
    # Tapering width
    max_width = ((y + 2) / H_CELLS) * 10 
    
    # Wavy flame effect
    wave = math.sin(y * 0.4) * 2 * (1 - y/H_CELLS) # More wave at top
    
    dx = abs(x - (cx + wave))
    
    if dx < max_width:
        # Base intensity
        intensity = 1.0 - (dx / max_width)
        # Fade towards the top
        intensity *= (y / H_CELLS) ** 0.5
        
        # Add generative noise
        intensity += random.uniform(-0.15, 0.15)
        
        # Random spark dropouts
        if random.random() < 0.1:
            intensity *= 0.2
            
        if intensity > 0.1:
            intensity = min(1.0, max(0.0, intensity))
            
            # Choose color based on intensity and position
            if intensity > 0.7 and y > H_CELLS * 0.4 and dx < 2:
                color = CORE_COLOR
            elif intensity > 0.4:
                color = MID_COLOR
            else:
                color = BASE_COLOR
                
            return intensity, color
            
    # Floating sparks
    if random.random() < 0.02 and y < H_CELLS * 0.8:
        return random.uniform(0.2, 0.6), CORE_COLOR if random.random() < 0.3 else MID_COLOR
        
    return None

def generate_android_vector(filename, is_active):
    xml = [f'<vector xmlns:android="http://schemas.android.com/apk/res/android"']
    xml.append(f'    android:width="24dp"')
    xml.append(f'    android:height="24dp"')
    xml.append(f'    android:viewportWidth="{W_CELLS}"')
    xml.append(f'    android:viewportHeight="{H_CELLS}">')
    
    # We group by color to minimize <path> tags
    paths = {BASE_COLOR: "", MID_COLOR: "", CORE_COLOR: ""}
    
    random.seed(42) # Consistent seed for the shape
    
    for y in range(H_CELLS):
        for x in range(W_CELLS):
            cell_data = flame_cell(x, y)
            if cell_data:
                a, color = cell_data
                if not is_active:
                    # Mute colors for inactive
                    if color == CORE_COLOR: color = "#555555"
                    elif color == MID_COLOR: color = "#3D3D3D"
                    else: color = "#2A2A2A"
                else:
                    # Multiply opacity to color (Android doesn't easily support per-rect alpha in a single path)
                    # We'll just group by the solid color and let the density of dots simulate the fade,
                    # OR we can just use the base colors if 'a' > threshold.
                    pass 
                
                # We are appending squares
                size = 1.0 - (PADDING * 2)
                cx_start = x + PADDING
                cy_start = y + PADDING
                # Android path: M x,y h width v height h -width Z
                path = f"M {cx_start:.2f},{cy_start:.2f} h {size:.2f} v {size:.2f} h {-size:.2f} Z "
                
                # Make sure the key exists
                if color not in paths:
                    paths[color] = ""
                paths[color] += path

    for color, pathData in paths.items():
        if pathData.strip() != "":
            xml.append(f'    <path android:fillColor="{color}" android:pathData="{pathData}" />')

    xml.append('</vector>')
    
    with open(filename, "w") as f:
        f.write("\n".join(xml))

generate_android_vector("/Volumes/Mac T7/Projects/pocket_ledger/android/app/src/main/res/drawable/ic_pixel_flame_active.xml", True)
generate_android_vector("/Volumes/Mac T7/Projects/pocket_ledger/android/app/src/main/res/drawable/ic_pixel_flame_inactive.xml", False)

print("Modern generative flame vectors created!")
