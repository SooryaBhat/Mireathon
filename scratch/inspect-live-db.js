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

console.log("Connecting to Supabase URL:", url);
const supabase = createClient(url, key);

async function inspect() {
  console.log("\n--- 1. PROFILES TABLE ---");
  const { data: profs, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Profiles error:", pErr);
  console.log("Profiles count:", profs?.length);
  console.log("Profiles sample:", profs);

  console.log("\n--- 2. THEMES TABLE ---");
  const { data: themes, error: thErr } = await supabase.from('themes').select('*');
  console.log("Themes error:", thErr);
  console.log("Themes count:", themes?.length);
  console.log("Themes sample:", themes);

  console.log("\n--- 3. TEAMS TABLE ---");
  const { data: teams, error: tmErr } = await supabase.from('teams').select('*');
  console.log("Teams error:", tmErr);
  console.log("Teams count:", teams?.length);
  console.log("Teams sample:", teams);

  console.log("\n--- 4. SUBMISSIONS TABLE ---");
  const { data: subs, error: sErr } = await supabase.from('submissions').select('*');
  console.log("Submissions error:", sErr);
  console.log("Submissions count:", subs?.length);
  console.log("Submissions sample:", subs);

  console.log("\n--- 5. ROUND1_EVALUATIONS TABLE ---");
  const { data: r1, error: r1Err } = await supabase.from('round1_evaluations').select('*');
  console.log("round1_evaluations error:", r1Err);
  console.log("round1_evaluations count:", r1?.length);

  console.log("\n--- 6. EVALUATIONS TABLE ---");
  const { data: evals, error: evErr } = await supabase.from('evaluations').select('*');
  console.log("evaluations error:", evErr);
  console.log("evaluations count:", evals?.length);
}

inspect();
