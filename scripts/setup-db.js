const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || url.includes('placeholder') || serviceKey.includes('placeholder')) {
  console.log('Supabase credentials are placeholders. Database schema SQL is stored at supabase/migrations/20260811_initial_schema.sql');
  console.log('Ensure valid credentials in .env and run migration in Supabase SQL Editor.');
  process.exit(0);
}

const supabase = createClient(url, serviceKey);

async function setupDatabase() {
  console.log('Verifying Supabase connection...');

  // Check themes
  const { data: themes, error: themeErr } = await supabase.from('themes').select('*');
  if (themeErr) {
    console.log('Database tables not yet populated. SQL file available at: supabase/migrations/20260811_initial_schema.sql');
  } else {
    console.log(`Found ${themes.length} theme tracks in database.`);
  }
}

setupDatabase().catch(console.error);
