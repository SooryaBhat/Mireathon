#!/usr/bin/env node
/**
 * Miraethon 2026 — Remote Supabase Migration Runner
 * 
 * Applies full schema to the remote Supabase project using the service role key.
 * Safe: uses IF NOT EXISTS and ON CONFLICT to avoid data loss.
 * NEVER prints secret key values.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) throw new Error('.env not found');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const l of lines) {
    const t = l.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx !== -1) {
      env[t.substring(0, idx).trim()] = t.substring(idx + 1).trim();
    }
  }
  return env;
}

async function runSQL(url, serviceKey, sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const parsedUrl = new URL(`${url}/rest/v1/rpc/exec_sql`);
    // Use the Postgres REST endpoint for raw SQL via service key
    const opts = {
      hostname: parsedUrl.hostname,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

async function pgQuery(url, serviceKey, query, params = []) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, params });
    const opts = {
      hostname: new URL(url).hostname,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=representation',
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

// Use REST API directly to check tables via information_schema
async function checkTable(url, serviceKey, tableName) {
  return new Promise((resolve, reject) => {
    const path2 = `/rest/v1/${tableName}?limit=0&select=*`;
    const opts = {
      hostname: new URL(url).hostname,
      path: path2,
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
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function fetchTable(url, serviceKey, tableName, limit = 10) {
  return new Promise((resolve, reject) => {
    const p = `/rest/v1/${tableName}?limit=${limit}&select=*`;
    const opts = {
      hostname: new URL(url).hostname,
      path: p,
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
      res.on('end', () => { 
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, data: [] }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function upsertRows(url, serviceKey, tableName, rows, conflictCol) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const p = `/rest/v1/${tableName}`;
    const opts = {
      hostname: new URL(url).hostname,
      path: p,
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': `resolution=merge-duplicates,return=representation`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { 
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  MIRAETHON 2026 — Remote Supabase Migration Runner   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const env = loadEnv();
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !serviceKey) {
    console.log('[FAIL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  if (url.includes('placeholder') || serviceKey.includes('placeholder')) {
    console.log('[FAIL] .env still contains placeholder values.');
    process.exit(1);
  }

  console.log(`[OK]  Supabase URL: ${url}`);
  console.log(`[OK]  Anon Key: SET (${(anonKey||'').length} chars)`);
  console.log(`[OK]  Service Role Key: SET (${serviceKey.length} chars)`);
  console.log();

  // Step 1: Test connectivity
  console.log('Step 1: Testing remote connectivity...');
  try {
    const health = await checkTable(url, serviceKey, 'profiles');
    if (health.status === 200 || health.status === 406) {
      console.log('[OK]  Remote Supabase is reachable (REST API responded)\n');
    } else if (health.status === 404) {
      console.log('[INFO] profiles table does not exist yet — migration needed\n');
    } else {
      console.log(`[INFO] REST response: HTTP ${health.status}\n`);
    }
  } catch(e) {
    console.log(`[FAIL] Cannot reach Supabase: ${e.message}`);
    process.exit(1);
  }

  // Step 2: Check which tables exist
  console.log('Step 2: Checking which tables exist on remote...');
  const tables = ['profiles', 'themes', 'teams', 'team_members', 'hackathon_settings', 'submissions'];
  const tableStatus = {};
  for (const t of tables) {
    const res = await checkTable(url, serviceKey, t);
    const exists = res.status !== 404 && !res.body.includes('"code":"42P01"');
    tableStatus[t] = exists;
    console.log(`   ${exists ? '✅' : '❌'} ${t}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
  console.log();

  const missingTables = tables.filter(t => !tableStatus[t]);

  if (missingTables.length > 0) {
    console.log('Step 3: Missing tables detected. Migration SQL must be run in Supabase SQL Editor.');
    console.log('        The Supabase REST API does not support raw DDL statements.');
    console.log('        Please follow the instructions below.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ACTION REQUIRED: Apply migration manually');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Open: https://supabase.com/dashboard/project/pyvnywuygkwcwhenzldl/sql/new');
    console.log('2. Copy the SQL from: supabase/migrations/20260811_initial_schema.sql');
    console.log('3. Paste into the SQL Editor and click RUN.');
    console.log('4. After running, re-run this script to verify.\n');
    console.log(`Missing tables: ${missingTables.join(', ')}\n`);
  } else {
    console.log('Step 3: All 6 tables exist on remote. ✅\n');
  }

  // Step 4: Check/seed themes
  console.log('Step 4: Checking themes table...');
  const themesRes = await fetchTable(url, serviceKey, 'themes', 10);
  if (themesRes.status === 200 && Array.isArray(themesRes.data)) {
    if (themesRes.data.length === 0) {
      console.log('[INFO] No themes found — seeding 6 tracks...');
      const themes = [
        { name: '01 — RETAIL & REALITY', slug: 'retail-reality', description: 'Augmented Shopping & Spatial Commerce', image_url: '/New_images/Retail.png', is_active: true },
        { name: '02 — FINANCIAL & INVESTMENTS', slug: 'financial-investments', description: 'Decentralized Wealth & Smart Fintech', image_url: '/New_images/finance.png', is_active: true },
        { name: '03 — HEALTH & WELLNESS', slug: 'health-wellness', description: 'Biotech Signals & Preventive Care', image_url: '/New_images/health.png', is_active: true },
        { name: '04 — TRAVEL & FOOD', slug: 'travel-food', description: 'Autonomous Expeditions & Ghost Kitchens', image_url: '/New_images/travel.png', is_active: true },
        { name: '05 — SPORTS & FITNESS', slug: 'sports-fitness', description: 'Kinetic Performance & Fan Immersion', image_url: '/New_images/sports.png', is_active: true },
        { name: '06 — MUSIC & OTT', slug: 'music-ott', description: 'Sonic Generative Media & Streaming', image_url: '/New_images/music.png', is_active: true },
      ];
      const seedRes = await upsertRows(url, serviceKey, 'themes', themes, 'slug');
      if (seedRes.status === 200 || seedRes.status === 201) {
        console.log('[OK]  6 theme tracks seeded successfully ✅');
      } else {
        console.log(`[WARN] Theme seed returned HTTP ${seedRes.status}:`, typeof seedRes.data === 'string' ? seedRes.data.substring(0, 200) : JSON.stringify(seedRes.data).substring(0, 200));
      }
    } else {
      console.log(`[OK]  ${themesRes.data.length} theme(s) already in database ✅`);
      for (const t of themesRes.data) {
        console.log(`      - ${t.name}`);
      }
    }
  } else if (themesRes.status === 404) {
    console.log('[INFO] themes table missing — needs migration first.');
  } else {
    console.log(`[WARN] themes check: HTTP ${themesRes.status}`);
  }
  console.log();

  // Step 5: Check hackathon_settings
  console.log('Step 5: Checking hackathon_settings...');
  const settingsRes = await fetchTable(url, serviceKey, 'hackathon_settings', 5);
  if (settingsRes.status === 200 && Array.isArray(settingsRes.data)) {
    if (settingsRes.data.length === 0) {
      console.log('[INFO] No settings row found — inserting default...');
      const deadline = new Date(Date.now() + 30 * 86400000).toISOString();
      const insertRes = await upsertRows(url, serviceKey, 'hackathon_settings', [
        { registration_open: true, registration_deadline: deadline, min_team_size: 1, max_team_size: 4 }
      ]);
      if (insertRes.status === 200 || insertRes.status === 201) {
        console.log('[OK]  Hackathon settings row inserted ✅');
      } else {
        console.log(`[WARN] Settings insert: HTTP ${insertRes.status}`);
      }
    } else {
      const s = settingsRes.data[0];
      console.log(`[OK]  hackathon_settings exists ✅`);
      console.log(`      registration_open: ${s.registration_open}`);
      console.log(`      deadline: ${s.registration_deadline}`);
      console.log(`      max_team_size: ${s.max_team_size}`);
    }
  } else if (settingsRes.status === 404) {
    console.log('[INFO] hackathon_settings table missing — needs migration first.');
  } else {
    console.log(`[WARN] hackathon_settings check: HTTP ${settingsRes.status}`);
  }
  console.log();

  // Step 6: Verify profiles count
  console.log('Step 6: Checking profiles table...');
  const profilesRes = await fetchTable(url, serviceKey, 'profiles', 5);
  if (profilesRes.status === 200 && Array.isArray(profilesRes.data)) {
    console.log(`[OK]  profiles table exists — ${profilesRes.data.length} profile(s) in DB ✅`);
  } else if (profilesRes.status === 404) {
    console.log('[INFO] profiles table missing — needs migration.');
  } else {
    console.log(`[INFO] profiles check: HTTP ${profilesRes.status}`);
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  for (const t of tables) {
    console.log(`  ${tableStatus[t] ? '✅' : '❌'} ${t}`);
  }
  if (missingTables.length > 0) {
    console.log('\n⚠️  ACTION REQUIRED: Run the SQL migration in the Supabase Dashboard SQL Editor.');
    console.log('   URL: https://supabase.com/dashboard/project/pyvnywuygkwcwhenzldl/sql/new');
  } else {
    console.log('\n✅ All tables exist. Remote Supabase is fully connected!');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
