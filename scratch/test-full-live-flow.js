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

async function verifyFullFlow() {
  console.log("=== STEP 1: VERIFY PUBLIC.ROUND1_EVALUATIONS TABLE EXISTS ===");
  const { data: selectData, error: selectErr } = await supabase
    .from('round1_evaluations')
    .select('*');

  console.log("round1_evaluations select error:", selectErr);
  console.log("round1_evaluations total rows:", selectData?.length);

  console.log("\n=== STEP 2: TEST REAL EVALUATION DRAFT & SUBMISSION ===");
  const submission_id = 'f9d4b8d2-7528-4c52-833a-6c70851e1cd6';
  const team_id = 'c10201ca-aa41-443d-8135-bac0e00d28a8';
  const judge_id = '62f4992e-f628-4dd1-9591-9ed842ca7206';

  // Draft Save Test
  const draftPayload = {
    submission_id,
    team_id,
    judge_id,
    creativity_innovation: 28,
    business_relevance: 14,
    ai_technology: 12,
    feasibility_execution: 7,
    business_impact_scalability: 8,
    track_relevance: 8,
    presentation_clarity: 4,
    total_score: 81,
    feedback: "Draft review: Strong technological foundation.",
    status: "draft",
    updated_at: new Date().toISOString()
  };

  const { data: draftData, error: draftErr } = await supabase
    .from('round1_evaluations')
    .upsert(draftPayload, { onConflict: 'submission_id,judge_id' })
    .select();

  console.log("Draft save result:", { row: draftData?.[0], error: draftErr });

  // Final Submit Test
  const finalPayload = {
    submission_id,
    team_id,
    judge_id,
    creativity_innovation: 32,
    business_relevance: 14,
    ai_technology: 14,
    feasibility_execution: 9,
    business_impact_scalability: 9,
    track_relevance: 9,
    presentation_clarity: 5,
    total_score: 92,
    feedback: "Final evaluation: Outstanding solution with exceptional execution potential.",
    status: "submitted",
    updated_at: new Date().toISOString()
  };

  const { data: finalData, error: finalErr } = await supabase
    .from('round1_evaluations')
    .upsert(finalPayload, { onConflict: 'submission_id,judge_id' })
    .select();

  console.log("Final submit result:", { row: finalData?.[0], error: finalErr });

  console.log("\n=== STEP 3: VERIFY ROW PERSISTENCE & UNIQUE CONSTRAINT ===");
  const { data: checkData } = await supabase
    .from('round1_evaluations')
    .select('*')
    .eq('submission_id', submission_id)
    .eq('judge_id', judge_id);

  console.log("Row count in round1_evaluations for judge + submission:", checkData?.length);
  console.log("Persisted row:", checkData?.[0]);
}

verifyFullFlow();
