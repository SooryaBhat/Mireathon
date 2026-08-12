import { supabase } from "./supabase/client";

export interface TrackRankEntry {
  rank: number;
  team_id: string;
  team_name: string;
  team_code: string;
  theme_id: string;
  theme_name: string;
  submission_id?: string;
  file_name?: string;
  file_path?: string;
  submitted_at?: string;
  total_score: number;
  creativity_score: number;
  impact_score: number;
  track_relevance_score: number;
  evaluation_count: number;
  is_shortlisted: boolean;
  tie_breaker_note?: string;
}

export interface TrackProgress {
  theme_id: string;
  theme_name: string;
  total_teams: number;
  total_submissions: number;
  evaluated_count: number;
  pending_count: number;
  completion_pct: number;
  rankings: TrackRankEntry[];
}

export interface AdminStats {
  total_teams: number;
  total_submissions: number;
  evaluated_submissions: number;
  pending_submissions: number;
  shortlisted_teams: number;
  evaluation_completion_pct: number;
  results_published: boolean;
  top_shortlist_per_track: number;
  tracks: TrackProgress[];
}

// 1. Fetch Complete Admin Dashboard Data & Track-wise Leaderboards
export async function getAdminDashboardData(): Promise<{ stats: AdminStats | null; error?: string }> {
  try {
    // 1. Fetch Settings
    const { data: settings } = await supabase
      .from("hackathon_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const resultsPublished = settings?.results_published ?? false;
    const topShortlist = settings?.top_shortlist_per_track || 2;

    // 2. Fetch all Themes
    const { data: themes, error: themesErr } = await supabase
      .from("themes")
      .select("id, name, slug")
      .eq("is_active", true);

    if (themesErr) console.warn("Themes query notice:", themesErr.message);
    const themeList = themes || [];

    // 3. Fetch all Teams
    const { data: teams, error: teamsErr } = await supabase
      .from("teams")
      .select("id, team_name, team_code, theme_id");

    if (teamsErr) console.warn("Teams query notice:", teamsErr.message);
    const teamList = teams || [];

    // 4. Fetch all Submissions
    const { data: submissions, error: subErr } = await supabase
      .from("submissions")
      .select("*");

    if (subErr) {
      console.error("Admin submissions fetch error:", subErr.message);
    }

    const submissionMap = new Map<string, any>();
    (submissions || []).forEach((s: any) => {
      submissionMap.set(s.team_id, s);
    });

    // 5. Fetch all Evaluations from round1_evaluations (with fallback to evaluations)
    let evaluations: any[] = [];
    const { data: r1Evals, error: r1Err } = await supabase
      .from("round1_evaluations")
      .select("*");

    if (!r1Err && r1Evals) {
      evaluations = r1Evals;
    } else {
      const { data: legacyEvals } = await supabase
        .from("evaluations")
        .select("*");
      evaluations = legacyEvals || [];
    }

    // Group evaluations by team_id
    const teamEvalsMap = new Map<string, any[]>();
    evaluations.forEach((e: any) => {
      const list = teamEvalsMap.get(e.team_id) || [];
      list.push(e);
      teamEvalsMap.set(e.team_id, list);
    });

    // 6. Fetch Shortlist entries
    const { data: shortlists } = await supabase
      .from("shortlists")
      .select("*");

    const shortlistMap = new Map<string, boolean>();
    (shortlists || []).forEach((s: any) => {
      shortlistMap.set(s.team_id, s.is_shortlisted);
    });

    // 7. Group teams & build track-wise leaderboards
    const trackProgressMap = new Map<string, TrackProgress>();

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
      const trackProg: TrackProgress = trackProgressMap.get(themeId) || {
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

        // Calculate average scores if evaluations exist
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

    // 8. Sort Track-wise Leaderboards separately with 3-tier tie-breakers
    const tracksList: TrackProgress[] = [];

    trackProgressMap.forEach((prog) => {
      prog.completion_pct =
        prog.total_submissions > 0
          ? Math.round((prog.evaluated_count / prog.total_submissions) * 100)
          : 0;

      prog.rankings.sort((a, b) => {
        // 1st Priority: Total Score
        if (b.total_score !== a.total_score) {
          return b.total_score - a.total_score;
        }
        // 2nd Priority (1st Tie-breaker): Creativity & Innovation
        if (b.creativity_score !== a.creativity_score) {
          return b.creativity_score - a.creativity_score;
        }
        // 3rd Priority (2nd Tie-breaker): Business Impact & Scalability
        if (b.impact_score !== a.impact_score) {
          return b.impact_score - a.impact_score;
        }
        // 4th Priority (3rd Tie-breaker): Track Relevance
        return b.track_relevance_score - a.track_relevance_score;
      });

      // Assign track rank and tie-breaker notes
      prog.rankings.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      tracksList.push(prog);
    });

    const pendingSubmissionsCount = totalSubmissionsCount - totalEvaluatedCount;
    const overallCompletionPct =
      totalSubmissionsCount > 0
        ? Math.round((totalEvaluatedCount / totalSubmissionsCount) * 100)
        : 0;

    const stats: AdminStats = {
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

    return { stats };
  } catch (err: any) {
    console.error("getAdminDashboardData unexpected error:", err);
    return { stats: null, error: err.message || "Failed to load admin dashboard statistics." };
  }
}

// 2. Generate Top N Shortlists per Track with 3-Tier Tie-Breakers
export async function generateTrackShortlists(
  topNPerTrack: number = 2
): Promise<{ success: boolean; shortlistedCount?: number; error?: string }> {
  try {
    const dashRes = await getAdminDashboardData();
    if (!dashRes.stats) {
      return { success: false, error: dashRes.error || "Failed to calculate current rankings." };
    }

    const shortlistsToInsert: any[] = [];

    dashRes.stats.tracks.forEach((track) => {
      const topTeams = track.rankings.slice(0, topNPerTrack);
      topTeams.forEach((team) => {
        shortlistsToInsert.push({
          team_id: team.team_id,
          theme_id: track.theme_id,
          rank_in_track: team.rank,
          total_score: team.total_score,
          creativity_score: team.creativity_score,
          impact_score: team.impact_score,
          track_relevance_score: team.track_relevance_score,
          is_shortlisted: true,
          updated_at: new Date().toISOString(),
        });
      });
    });

    // Clear existing and bulk insert new shortlists
    await supabase.from("shortlists").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    if (shortlistsToInsert.length > 0) {
      const { error: insErr } = await supabase.from("shortlists").upsert(shortlistsToInsert, { onConflict: "team_id" });
      if (insErr) {
        console.error("Shortlist insert error:", insErr);
        return { success: false, error: insErr.message };
      }
    }

    // Save top_shortlist_per_track in hackathon_settings
    await supabase
      .from("hackathon_settings")
      .update({ top_shortlist_per_track: topNPerTrack })
      .neq("registration_open", false);

    return { success: true, shortlistedCount: shortlistsToInsert.length };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate shortlists." };
  }
}

// 3. Toggle Results Publication Status
export async function toggleResultsPublication(
  publish: boolean
): Promise<{ success: boolean; results_published?: boolean; error?: string }> {
  try {
    const { data: settings } = await supabase
      .from("hackathon_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (settings?.id) {
      const { error } = await supabase
        .from("hackathon_settings")
        .update({ results_published: publish })
        .eq("id", settings.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("hackathon_settings")
        .insert({ results_published: publish });

      if (error) return { success: false, error: error.message };
    }

    return { success: true, results_published: publish };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update publication status." };
  }
}

// 4. Get Student Team Result Status
export async function getStudentTeamResult(teamId: string): Promise<{
  resultsPublished: boolean;
  isShortlisted: boolean;
  rankInTrack?: number;
}> {
  try {
    const { data: settings } = await supabase
      .from("hackathon_settings")
      .select("results_published")
      .limit(1)
      .maybeSingle();

    const resultsPublished = settings?.results_published ?? false;
    if (!resultsPublished) {
      return { resultsPublished: false, isShortlisted: false };
    }

    const { data: shortlist } = await supabase
      .from("shortlists")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    if (shortlist && shortlist.is_shortlisted) {
      return {
        resultsPublished: true,
        isShortlisted: true,
        rankInTrack: shortlist.rank_in_track || 1,
      };
    }

    return { resultsPublished: true, isShortlisted: false };
  } catch (err) {
    return { resultsPublished: false, isShortlisted: false };
  }
}
