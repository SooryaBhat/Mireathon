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

async function testAdminCalc() {
  console.log("=== TESTING ADMIN DASHBOARD STATS CALCULATION ===");
  const { data: teams } = await supabase.from("teams").select("id, team_name, team_code, theme_id");
  const { data: themes } = await supabase.from("themes").select("id, name, slug");
  const { data: submissions } = await supabase.from("submissions").select("*");
  const { data: evaluations } = await supabase.from("round1_evaluations").select("*");

  const submissionMap = new Map();
  (submissions || []).forEach(s => submissionMap.set(s.team_id, s));

  const teamEvalsMap = new Map();
  (evaluations || []).forEach(e => {
    const list = teamEvalsMap.get(e.team_id) || [];
    list.push(e);
    teamEvalsMap.set(e.team_id, list);
  });

  let totalSubmissions = submissions?.length || 0;
  let evaluatedSubmissions = 0;

  (teams || []).forEach(team => {
    const sub = submissionMap.get(team.id);
    if (sub) {
      const evals = teamEvalsMap.get(team.id) || [];
      const isEvaluated = evals.length > 0 && evals.some(e => e.status === "submitted");
      if (isEvaluated) evaluatedSubmissions++;
    }
  });

  const pendingSubmissions = totalSubmissions - evaluatedSubmissions;
  const completionPct = totalSubmissions > 0 ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0;

  console.log({
    total_teams: teams?.length,
    total_submissions: totalSubmissions,
    evaluated_submissions: evaluatedSubmissions,
    pending_submissions: pendingSubmissions,
    completion_pct: `${completionPct}%`,
    evaluated_row_score: evaluations?.[0]?.total_score,
    evaluated_row_status: evaluations?.[0]?.status,
  });
}

testAdminCalc();
