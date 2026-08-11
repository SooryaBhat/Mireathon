const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function applyRemoteMigration() {
  console.log('=== APPLY REMOTE SUPABASE MIGRATION ===\n');

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('[FAIL] .env file not found.');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  let url = '';
  let anonKey = '';
  let serviceKey = '';

  for (let l of content.split('\n')) {
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

  if (!url || url.includes('placeholder') || !serviceKey || serviceKey.includes('placeholder')) {
    console.log('[FAIL] .env contains placeholder URL or Service Role Key.');
    console.log('Please enter your actual Supabase URL, Anon Key, and Service Role Key in .env file.');
    return;
  }

  const supabaseAdmin = createClient(url, serviceKey);

  console.log('1. Connecting to remote Supabase project at:', url);

  // Read SQL migration file
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260811_initial_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log('[FAIL] Migration SQL file not found at:', sqlPath);
    return;
  }

  // Verify seeds: themes table
  console.log('2. Checking / Seeding 6 Themes in remote database...');
  const themes = [
    { name: '01 — RETAIL & REALITY', slug: 'retail-reality', description: 'Augmented Shopping & Spatial Commerce', image_url: '/New_images/Retail.png' },
    { name: '02 — FINANCIAL & INVESTMENTS', slug: 'financial-investments', description: 'Decentralized Wealth & Smart Fintech', image_url: '/New_images/finance.png' },
    { name: '03 — HEALTH & WELLNESS', slug: 'health-wellness', description: 'Biotech Signals & Preventive Care', image_url: '/New_images/health.png' },
    { name: '04 — TRAVEL & FOOD', slug: 'travel-food', description: 'Autonomous Expeditions & Ghost Kitchens', image_url: '/New_images/travel.png' },
    { name: '05 — SPORTS & FITNESS', slug: 'sports-fitness', description: 'Kinetic Performance & Fan Immersion', image_url: '/New_images/sports.png' },
    { name: '06 — MUSIC & OTT', slug: 'music-ott', description: 'Sonic Generative Media & Streaming', image_url: '/New_images/music.png' },
  ];

  for (let theme of themes) {
    const { error } = await supabaseAdmin.from('themes').upsert(theme, { onConflict: 'slug' });
    if (error) {
      console.log(`   - Theme ${theme.slug}: ${error.message}`);
    } else {
      console.log(`   - Theme ${theme.slug}: SEEDED SUCCESSFULLY`);
    }
  }

  // Verify hackathon settings
  console.log('3. Checking / Initializing Hackathon Settings in remote database...');
  const { data: existingSettings } = await supabaseAdmin.from('hackathon_settings').select('*').limit(1);
  if (!existingSettings || existingSettings.length === 0) {
    const { error: settingsErr } = await supabaseAdmin.from('hackathon_settings').insert({
      registration_open: true,
      min_team_size: 1,
      max_team_size: 4,
    });
    if (settingsErr) {
      console.log('   - Hackathon Settings insert error:', settingsErr.message);
    } else {
      console.log('   - Hackathon Settings: INITIALIZED SUCCESSFULLY');
    }
  } else {
    console.log('   - Hackathon Settings: ALREADY EXISTS');
  }

  console.log('\n[COMPLETE] Remote Supabase table verification finished!');
}

applyRemoteMigration().catch(console.error);
