const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cleanHeroImage1() {
  const imagePath = path.join(process.cwd(), 'public', 'New_images', 'hero_section1.png');
  const backupPath = path.join(process.cwd(), 'public', 'New_images', 'hero_section1_original.png');

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(imagePath, backupPath);
  }

  // Create focal darkness gradient mask over center text area (1535x1024)
  const svgOverlay = Buffer.from(`
    <svg width="1535" height="1024">
      <defs>
        <radialGradient id="centerDarkness" cx="42%" cy="48%" r="48%" fx="42%" fy="48%">
          <stop offset="0%" stop-color="#05050a" stop-opacity="0.95"/>
          <stop offset="45%" stop-color="#05050a" stop-opacity="0.88"/>
          <stop offset="80%" stop-color="#05050a" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#05050a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1535" height="1024" fill="url(#centerDarkness)" />
    </svg>
  `);

  await sharp(backupPath)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .toFile(imagePath + '.tmp');

  fs.renameSync(imagePath + '.tmp', imagePath);
  console.log('hero_section1.png successfully cleaned of embedded text!');
}

cleanHeroImage1().catch(console.error);
