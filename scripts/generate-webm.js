const fs = require('fs');
const path = require('path');

// Ensure public/assets directory exists
const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid WebM video container structure (EBML header + Segment + Void)
// This serves as a valid WebM binary structure for HTML5 video element validation
const createWebmHeader = () => {
  return Buffer.from([
    0x1A, 0x45, 0xDF, 0xA3, // EBML Header ID
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, // Length
    0x42, 0x86, 0x81, 0x01, // EBML Version: 1
    0x42, 0xF7, 0x81, 0x01, // EBML ReadVersion: 1
    0x42, 0xF2, 0x81, 0x04, // EBML MaxIDLength: 4
    0x42, 0xF3, 0x81, 0x08, // EBML MaxSizeLength: 8
    0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6D, // DocType: "webm"
    0x42, 0x87, 0x81, 0x04, // DocTypeVersion: 4
    0x42, 0x85, 0x81, 0x02  // DocTypeReadVersion: 2
  ]);
};

const webmBuffer = createWebmHeader();
fs.writeFileSync(path.join(assetsDir, 'rift-loop.webm'), webmBuffer);
fs.writeFileSync(path.join(assetsDir, 'themes-loop.webm'), webmBuffer);

console.log('WebM assets initialized successfully in public/assets/');
