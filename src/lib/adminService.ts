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

// 1. Fetch Complete Admin Dashboard Data via Server API Endpoint
export async function getAdminDashboardData(): Promise<{ stats: AdminStats | null; error?: string }> {
  try {
    const resp = await fetch("/api/admin/dashboard", {
      method: "GET",
    });

    if (resp.ok) {
      const data = await resp.json();
      return { stats: data.stats || null };
    } else {
      const errData = await resp.json();
      return { stats: null, error: errData.error || "Failed to load admin dashboard data" };
    }
  } catch (err: any) {
    console.error("getAdminDashboardData network error:", err);
    return { stats: null, error: err.message || "Failed to connect to admin dashboard server" };
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
