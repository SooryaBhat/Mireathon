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

async function testInsert() {
  const payload = {
    submission_id: 'f9d4b8d2-7528-4c52-833a-6c70851e1cd6',
    team_id: 'c10201ca-aa41-443d-8135-bac0e00d28a8',
    judge_id: '62f4992e-f628-4dd1-9591-9ed842ca7206',
    creativity_innovation: 30,
    business_relevance: 12,
    ai_technology: 13,
    feasibility_execution: 8,
    business_impact_scalability: 8,
    track_relevance: 9,
    presentation_clarity: 4,
    total_score: 84,
    feedback: "Outstanding Round 1 proposal with strong AI application and clear scalability.",
    status: "submitted",
    updated_at: new Date().toISOString()
  };

  console.log("Upserting test payload to public.round1_evaluations...");
  const { data, error } = await supabase
    .from('round1_evaluations')
    .upsert(payload, { onConflict: 'submission_id,judge_id' })
    .select();

  console.log("Upsert error:", error);
  console.log("Upsert data:", data);
}

testInsert();
