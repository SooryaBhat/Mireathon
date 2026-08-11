const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOptimizedFavicons() {
  const characterPath = path.join(__dirname, '../public/New_images/character.png');
  const srcAppDir = path.join(__dirname, '../src/app');
  const publicDir = path.join(__dirname, '../public');

  if (!fs.existsSync(characterPath)) {
    console.error('Character image not found at:', characterPath);
    return;
  }

  console.log('Generating optimized character favicons from:', characterPath);

  // 1. Create 32x32 & 64x64 icon.png for Next.js App Router (src/app/icon.png)
  await sharp(characterPath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(srcAppDir, 'icon.png'));
  console.log('Created src/app/icon.png (64x64 PNG)');

  // 2. Create 180x180 apple-icon.png for Next.js App Router (src/app/apple-icon.png)
  await sharp(characterPath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(srcAppDir, 'apple-icon.png'));
  console.log('Created src/app/apple-icon.png (180x180 PNG)');

  // 3. Create 32x32 favicon.ico / favicon.png for src/app/favicon.ico & public/favicon.ico
  const icoBuffer = await sharp(characterPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(srcAppDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Created src/app/favicon.ico & public/favicon.ico (32x32 PNG/ICO)');
}

generateOptimizedFavicons().catch((err) => {
  console.error('Error generating favicons:', err);
});
