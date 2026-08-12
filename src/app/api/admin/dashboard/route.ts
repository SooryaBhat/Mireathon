import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch Settings
    const { data: settings } = await supabaseAdmin
      .from("hackathon_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const resultsPublished = settings?.results_published ?? false;
    const topShortlist = settings?.top_shortlist_per_track || 2;

    // 2. Fetch Themes
    const { data: themes } = await supabaseAdmin
      .from("themes")
      .select("id, name, slug")
      .eq("is_active", true);

    const themeList = themes || [];

    // 3. Fetch Teams
    const { data: teams } = await supabaseAdmin
      .from("teams")
      .select("id, team_name, team_code, theme_id");

    const teamList = teams || [];

    // 4. Fetch Submissions
    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select("*");

    const submissionMap = new Map<string, any>();
    (submissions || []).forEach((s: any) => submissionMap.set(s.team_id, s));

    // 5. Fetch Evaluations (round1_evaluations with fallback to evaluations)
    let evaluations: any[] = [];
    const { data: r1Evals, error: r1Err } = await supabaseAdmin
      .from("round1_evaluations")
      .select("*");

    if (!r1Err && r1Evals) {
      evaluations = r1Evals;
    } else {
      const { data: legacyEvals } = await supabaseAdmin
        .from("evaluations")
        .select("*");
      evaluations = legacyEvals || [];
    }

    const teamEvalsMap = new Map<string, any[]>();
    evaluations.forEach((e: any) => {
      const list = teamEvalsMap.get(e.team_id) || [];
      list.push(e);
      teamEvalsMap.set(e.team_id, list);
    });

    // 6. Fetch Shortlist entries
    const { data: shortlists } = await supabaseAdmin
      .from("shortlists")
      .select("*");

    const shortlistMap = new Map<string, boolean>();
    (shortlists || []).forEach((s: any) => shortlistMap.set(s.team_id, s.is_shortlisted));

    // 7. Group teams & build track-wise leaderboards
    const trackProgressMap = new Map<string, any>();

    themeList.forEach((t: any) => {
      trackProgressMap.set(t.id, {
        theme_id: t.id,
        theme_name: t.name,
        total_teams: 0,
        total_submissions: 0,
        evaluated_count: 0,
        pending_count: 0,
        completion_pct: 0,
        rankings: [],
      });
    });

    let totalSubmissionsCount = 0;
    let totalEvaluatedCount = 0;
    let totalShortlistedCount = 0;

    teamList.forEach((team: any) => {
      const themeId = team.theme_id;
      const trackProg = trackProgressMap.get(themeId) || {
        theme_id: themeId || "unassigned",
        theme_name: "Unassigned Track",
        total_teams: 0,
        total_submissions: 0,
        evaluated_count: 0,
        pending_count: 0,
        completion_pct: 0,
        rankings: [],
      };

      trackProg.total_teams += 1;

      const sub = submissionMap.get(team.id);
      if (sub) {
        trackProg.total_submissions += 1;
        totalSubmissionsCount += 1;

        const evals = teamEvalsMap.get(team.id) || [];
        const isEvaluated = evals.length > 0 && evals.some((e: any) => e.status === "submitted" || e.status === "evaluated");

        if (isEvaluated) {
          trackProg.evaluated_count += 1;
          totalEvaluatedCount += 1;
        } else {
          trackProg.pending_count += 1;
        }

        let totalScore = 0;
        let creativityScore = 0;
        let impactScore = 0;
        let trackRelevanceScore = 0;

        if (evals.length > 0) {
          const sumTotal = evals.reduce((acc, curr) => acc + Number(curr.total_score || 0), 0);
          const sumCreativity = evals.reduce(
            (acc, curr) => acc + Number(curr.creativity_innovation ?? curr.creativity_score ?? 0),
            0
          );
          const sumImpact = evals.reduce(
            (acc, curr) => acc + Number(curr.business_impact_scalability ?? curr.impact_score ?? 0),
            0
          );
          const sumTrackRel = evals.reduce(
            (acc, curr) => acc + Number(curr.track_relevance ?? curr.track_relevance_score ?? 0),
            0
          );

          totalScore = Number((sumTotal / evals.length).toFixed(2));
          creativityScore = Number((sumCreativity / evals.length).toFixed(2));
          impactScore = Number((sumImpact / evals.length).toFixed(2));
          trackRelevanceScore = Number((sumTrackRel / evals.length).toFixed(2));
        }

        const isShortlisted = shortlistMap.get(team.id) || false;
        if (isShortlisted) totalShortlistedCount += 1;

        trackProg.rankings.push({
          rank: 0,
          team_id: team.id,
          team_name: team.team_name,
          team_code: team.team_code,
          theme_id: themeId,
          theme_name: trackProg.theme_name,
          submission_id: sub.id,
          file_name: sub.file_name || sub.original_filename || "Proposal.pptx",
          file_path: sub.file_path,
          submitted_at: sub.submitted_at,
          total_score: totalScore,
          creativity_score: creativityScore,
          impact_score: impactScore,
          track_relevance_score: trackRelevanceScore,
          evaluation_count: evals.length,
          is_shortlisted: isShortlisted,
        });

        if (!trackProgressMap.has(themeId)) {
          trackProgressMap.set(themeId, trackProg);
        }
      }
    });

    const tracksList: any[] = [];

    trackProgressMap.forEach((prog) => {
      prog.completion_pct =
        prog.total_submissions > 0
          ? Math.round((prog.evaluated_count / prog.total_submissions) * 100)
          : 0;

      prog.rankings.sort((a: any, b: any) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score;
        if (b.creativity_score !== a.creativity_score) return b.creativity_score - a.creativity_score;
        if (b.impact_score !== a.impact_score) return b.impact_score - a.impact_score;
        return b.track_relevance_score - a.track_relevance_score;
      });

      prog.rankings.forEach((entry: any, idx: number) => {
        entry.rank = idx + 1;
      });

      tracksList.push(prog);
    });

    const pendingSubmissionsCount = totalSubmissionsCount - totalEvaluatedCount;
    const overallCompletionPct =
      totalSubmissionsCount > 0
        ? Math.round((totalEvaluatedCount / totalSubmissionsCount) * 100)
        : 0;

    const stats = {
      total_teams: teamList.length,
      total_submissions: totalSubmissionsCount,
      evaluated_submissions: totalEvaluatedCount,
      pending_submissions: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : 0,
      shortlisted_teams: totalShortlistedCount,
      evaluation_completion_pct: overallCompletionPct,
      results_published: resultsPublished,
      top_shortlist_per_track: topShortlist,
      tracks: tracksList,
    };

    return NextResponse.json({ stats });
  } catch (err: any) {
    console.error("GET /api/admin/dashboard error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load admin dashboard data" },
      { status: 500 }
    );
  }
}
