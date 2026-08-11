const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cleanHeroImage() {
  const imagePath = path.join(process.cwd(), 'public', 'New_images', 'hero_section.png');
  const backupPath = path.join(process.cwd(), 'public', 'New_images', 'hero_section_original.png');

  // Create backup if not exists
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(imagePath, backupPath);
  }

  // Create SVG mask overlay for the center text area (x: 100..1000, y: 250..750)
  const svgOverlay = Buffer.from(`
    <svg width="1536" height="1024">
      <defs>
        <radialGradient id="centerDarkness" cx="35%" cy="50%" r="45%" fx="35%" fy="50%">
          <stop offset="0%" stop-color="#05050a" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#05050a" stop-opacity="0.85"/>
          <stop offset="85%" stop-color="#05050a" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#05050a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1536" height="1024" fill="url(#centerDarkness)" />
    </svg>
  `);

  await sharp(backupPath)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .toFile(imagePath + '.tmp');

  fs.renameSync(imagePath + '.tmp', imagePath);
  console.log('Hero image successfully cleaned of embedded text!');
}

cleanHeroImage().catch(console.error);
