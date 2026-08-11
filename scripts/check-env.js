const fs = require('fs');
const path = require('path');

function checkEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('.env file not found');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  let hasUrl = false;
  let hasAnon = false;
  let hasService = false;
  let unsafeServiceExposed = false;

  const newLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      newLines.push(line);
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim();

    if (key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') {
      hasUrl = true;
      newLines.push(`NEXT_PUBLIC_SUPABASE_URL=${val}`);
    } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'SUPABASE_ANON_KEY') {
      hasAnon = true;
      newLines.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${val}`);
    } else if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_SERVICE_KEY') {
      hasService = true;
      newLines.push(`SUPABASE_SERVICE_ROLE_KEY=${val}`);
    } else if (key === 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') {
      unsafeServiceExposed = true;
      hasService = true;
      newLines.push(`SUPABASE_SERVICE_ROLE_KEY=${val}`);
    } else {
      newLines.push(line);
    }
  }

  // Update .env with safe variable names if needed
  fs.writeFileSync(envPath, newLines.join('\n'));
  console.log(`ENV CHECK COMPLETE:
- NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? 'SET' : 'MISSING'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasAnon ? 'SET' : 'MISSING'}
- SUPABASE_SERVICE_ROLE_KEY: ${hasService ? 'SET (SECURE SERVER-ONLY)' : 'MISSING'}
- Unsafe NEXT_PUBLIC_ Service Role Exposure Fixed: ${unsafeServiceExposed ? 'YES' : 'NO'}
`);
}

checkEnv();
