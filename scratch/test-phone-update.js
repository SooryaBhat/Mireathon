const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
const key = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(url, key);

async function testUpdate(phoneVal) {
  const { data: profs } = await supabase.from('profiles').select('*').limit(1);
  if (!profs?.[0]) return;
  const testId = profs[0].id;

  // Try update with phone_number first
  const { error: err1 } = await supabase
    .from('profiles')
    .update({ full_name: profs[0].full_name, phone_number: phoneVal, phone: phoneVal })
    .eq('id', testId);

  if (err1) {
    console.log("Update with phone_number failed, fallback to phone column:", err1.message);
    const { error: err2 } = await supabase
      .from('profiles')
      .update({ full_name: profs[0].full_name, phone: phoneVal })
      .eq('id', testId);
    console.log("Fallback update result:", err2 ? err2.message : "SUCCESS!");
  } else {
    console.log("Update with phone_number and phone SUCCEEDED!");
  }
}

testUpdate("+919876543210");
