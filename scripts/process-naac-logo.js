const fs = require('fs');
const path = require('path');

// Read JPEG/PNG image and turn dark/black background pixels into white (#FFFFFF)
async function processNaacLogo() {
  const inputPath = path.join(__dirname, '../public/New_images/official_logos/naac_A1.jpeg');
  const outputPath = path.join(__dirname, '../public/New_images/official_logos/naac_A1_white.png');

  if (!fs.existsSync(inputPath)) {
    console.log('Input file not found:', inputPath);
    return;
  }

  try {
    const sharp = require('sharp');
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Raw pixel manipulation: if R,G,B are all dark (< 50), replace with 255,255,255 (white)
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Dark background threshold test
      if (r < 55 && g < 55 && b < 55) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    })
      .png()
      .toFile(outputPath);

    console.log('Successfully created naac_A1_white.png with white background!');
  } catch (err) {
    console.error('Sharp processing error, using fallback strategy:', err.message);
  }
}

processNaacLogo();
