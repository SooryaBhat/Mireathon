import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const report: Record<string, any> = {};

  // 1. Test profiles table
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role")
    .limit(10);
  report.profiles = { count: profiles?.length || 0, data: profiles, error: profErr?.message || null };

  // 2. Test themes table
  const { data: themes, error: themesErr } = await supabaseAdmin
    .from("themes")
    .select("id, name, slug")
    .limit(10);
  report.themes = { count: themes?.length || 0, data: themes, error: themesErr?.message || null };

  // 3. Test teams table
  const { data: teams, error: teamsErr } = await supabaseAdmin
    .from("teams")
    .select("id, team_name, team_code, theme_id, leader_id")
    .limit(10);
  report.teams = { count: teams?.length || 0, data: teams, error: teamsErr?.message || null };

  // 4. Test submissions table
  const { data: submissions, error: subErr } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .limit(10);
  report.submissions = { count: submissions?.length || 0, data: submissions, error: subErr?.message || null };

  // 5. Test round1_evaluations table
  const { data: r1Evals, error: r1Err } = await supabaseAdmin
    .from("round1_evaluations")
    .select("*")
    .limit(10);
  report.round1_evaluations = { count: r1Evals?.length || 0, data: r1Evals, error: r1Err?.message || null };

  // 6. Test hackathon_settings table
  const { data: settings, error: setErr } = await supabaseAdmin
    .from("hackathon_settings")
    .select("*")
    .limit(1);
  report.hackathon_settings = { count: settings?.length || 0, data: settings, error: setErr?.message || null };

  return NextResponse.json(report);
}
