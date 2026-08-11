const fs = require('fs');
const path = require('path');
const https = require('https');

async function diagnose() {
  console.log('=== SUPABASE CONNECTION DIAGNOSIS ===\n');

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('[FAIL] .env file does not exist.');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  let url = '';
  let anonKey = '';
  let serviceKey = '';

  for (let l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') url = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') anonKey = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceKey = val;
    }
  }

  console.log('1. ENVIRONMENT VARIABLE KEYS CHECK:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL:', url ? (url.includes('placeholder') ? 'PLACEHOLDER DETECTED' : url) : 'MISSING');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? (anonKey.includes('placeholder') ? 'PLACEHOLDER DETECTED' : `SET (${anonKey.length} chars)`) : 'MISSING');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? (serviceKey.includes('placeholder') ? 'PLACEHOLDER DETECTED' : `SET (${serviceKey.length} chars)`) : 'MISSING');

  if (!url || url.includes('placeholder') || !anonKey || anonKey.includes('placeholder')) {
    console.log('\n[ROOT CAUSE IDENTIFIED]:');
    console.log('.env contains PLACEHOLDER values instead of your real remote Supabase project URL & keys.');
    console.log('Because placeholders were present, teamService.ts fell back to local demo state.');
    return;
  }

  console.log('\n2. TESTING REMOTE SUPABASE API HEALTH CHECK...');
  const healthUrl = `${url}/auth/v1/health`;
  try {
    const res = await new Promise((resolve, reject) => {
      const req = https.get(healthUrl, { headers: { apikey: anonKey } }, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => resolve({ status: response.statusCode, body: data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
    });

    console.log(`   - Auth Health Response: HTTP ${res.status}`);
    console.log(`   - Auth Response Body: ${res.body}`);
    if (res.status === 200) {
      console.log('\n[SUCCESS] Remote Supabase project is REACHABLE!');
    } else {
      console.log('\n[FAIL] Remote Supabase project returned non-200 status.');
    }
  } catch (err) {
    console.log(`   - Connection Error: ${err.message}`);
  }
}

diagnose().catch(console.error);
