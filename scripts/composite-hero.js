#!/usr/bin/env node
/**
 * Miraethon 2026 — Hero Image Compositor
 * 
 * Composites the 4 official logos + institutional text
 * onto the generated 3D hero background to create one final
 * standalone hero image with everything baked in.
 * 
 * Uses sharp for image compositing (logos).
 * Text is rendered as SVG overlays.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcImage = path.join(
  'C:\\Users\\soory\\.gemini\\antigravity-ide\\brain\\d1b71089-7e13-4ec9-9a59-0902f47d0911',
  'hero_3d_v3_1786450597103.png'
);
const logoDir = path.join(process.cwd(), 'public', 'New_images', 'official_logos');
const outPath = path.join(process.cwd(), 'public', 'New_images', 'hero_with_branding.png');

async function main() {
  console.log('Loading base hero image...');
  const base = sharp(srcImage);
  const meta = await base.metadata();
  const W = meta.width;
  const H = meta.height;
  console.log(`Base dimensions: ${W} x ${H}`);

  // ── 1. Resize logos to appropriate display sizes ──
  // Target logo heights in pixels (for display at banner top)
  const LOGO_HEIGHT = Math.round(H * 0.065); // ~6.5% of image height
  console.log(`Target logo height: ${LOGO_HEIGHT}px`);

  const logoConfigs = [
    { file: 'Srinivas.jpg', label: 'Srinivas Group', aspectRatio: 1.0 },
    { file: 'ieee-logo.webp', label: 'IEEE', aspectRatio: 2.55 },
    { file: 'AADE1.jpeg', label: 'AADE', aspectRatio: 1.0 },
    { file: 'naac_A.jpg', label: 'NAAC A+', aspectRatio: 1.0 },
  ];

  const resizedLogos = [];
  for (const cfg of logoConfigs) {
    const logoPath = path.join(logoDir, cfg.file);
    const logoMeta = await sharp(logoPath).metadata();
    const aspectRatio = logoMeta.width / logoMeta.height;
    const newHeight = LOGO_HEIGHT;
    const newWidth = Math.round(newHeight * aspectRatio);
    
    const resized = await sharp(logoPath)
      .resize(newWidth, newHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    resizedLogos.push({ buffer: resized, width: newWidth, height: newHeight, label: cfg.label });
    console.log(`Resized ${cfg.file}: ${newWidth}x${newHeight}`);
  }

  // ── 2. Calculate logo positions (centered horizontally in top band) ──
  const GAP = Math.round(W * 0.025); // 2.5% gap between logos
  const DIVIDER_W = 1;
  const totalLogoWidth = resizedLogos.reduce((s, l) => s + l.width, 0);
  const totalDividers = (resizedLogos.length - 1) * GAP;
  const totalWidth = totalLogoWidth + totalDividers;
  
  const TOP_BAND_H = Math.round(H * 0.175); // Top 17.5% for branding
  const TEXT_Y_COLLEGE = Math.round(H * 0.028); // College name y from top
  const TEXT_Y_DEPT = Math.round(H * 0.058);    // Dept name y from top
  const LOGO_Y = Math.round(H * 0.11);          // Logo center y from top
  
  let startX = Math.round((W - totalWidth) / 2);


  // ── 3. Build SVG text overlays (college name, dept, hackathon title) ──
  // Text is rendered as SVG then composited

  // Top band dark gradient overlay SVG
  const topGradientSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TOP_BAND_H}">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(3,3,10,0.80)"/>
      <stop offset="70%" stop-color="rgba(3,3,10,0.45)"/>
      <stop offset="100%" stop-color="rgba(3,3,10,0.00)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${TOP_BAND_H}" fill="url(#grad)"/>
</svg>`;

  // College name text (top of band)
  const TEXT_Y_COLLEGE = Math.round(TOP_BAND_H * 0.22);
  const TEXT_Y_DEPT = Math.round(TOP_BAND_H * 0.42);
  const COLLEGE_FONT_SIZE = Math.round(H * 0.028);
  const DEPT_FONT_SIZE = Math.round(H * 0.019);

  const textSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TOP_BAND_H}">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="rgba(0,0,0,1)" flood-opacity="1"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="rgba(0,0,0,0.9)" flood-opacity="1"/>
    </filter>
    <filter id="glowcyan">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="rgba(34,211,238,0.55)" flood-opacity="1"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,1)" flood-opacity="1"/>
    </filter>
  </defs>
  
  <!-- College Name -->
  <text
    x="${W / 2}"
    y="${TEXT_Y_COLLEGE}"
    text-anchor="middle"
    dominant-baseline="hanging"
    font-family="'Arial Black', 'Impact', sans-serif"
    font-size="${COLLEGE_FONT_SIZE}"
    font-weight="900"
    fill="white"
    letter-spacing="${Math.round(COLLEGE_FONT_SIZE * 0.18)}"
    filter="url(#shadow)"
  >SRINIVAS INSTITUTE OF TECHNOLOGY</text>

  <!-- Department Name -->
  <text
    x="${W / 2}"
    y="${TEXT_Y_DEPT}"
    text-anchor="middle"
    dominant-baseline="hanging"
    font-family="'Arial', 'Helvetica', sans-serif"
    font-size="${DEPT_FONT_SIZE}"
    font-weight="700"
    fill="rgb(103,232,249)"
    letter-spacing="${Math.round(DEPT_FONT_SIZE * 0.10)}"
    filter="url(#glowcyan)"
  >DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE</text>
</svg>`;

  // ── 4. Build composite layers ──
  const compositeInputs = [];

  // Layer 1: Dark gradient top band
  compositeInputs.push({
    input: Buffer.from(topGradientSVG),
    top: 0,
    left: 0,
    blend: 'over',
  });

  // Layer 2: Text (college + dept name)
  compositeInputs.push({
    input: Buffer.from(textSVG),
    top: 0,
    left: 0,
    blend: 'over',
  });

  // Layer 3: Each logo
  let currentX = startX;
  for (const logo of resizedLogos) {
    const logoTop = LOGO_Y;
    compositeInputs.push({
      input: logo.buffer,
      top: Math.round(logoTop - logo.height / 2),
      left: currentX,
      blend: 'over',
    });
    currentX += logo.width + GAP;
  }

  // ── 5. Composite everything onto the 3D base ──
  console.log('\nCompositing all layers...');
  await sharp(srcImage)
    .composite(compositeInputs)
    .png({ compressionLevel: 8 })
    .toFile(outPath);

  const stat = fs.statSync(outPath);
  console.log(`\n✅ Hero image with branding saved!`);
  console.log(`   Path: ${outPath}`);
  console.log(`   Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Dimensions: ${W} x ${H}`);
}

main().catch(console.error);
