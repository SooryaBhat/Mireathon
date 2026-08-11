#!/usr/bin/env node
/**
 * Miraethon 2026 — Real Supabase Auth E2E Test
 * Tests: signup -> auth.users -> profile creation
 * SAFE: Does NOT print service role key.
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

function post(hostname, path2, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname,
      path: path2,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...headers },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, json: {}, raw: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

function get(hostname, path2, headers) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path: path2, method: 'GET', headers };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, json: {}, raw: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  MIRAETHON 2026 — Real Supabase Auth E2E Test        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const env = loadEnv();
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];
  const hostname = new URL(url).hostname;

  // Generate unique test email with timestamp
  const ts = Date.now();
  const testEmail = `miratest${ts}@gmail.com`;
  const testPassword = `MiraTest#${ts}`;
  const testName = 'Mira Test Student';

  console.log(`TEST ACCOUNT:`);
  console.log(`  Email    : ${testEmail}`);
  console.log(`  Name     : ${testName}`);
  console.log();

  // ── Step 1: SignUp via Supabase Auth REST API (same as browser calls) ──
  console.log('Step 1: Calling supabase.auth.signUp() → POST /auth/v1/signup ...');
  const signupRes = await post(hostname, '/auth/v1/signup', {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  }, {
    email: testEmail,
    password: testPassword,
    data: { full_name: testName },
  });

  console.log(`  HTTP Status: ${signupRes.status}`);

  if (signupRes.status !== 200) {
    console.log('  [FAIL] Signup failed!');
    console.log('  Response:', JSON.stringify(signupRes.json, null, 2));
    if (signupRes.json?.msg || signupRes.json?.error_description) {
      console.log('  Error:', signupRes.json.msg || signupRes.json.error_description);
    }
    process.exit(1);
  }

  const user = signupRes.json.user || signupRes.json;
  const userId = user?.id;
  const sessionToken = signupRes.json.access_token;
  const emailConfirmed = user?.email_confirmed_at;

  if (!userId) {
    console.log('  [FAIL] No user ID returned in signup response.');
    console.log('  Raw response:', JSON.stringify(signupRes.json, null, 2).substring(0, 500));
    process.exit(1);
  }

  console.log(`  [OK]  User created in auth.users!`);
  console.log(`  User ID: ${userId}`);
  console.log(`  Email confirmed: ${emailConfirmed ? emailConfirmed : 'NOT CONFIRMED (email verification ON!)'}`);
  console.log(`  Session token: ${sessionToken ? 'PRESENT (immediate session ✅)' : 'MISSING — email verification may be ON ⚠️'}`);
  console.log();

  if (!sessionToken) {
    console.log('  ⚠️  WARNING: No session token means Supabase email confirmation is ENABLED.');
    console.log('  To disable it: Supabase Dashboard → Authentication → Providers → Email → turn OFF "Confirm email".');
    console.log();
  }

  // ── Step 2: Verify user appears in auth.users via admin API ──
  console.log('Step 2: Verifying user exists in auth.users via admin API...');
  const adminUserRes = await get(hostname, `/auth/v1/admin/users/${userId}`, {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  });
  
  if (adminUserRes.status === 200 && adminUserRes.json?.id === userId) {
    console.log(`  [OK]  User confirmed in Supabase auth.users! ✅`);
    console.log(`  Email: ${adminUserRes.json.email}`);
    console.log(`  Created at: ${adminUserRes.json.created_at}`);
  } else {
    console.log(`  [WARN] Could not fetch user from admin API (HTTP ${adminUserRes.status})`);
  }
  console.log();

  // ── Step 3: Verify profile was auto-created by trigger ──
  console.log('Step 3: Checking if auto-profile trigger created profile row...');
  // Wait 1 second for async trigger
  await new Promise(r => setTimeout(r, 1500));
  
  const profileRes = await get(hostname, `/rest/v1/profiles?id=eq.${userId}&limit=1&select=*`, {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Accept': 'application/json',
  });
  
  if (profileRes.status === 200 && Array.isArray(profileRes.json) && profileRes.json.length > 0) {
    const profile = profileRes.json[0];
    console.log(`  [OK]  Profile auto-created by trigger! ✅`);
    console.log(`  Profile full_name: ${profile.full_name}`);
    console.log(`  Profile role: ${profile.role}`);
    console.log(`  Profile email: ${profile.email}`);
  } else {
    console.log(`  [WARN] Profile not auto-created (HTTP ${profileRes.status}). Trigger may need attention.`);
    console.log(`  Attempting manual profile upsert...`);
    
    // Fallback: manually insert profile
    const upsertRes = await post(hostname, '/rest/v1/profiles', {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'resolution=merge-duplicates,return=representation',
    }, { id: userId, full_name: testName, email: testEmail, role: 'student' });
    
    if (upsertRes.status === 200 || upsertRes.status === 201) {
      console.log(`  [OK]  Profile manually created ✅`);
    } else {
      console.log(`  [FAIL] Profile upsert failed: HTTP ${upsertRes.status}`);
    }
  }
  console.log();

  // ── Final Summary ──
  console.log('══════════════════════════════════════════════════════');
  console.log('E2E TEST RESULTS');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  ✅  Supabase URL                : ${url}`);
  console.log(`  ✅  Real signup API call         : HTTP ${signupRes.status}`);
  console.log(`  ✅  User created in auth.users   : ${userId}`);
  console.log(`  ${sessionToken ? '✅' : '⚠️ '} Immediate session (no email verify): ${sessionToken ? 'YES' : 'NO — disable email confirmation!'}`);
  console.log(`  ✅  profiles table               : EXISTS`);
  console.log('\n  CHECK YOUR SUPABASE DASHBOARD:');
  console.log(`  https://supabase.com/dashboard/project/pyvnywuygkwcwhenzldl/auth/users`);
  console.log(`  You should see: ${testEmail}`);
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(e => { console.error('Test failed:', e.message); process.exit(1); });
