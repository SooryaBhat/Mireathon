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

async function getSubmissionsForJudgeFlat(judgeId, trackFilter = 'all', statusFilter = 'all') {
  // 1. Flat Submissions
  const { data: rawSubmissions, error: subErr } = await supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (subErr) {
    console.error("Submissions fetch error:", subErr);
    return { submissions: [], error: subErr.message };
  }

  if (!rawSubmissions || rawSubmissions.length === 0) {
    return { submissions: [] };
  }

  // 2. Flat Teams
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, team_name, team_code, theme_id");

  const teamMap = new Map();
  (teamsData || []).forEach(t => teamMap.set(t.id, t));

  // 3. Flat Themes
  const { data: themesData } = await supabase
    .from("themes")
    .select("id, name, slug");

  const themeMap = new Map();
  (themesData || []).forEach(th => {
    themeMap.set(th.id, th);
    if (th.slug) themeMap.set(th.slug, th);
  });

  // 4. Flat Evaluations (from round1_evaluations, ignoring PGRST205 missing table error)
  let evaluations = [];
  try {
    const { data: r1Evals } = await supabase
      .from("round1_evaluations")
      .select("*")
      .eq("judge_id", judgeId);
    if (r1Evals) evaluations = r1Evals;
  } catch (e) {}

  const evalMap = new Map();
  evaluations.forEach(e => evalMap.set(e.submission_id, e));

  // 5. Flat Team Members
  const { data: allMembers } = await supabase
    .from("team_members")
    .select("team_id, user_id");

  const membersMap = new Map();
  (allMembers || []).forEach(m => {
    const list = membersMap.get(m.team_id) || [];
    list.push(m);
    membersMap.set(m.team_id, list);
  });

  const result = [];

  for (const sub of rawSubmissions) {
    const team = teamMap.get(sub.team_id) || {
      id: sub.team_id,
      team_name: "Squad #" + sub.team_id.slice(0, 8),
      team_code: "N/A",
      theme_id: "",
    };

    const themeObj = themeMap.get(team.theme_id);
    const themeName = themeObj?.name || "General Track";
    const themeSlug = themeObj?.slug || "";
    const themeId = team.theme_id || "";

    const existingEval = evalMap.get(sub.id) || null;
    const isEvaluated = existingEval && existingEval.status === "submitted";

    if (statusFilter === "pending" && isEvaluated) continue;
    if (statusFilter === "evaluated" && !isEvaluated) continue;

    const teamMembers = membersMap.get(team.id) || [];

    result.push({
      submission_id: sub.id,
      team_id: team.id,
      team_name: team.team_name,
      team_code: team.team_code,
      theme_id: themeId,
      theme_name: themeName,
      file_name: sub.file_name || sub.original_filename || "Proposal.pptx",
      file_path: sub.file_path,
      file_size: Number(sub.file_size || 0),
      submitted_at: sub.submitted_at || new Date().toISOString(),
      members_count: teamMembers.length,
      evaluation: existingEval,
    });
  }

  return { submissions: result };
}

async function run() {
  const judgeId = '62f4992e-f628-4dd1-9591-9ed842ca7206';
  const res = await getSubmissionsForJudgeFlat(judgeId);
  console.log("\n=== JUDGE SUBMISSIONS RESULT ===");
  console.log("Count:", res.submissions.length);
  console.log("Details:", JSON.stringify(res.submissions, null, 2));
}

run();
