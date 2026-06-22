const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/buckflo_favicon.svg');

// Output paths
const statIconPath = path.join(__dirname, '../android/app/src/main/res/drawable/ic_stat_icon.xml');
const launcherBgPath = path.join(__dirname, '../android/app/src/main/res/drawable/ic_launcher_background.xml');
const launcherFgPath = path.join(__dirname, '../android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml');

try {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Find all rect tags
  const rectRegex = /<rect\s+([^>]+)\s*\/>/g;
  let match;
  const statPaths = [];
  const fgPaths = [];

  while ((match = rectRegex.exec(svgContent)) !== null) {
    const attrsStr = match[1];
    const attrs = {};
    
    // Parse attributes
    const attrRegex = /(\S+)\s*=\s*"([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    
    const x = parseFloat(attrs.x || 0);
    const y = parseFloat(attrs.y || 0);
    const w = parseFloat(attrs.width || 0);
    const h = parseFloat(attrs.height || 0);
    const rx = parseFloat(attrs.rx || 0);
    const opacity = attrs['fill-opacity'] ? parseFloat(attrs['fill-opacity']) : 1.0;
    
    let pathData;
    if (rx > 0) {
      pathData = `M ${x + rx},${y} h ${w - 2*rx} a ${rx},${rx} 0 0 1 ${rx},${rx} v ${h - 2*rx} a ${rx},${rx} 0 0 1 -${rx},${rx} h -${w - 2*rx} a ${rx},${rx} 0 0 1 -${rx},-${rx} v -${h - 2*rx} a ${rx},${rx} 0 0 1 ${rx},-${rx} Z`;
    } else {
      pathData = `M ${x},${y} h ${w} v ${h} h -${w} Z`;
    }
    
    const fillAlphaAttr = opacity < 1.0 ? ` android:fillAlpha="${opacity}"` : '';
    
    // For notification stats icon (needs to be solid white)
    statPaths.push(`    <path
        android:fillColor="#FFFFFF"${fillAlphaAttr}
        android:pathData="${pathData}" />`);
        
    // For adaptive launcher icon foreground (uses brand color #d97757)
    fgPaths.push(`    <path
        android:fillColor="#d97757"${fillAlphaAttr}
        android:pathData="${pathData}" />`);
  }

  // 1. Generate ic_stat_icon.xml
  const statXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="512"
    android:viewportHeight="512">
${statPaths.join('\n')}
</vector>
`;
  fs.writeFileSync(statIconPath, statXmlContent, 'utf8');
  console.log('Generated:', statIconPath);

  // 2. Generate ic_launcher_foreground.xml (scaled and centered inside 108dp x 108dp viewport for adaptive icon support)
  const fgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:scaleX="0.13"
        android:scaleY="0.13"
        android:translateX="20.72"
        android:translateY="20.72">
${fgPaths.join('\n')}
    </group>
</vector>
`;
  
  // Make sure drawable-v24 directory exists
  const v24Dir = path.dirname(launcherFgPath);
  if (!fs.existsSync(v24Dir)) {
    fs.mkdirSync(v24Dir, { recursive: true });
  }
  fs.writeFileSync(launcherFgPath, fgXmlContent, 'utf8');
  console.log('Generated:', launcherFgPath);

  // 3. Generate ic_launcher_background.xml (solid brand background color #eeeae4)
  const bgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#eeeae4"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
  fs.writeFileSync(launcherBgPath, bgXmlContent, 'utf8');
  console.log('Generated:', launcherBgPath);

} catch (e) {
  console.error('Failed to convert icons:', e);
}
