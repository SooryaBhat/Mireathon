const fs = require('fs');
const path = require('path');

function inspectAllEnvFiles() {
  const files = fs.readdirSync(process.cwd());
  const envFiles = files.filter(f => f.startsWith('.env'));
  console.log('Found env files:', envFiles);

  for (let f of envFiles) {
    const filePath = path.join(process.cwd(), f);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log(`\n--- Inspecting ${f} (${content.length} bytes, ${lines.length} lines) ---`);
    for (let l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        console.log(`Key: "${key}" | Val Length: ${val.length} | Val Preview: "${val.substring(0, 12)}..."`);
      }
    }
  }
}

inspectAllEnvFiles();
