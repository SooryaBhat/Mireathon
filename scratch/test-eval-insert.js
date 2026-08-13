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

async function testEval() {
  const submission_id = 'f9d4b8d2-7528-4c52-833a-6c70851e1cd6';
  const team_id = 'c10201ca-aa41-443d-8135-bac0e00d28a8';
  const judge_id = '62f4992e-f628-4dd1-9591-9ed842ca7206';

  const testPayload = {
    submission_id,
    team_id,
    judge_id,
    creativity_innovation: 30,
    business_relevance: 12,
    ai_technology: 13,
    feasibility_execution: 8,
    business_impact_scalability: 8,
    track_relevance: 9,
    presentation_clarity: 4,
    total_score: 84,
    feedback: "Excellent Round 1 proposal. Clear AI solution and feasibility.",
    status: "submitted"
  };

  console.log("Attempting insert to round1_evaluations...");
  const { data: r1Data, error: r1Err } = await supabase
    .from('round1_evaluations')
    .upsert(testPayload, { onConflict: 'submission_id,judge_id' })
    .select();

  console.log("round1_evaluations result:", { data: r1Data, error: r1Err });
}

testEval();
