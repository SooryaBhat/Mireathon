const fs = require('fs');
const path = require('path');

function findCredentials() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('No .env found');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  console.log('Env lines count:', lines.length);
  for (let l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      console.log(`Key: ${key} | Value Length: ${val.length} | Is Placeholder: ${val.includes('placeholder')}`);
    }
  }
}

findCredentials();
