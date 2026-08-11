const fs = require('fs');
const path = require('path');

function setupEnv() {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  let url = '';
  let anonKey = '';
  let serviceKey = '';

  const lines = content.split('\n');
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim();

    if (key.includes('URL')) url = val;
    else if (key.includes('ANON') || key.includes('PUBLIC')) anonKey = val;
    else if (key.includes('SERVICE') || key.includes('SECRET') || key.includes('ROLE')) serviceKey = val;
  }

  // Fallbacks if empty
  if (!url) url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  if (!anonKey) anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  if (!serviceKey) serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  const cleanEnvContent = `# Supabase Client Environment Variables (Public)
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# Supabase Server-Only Service Role Key (SECURE - NEVER EXPOSE TO BROWSER / CLIENT)
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
`;

  fs.writeFileSync(envPath, cleanEnvContent);
  console.log('Sanitized .env structure ready!');
}

setupEnv();
