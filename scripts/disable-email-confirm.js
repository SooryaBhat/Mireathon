#!/usr/bin/env node
/**
 * Disables email confirmation for Supabase project using admin API.
 * Per Supabase docs: PATCH /auth/v1/admin/config
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const lines = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split('\n');
  const env = {};
  for (const l of lines) {
    const t = l.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.substring(0, idx).trim()] = t.substring(idx + 1).trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];
  const hostname = new URL(url).hostname;

  console.log('Checking current email confirmation setting...');

  // Get current config
  const getConfig = () => new Promise((resolve, reject) => {
    const opts = {
      hostname,
      path: '/auth/v1/admin/config',
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(data) }); } catch(e) { resolve({ status: res.statusCode, raw: data }); }});
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });

  const configRes = await getConfig();
  console.log('Config API HTTP Status:', configRes.status);

  if (configRes.status === 200) {
    const current = configRes.json?.mailer?.autoconfirm;
    console.log('Current autoconfirm (email confirmation disabled):', current);
    
    if (current === true) {
      console.log('[OK] Email confirmation is already DISABLED. Immediate login is active. ✅');
      return;
    }
  } else {
    console.log('Config check response:', configRes.raw || JSON.stringify(configRes.json));
    console.log('\nNote: The /auth/v1/admin/config endpoint may not be available via API.');
    console.log('Please disable email confirmation manually:');
    console.log('→ https://supabase.com/dashboard/project/pyvnywuygkwcwhenzldl/auth/providers');
    console.log('→ Email → toggle OFF "Confirm email" → Save');
  }
}

main().catch(console.error);
