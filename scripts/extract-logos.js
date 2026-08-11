#!/usr/bin/env node
/**
 * Precise logo extraction from 1236x1600 Poster.jpeg (v3 - corrected boundaries)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const posterPath = path.join(process.cwd(), 'public', 'New_images', 'Poster.jpeg');
const outDir = path.join(process.cwd(), 'public', 'New_images', 'official_logos');
fs.mkdirSync(outDir, { recursive: true });

async function cropAndSave(name, left, top, width, height, description) {
  const outPath = path.join(outDir, `${name}.png`);
  const meta = await sharp(posterPath).metadata();
  const safeWidth = Math.min(width, meta.width - left);
  const safeHeight = Math.min(height, meta.height - top);
  await sharp(posterPath)
    .extract({ left: Math.max(0, left), top: Math.max(0, top), width: safeWidth, height: safeHeight })
    .png()
    .toFile(outPath);
  console.log(`Saved: ${name}.png (${left},${top}) ${safeWidth}x${safeHeight} — ${description}`);
}

async function main() {
  const meta = await sharp(posterPath).metadata();
  console.log(`Poster dimensions: ${meta.width} x ${meta.height}\n`);

  // Poster is 1236 x 1600
  // The header area runs approximately from y=0 to y=215
  //
  // TOP ROW (y=0 to y=135):
  // - Srinivas Institute of Technology: spans almost half the width, x=0 to ~440
  // - Small circular logos to the right: from x=280 onwards
  // Let's check: Looking at the poster image, the logos appear at:
  // Srinivas block (blue+white): x=0 to ~430
  // IEEE SIT circle: x=288 to ~430
  // AISE circle: x=432 to ~580
  // Dept circle: x=578 to ~726
  // AADE logo: x=722 to ~850
  // NAAC gold badge: x=850 to ~970
  // Innovation Council: x=968 to 1236

  // Srinivas Institute full logo (left block)
  await cropAndSave('srinivas_institute', 0, 0, 430, 140, 'Srinivas Institute of Technology');

  // IEEE SIT Student Branch (first small circle)
  await cropAndSave('ieee_sit', 284, 2, 145, 135, 'IEEE SIT Student Branch');

  // AISE (second small circle)
  await cropAndSave('aise', 428, 2, 148, 135, 'AISE');

  // Department logo / CS circle (third small circle)
  await cropAndSave('dept_logo', 574, 2, 148, 135, 'Department Logo');

  // AADE (fourth logo)
  await cropAndSave('aade_logo', 720, 2, 133, 135, 'AADE');

  // NAAC A (fifth - gold badge)
  await cropAndSave('naac_logo', 848, 2, 120, 135, 'NAAC A');

  // Institution Innovation Council (far right)
  await cropAndSave('innovation_council', 960, 2, 276, 135, "Institution's Innovation Council");

  // Full header row for reference
  await cropAndSave('full_top_row', 0, 0, 1236, 140, 'Full top row');

  // IEEE Bangalore Section (second row, left)
  await cropAndSave('ieee_bangalore', 0, 140, 260, 80, 'IEEE Bangalore Section');

  // IEEE Mangalore Subsection (second row, right)
  await cropAndSave('ieee_mangalore', 768, 140, 468, 80, 'IEEE Mangalore Subsection');

  console.log('\nAll logos extracted successfully!');
}

main().catch(console.error);
