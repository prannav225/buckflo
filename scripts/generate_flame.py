def generate_flame_xml(is_active=True):
    # 16x16 grid
    # Colors
    c_bg = "#BF360C" if is_active else "#2A2A2A"  # Dark outer
    c_md = "#FF7043" if is_active else "#3D3D3D"  # Mid orange
    c_in = "#FFD54F" if is_active else "#555555"  # Inner yellow
    c_cr = "#FFFFFF" if is_active else "#7A7A7A"  # Core white

    # Define a better 16x16 flame shape
    # 0 = empty, 1 = bg, 2 = md, 3 = in, 4 = cr
    grid = [
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,3,2,1,0,0,0,0,0,0],
        [0,0,0,0,1,2,3,3,2,1,0,0,1,0,0,0],
        [0,0,0,1,2,3,4,3,2,2,1,1,2,1,0,0],
        [0,0,1,2,2,3,4,4,3,2,2,2,2,1,0,0],
        [0,1,2,2,3,3,4,4,4,3,2,2,2,1,0,0],
        [0,1,2,3,4,3,4,4,4,3,3,2,2,1,0,0],
        [1,2,3,4,4,4,4,4,3,3,3,2,1,0,0,0],
        [1,2,3,4,4,4,4,4,4,3,2,2,1,0,0,0],
        [1,2,2,3,4,4,4,4,3,3,2,1,0,0,0,0],
        [0,1,2,2,3,3,3,3,3,2,2,1,0,0,0,0],
        [0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]

    paths = {1: "", 2: "", 3: "", 4: ""}
    for y in range(16):
        for x in range(16):
            val = grid[y][x]
            if val > 0:
                paths[val] += f"M {x},{y} h1 v1 h-1 Z "

    xml = f'''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="16"
    android:viewportHeight="16">
    <path android:fillColor="{c_bg}" android:pathData="{paths[1]}" />
    <path android:fillColor="{c_md}" android:pathData="{paths[2]}" />
    <path android:fillColor="{c_in}" android:pathData="{paths[3]}" />
    <path android:fillColor="{c_cr}" android:pathData="{paths[4]}" />
</vector>'''
    return xml

with open("/Volumes/Mac T7/Projects/pocket_ledger/android/app/src/main/res/drawable/ic_pixel_flame_active.xml", "w") as f:
    f.write(generate_flame_xml(True))

with open("/Volumes/Mac T7/Projects/pocket_ledger/android/app/src/main/res/drawable/ic_pixel_flame_inactive.xml", "w") as f:
    f.write(generate_flame_xml(False))

print("Generated new flame vectors!")
