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

async function testFetch() {
  const { data: subs } = await supabase.from('submissions').select('*');
  const { data: teams } = await supabase.from('teams').select('*');
  const { data: themes } = await supabase.from('themes').select('*');

  if (subs && subs.length > 0 && teams && themes) {
    const sub = subs[0];
    const team = teams.find(t => t.id === sub.team_id);
    const themeObj = team ? themes.find(th => th.id === team.theme_id) : null;
    console.log("\n=== MANUALLY JOINED ITEM ===");
    console.log({
      submission_id: sub.id,
      team_id: sub.team_id,
      team_name: team?.team_name || "Unknown Team",
      theme_name: themeObj?.name || "Unknown Track",
      file_name: sub.file_name,
      file_path: sub.file_path,
      submitted_at: sub.submitted_at
    });
  }
}

testFetch();
