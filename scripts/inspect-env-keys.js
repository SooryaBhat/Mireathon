const fs = require('fs');
const path = require('path');

function inspectEnvKeys() {
  const envFiles = ['.env', '.env.local', '.env.development'];
  for (let f of envFiles) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      console.log(`--- File: ${f} ---`);
      for (let l of lines) {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const key = trimmed.split('=')[0].trim();
          console.log(`Key: ${key}`);
        }
      }
    }
  }
}

inspectEnvKeys();
