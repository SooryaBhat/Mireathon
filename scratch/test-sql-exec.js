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
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const sql = `
CREATE TABLE IF NOT EXISTS public.round1_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creativity_innovation INT NOT NULL DEFAULT 0 CHECK (creativity_innovation >= 0 AND creativity_innovation <= 35),
  business_relevance INT NOT NULL DEFAULT 0 CHECK (business_relevance >= 0 AND business_relevance <= 15),
  ai_technology INT NOT NULL DEFAULT 0 CHECK (ai_technology >= 0 AND ai_technology <= 15),
  feasibility_execution INT NOT NULL DEFAULT 0 CHECK (feasibility_execution >= 0 AND feasibility_execution <= 10),
  business_impact_scalability INT NOT NULL DEFAULT 0 CHECK (business_impact_scalability >= 0 AND business_impact_scalability <= 10),
  track_relevance INT NOT NULL DEFAULT 0 CHECK (track_relevance >= 0 AND track_relevance <= 10),
  presentation_clarity INT NOT NULL DEFAULT 0 CHECK (presentation_clarity >= 0 AND presentation_clarity <= 5),
  total_score INT NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_judge_submission UNIQUE(submission_id, judge_id)
);
`;

async function tryExec() {
  console.log("Testing SQL endpoints...");
  
  // Endpoint 1: pg/v1/query
  try {
    const res = await fetch(`${url}/pg/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({ query: sql })
    });
    console.log("pg/v1/query status:", res.status);
    const text = await res.text();
    console.log("pg/v1/query response:", text);
  } catch (e) {
    console.error("pg/v1/query error:", e);
  }
}

tryExec();
