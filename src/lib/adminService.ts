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
    const { data: themes } = await supabase
      .from("themes")
      .select("id, name, slug")
      .eq("is_active", true);

    const themeList = themes || [];

    // 3. Fetch all Teams
    const { data: teams } = await supabase
      .from("teams")
      .select("id, team_name, team_code, theme_id");

    const teamList = teams || [];

    // 4. Fetch all Submissions
    const { data: submissions } = await supabase
      .from("submissions")
      .select("id, team_id, file_name, file_path, submitted_at");

    const submissionMap = new Map<string, any>();
    (submissions || []).forEach((s: any) => {
      submissionMap.set(s.team_id, s);
    });

    // 5. Fetch all Evaluations
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("*");

    // Group evaluations by team_id
    const teamEvalsMap = new Map<string, any[]>();
    (evaluations || []).forEach((e: any) => {
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
        const isEvaluated = evals.length > 0;

        if (isEvaluated) {
          trackProg.evaluated_count += 1;
          totalEvaluatedCount += 1;
        } else {
          trackProg.pending_count += 1;
        }

        // Calculate average scores if multiple evaluations exist
        let totalScore = 0;
        let creativityScore = 0;
        let impactScore = 0;
        let trackRelevanceScore = 0;

        if (evals.length > 0) {
          const sumTotal = evals.reduce((acc, curr) => acc + Number(curr.total_score || 0), 0);
          const sumCreativity = evals.reduce((acc, curr) => acc + Number(curr.creativity_score || 0), 0);
          const sumImpact = evals.reduce((acc, curr) => acc + Number(curr.impact_score || 0), 0);
          const sumTrackRel = evals.reduce((acc, curr) => acc + Number(curr.track_relevance_score || 0), 0);

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
          file_name: sub.file_name,
          file_path: sub.file_path,
          submitted_at: sub.submitted_at,
          total_score: totalScore,
          creativity_score: creativityScore,
          impact_score: impactScore,
          track_relevance_score: trackRelevanceScore,
          evaluation_count: evals.length,
          is_shortlisted: isShortlisted,
        });
      }

      trackProgressMap.set(themeId, trackProg);
    });

    // 8. Sort Track Leaderboards using EXACT Official Tie-Breakers:
    // Primary: Total Score (descending)
    // 1st Tie-Breaker: Creativity & Innovation Score (descending)
    // 2nd Tie-Breaker: Business Impact & Scalability Score (descending)
    // 3rd Tie-Breaker: Track Relevance Score (descending)
    const tracks: TrackProgress[] = [];

    trackProgressMap.forEach((trackProg) => {
      if (trackProg.total_submissions > 0) {
        trackProg.completion_pct = Math.round(
          (trackProg.evaluated_count / trackProg.total_submissions) * 100
        );
      }

      trackProg.rankings.sort((a, b) => {
        if (b.total_score !== a.total_score) {
          return b.total_score - a.total_score;
        }
        // 1st Tie-breaker: Creativity score
        if (b.creativity_score !== a.creativity_score) {
          a.tie_breaker_note = "Ranked via 1st Tie-Breaker: Creativity & Innovation";
          b.tie_breaker_note = "Ranked via 1st Tie-Breaker: Creativity & Innovation";
          return b.creativity_score - a.creativity_score;
        }
        // 2nd Tie-breaker: Business Impact score
        if (b.impact_score !== a.impact_score) {
          a.tie_breaker_note = "Ranked via 2nd Tie-Breaker: Business Impact & Scalability";
          b.tie_breaker_note = "Ranked via 2nd Tie-Breaker: Business Impact & Scalability";
          return b.impact_score - a.impact_score;
        }
        // 3rd Tie-breaker: Track Relevance score
        if (b.track_relevance_score !== a.track_relevance_score) {
          a.tie_breaker_note = "Ranked via 3rd Tie-Breaker: Track Relevance";
          b.tie_breaker_note = "Ranked via 3rd Tie-Breaker: Track Relevance";
          return b.track_relevance_score - a.track_relevance_score;
        }
        return 0;
      });

      // Assign 1-indexed rank within track
      trackProg.rankings.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      tracks.push(trackProg);
    });

    const pendingCount = totalSubmissionsCount - totalEvaluatedCount;
    const overallCompletionPct = totalSubmissionsCount > 0
      ? Math.round((totalEvaluatedCount / totalSubmissionsCount) * 100)
      : 0;

    return {
      stats: {
        total_teams: teamList.length,
        total_submissions: totalSubmissionsCount,
        evaluated_submissions: totalEvaluatedCount,
        pending_submissions: pendingCount,
        shortlisted_teams: totalShortlistedCount,
        evaluation_completion_pct: overallCompletionPct,
        results_published: resultsPublished,
        top_shortlist_per_track: topShortlist,
        tracks,
      },
    };
  } catch (err: any) {
    console.error("getAdminDashboardData unexpected error:", err);
    return { stats: null, error: err.message || "Failed to load admin statistics." };
  }
}

// 2. Generate / Update Track-wise Shortlists (Top N per Track)
export async function generateTrackShortlists(
  topNPerTrack: number = 2
): Promise<{ success: boolean; shortlistedCount: number; error?: string }> {
  try {
    const { stats } = await getAdminDashboardData();
    if (!stats) return { success: false, shortlistedCount: 0, error: "Failed to read track rankings." };

    const shortlistRows: any[] = [];
    let count = 0;

    // Reset current shortlists
    await supabase.from("shortlists").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    stats.tracks.forEach((track) => {
      const topTeams = track.rankings.slice(0, topNPerTrack);
      topTeams.forEach((team) => {
        count += 1;
        shortlistRows.push({
          team_id: team.team_id,
          theme_id: team.theme_id,
          rank_in_track: team.rank,
          total_score: team.total_score,
          creativity_score: team.creativity_score,
          impact_score: team.impact_score,
          track_relevance_score: team.track_relevance_score,
          is_shortlisted: true,
          published_at: new Date().toISOString(),
        });
      });
    });

    if (shortlistRows.length > 0) {
      const { error: insertErr } = await supabase
        .from("shortlists")
        .upsert(shortlistRows, { onConflict: "team_id" });

      if (insertErr) {
        console.error("Shortlist upsert error:", insertErr);
        return { success: false, shortlistedCount: 0, error: insertErr.message };
      }
    }

    // Update settings table
    await supabase
      .from("hackathon_settings")
      .update({ top_shortlist_per_track: topNPerTrack })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    return { success: true, shortlistedCount: count };
  } catch (err: any) {
    console.error("generateTrackShortlists error:", err);
    return { success: false, shortlistedCount: 0, error: err.message };
  }
}

// 3. Toggle Results Publication Status
export async function toggleResultsPublication(
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("hackathon_settings")
      .update({ results_published: publish })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Fetch Student Team Round 1 Result Status (Safe for Student Dashboard)
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
      .select("is_shortlisted, rank_in_track")
      .eq("team_id", teamId)
      .maybeSingle();

    return {
      resultsPublished: true,
      isShortlisted: shortlist?.is_shortlisted ?? false,
      rankInTrack: shortlist?.rank_in_track,
    };
  } catch (err) {
    return { resultsPublished: false, isShortlisted: false };
  }
}
