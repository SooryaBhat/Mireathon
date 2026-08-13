const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(url, key);

async function run() {
  console.log("Checking profiles table...");

  // 1. Check current columns in profiles by selecting 1 row
  const { data: sample, error: sErr } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (sErr) {
    console.error("Error reading profiles table:", sErr);
    return;
  }

  console.log("Sample profile row keys:", Object.keys(sample[0] || {}));

  // If phone_number is already present in returned object or we try inserting/updating phone_number
  // Let's test updating a row with phone_number
  if (sample && sample.length > 0) {
    const testId = sample[0].id;
    const { error: uErr } = await supabase
      .from('profiles')
      .update({ phone_number: sample[0].phone_number || null })
      .eq('id', testId);

    if (uErr) {
      console.log("Column phone_number does not exist yet in profiles table according to PostgREST:", uErr.message);
    } else {
      console.log("Successfully verified phone_number column exists on public.profiles table!");
    }
  }
}

run();
