"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Globe,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  AdminStats,
  TrackProgress,
  TrackRankEntry,
  getAdminDashboardData,
  generateTrackShortlists,
  toggleResultsPublication,
} from "@/lib/adminService";
import { getSubmissionSignedUrl } from "@/lib/submissionService";
import { getCurrentUserProfile, signInStudent } from "@/lib/teamService";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("miraethon.admin@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Admin Dashboard State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "judges" | "shortlists" | "settings">("overview");

  // Track & Status Filters for Submissions Tab
  const [submissionTrackFilter, setSubmissionTrackFilter] = useState("all");

  // Shortlisting Controls State
  const [topNShortlist, setTopNShortlist] = useState<number>(2);
  const [shortlistMsg, setShortlistMsg] = useState<string>("");
  const [shortlistingLoading, setShortlistingLoading] = useState(false);

  // Judge Creation Form State
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [newJudgePassword, setNewJudgePassword] = useState("");
  const [newJudgeName, setNewJudgeName] = useState("");
  const [createJudgeMsg, setCreateJudgeMsg] = useState("");
  const [creatingJudge, setCreatingJudge] = useState(false);

  // Signed URL Cache
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const res = await getCurrentUserProfile();

      if (res.user && res.profile) {
        if (res.role === "admin") {
          setCurrentUser(res.user);
          setProfile(res.profile);
          loadDashboardData();
        } else if (res.role === "judge") {
          router.push("/judge");
        } else {
          router.push("/");
        }
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  const loadDashboardData = async () => {
    setLoadingStats(true);
    const res = await getAdminDashboardData();
    if (res.stats) {
      setStats(res.stats);
      setTopNShortlist(res.stats.top_shortlist_per_track || 2);
    }
    setLoadingStats(false);
  };

  // Handle Admin Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingAuth(true);

    const res = await signInStudent(loginEmail.trim(), loginPassword);
    setIsSubmittingAuth(false);

    if (res.error || !res.user || !res.profile) {
      setLoginError(res.error || "Invalid credentials. Please try again.");
      return;
    }

    if (res.role !== "admin") {
      setLoginError("Unauthorized access: You do not have Admin permissions.");
      setProfile(null);
      await supabase.auth.signOut();
      setCurrentUser(null);
      return;
    }

    setCurrentUser(res.user);
    setProfile(res.profile);
    loadDashboardData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
    setStats(null);
  };

  // Generate / Update Shortlists
  const handleGenerateShortlists = async () => {
    setShortlistMsg("");
    setShortlistingLoading(true);
    const res = await generateTrackShortlists(topNShortlist);
    setShortlistingLoading(false);

    if (res.error) {
      setShortlistMsg(`Shortlisting failed: ${res.error}`);
    } else {
      setShortlistMsg(`Successfully shortlisted Top ${topNShortlist} teams across all 6 tracks (${res.shortlistedCount} teams total)!`);
      loadDashboardData();
    }
  };

  // Toggle Results Publication
  const handleTogglePublication = async (publish: boolean) => {
    const res = await toggleResultsPublication(publish);
    if (res.success) {
      loadDashboardData();
    } else {
      alert(`Publication toggle failed: ${res.error}`);
    }
  };

  // Create Judge Account via API
  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateJudgeMsg("");
    if (!newJudgeEmail.trim() || !newJudgePassword) {
      setCreateJudgeMsg("Please enter email and password for the judge account.");
      return;
    }

    setCreatingJudge(true);
    try {
      const resp = await fetch("/api/admin/create-judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newJudgeEmail.trim(),
          password: newJudgePassword,
          fullName: newJudgeName.trim() || "Miraethon Judge",
        }),
      });

      const resData = await resp.json();
      setCreatingJudge(false);

      if (resp.ok && resData.success) {
        setCreateJudgeMsg(`Judge account created successfully: ${resData.user.email}`);
        setNewJudgeEmail("");
        setNewJudgePassword("");
        setNewJudgeName("");
      } else {
        setCreateJudgeMsg(`Failed to create judge: ${resData.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setCreatingJudge(false);
      setCreateJudgeMsg(`Error: ${err.message}`);
    }
  };

  // Fetch signed URL for submission file
  const handleDownloadFile = async (filePath: string) => {
    if (signedUrls[filePath]) {
      window.open(signedUrls[filePath], "_blank");
      return;
    }
    const url = await getSubmissionSignedUrl(filePath);
    if (url) {
      setSignedUrls((prev) => ({ ...prev, [filePath]: url }));
      window.open(url, "_blank");
    } else {
      alert("Failed to generate secure download link.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-cyan-300">Loading Admin Command Center...</span>
        </div>
      </div>
    );
  }

  // 1. ADMIN LOGIN VIEW
  if (!currentUser || profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#05050a] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(138,43,226,0.4)] relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-[10px] uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl font-black font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500">
              MIRAETHON 2026
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Sign in with your official Admin credentials
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="miraethon.admin@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(138,43,226,0.6)] flex items-center justify-center gap-2"
            >
              {isSubmittingAuth ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>ENTER ADMIN PANEL</span>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-[#05050a] text-white py-8 px-4 sm:px-8 font-sans relative select-none">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[350px] bg-purple-900/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-purple-500/20 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-cyan-400 to-pink-500 p-0.5 shadow-[0_0_20px_rgba(138,43,226,0.5)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-mono uppercase tracking-tight text-white">
              MIRAETHON 2026 — ADMIN COMMAND CENTER
            </h1>
            <p className="text-xs font-mono text-cyan-400">
              Administrator: {profile?.full_name || currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loadingStats}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-cyan-300 hover:bg-purple-900/60 font-mono text-xs uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Overview Stats Cards */}
        {stats && (
          <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md">
              <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                REGISTERED TEAMS
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {stats.total_teams}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 backdrop-blur-md">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                SUBMISSIONS
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                {stats.total_submissions}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                EVALUATED
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {stats.evaluated_submissions}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md">
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                PENDING
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {stats.pending_submissions}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-pink-500/30 backdrop-blur-md">
              <div className="text-[11px] font-mono text-pink-400 uppercase tracking-wider mb-1">
                SHORTLISTED
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-pink-400">
                {stats.shortlisted_teams}
              </div>
            </div>
          </section>
        )}

        {/* Tab Navigation */}
        <section className="flex flex-wrap items-center gap-2 border-b border-purple-500/20 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                : "bg-black/60 border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            OVERVIEW & TRACK PROGRESS
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "submissions"
                ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                : "bg-black/60 border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            ALL SUBMISSIONS & TEAMS
          </button>

          <button
            onClick={() => setActiveTab("shortlists")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "shortlists"
                ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                : "bg-black/60 border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            TRACK-WISE RANKING & SHORTLISTING
          </button>

          <button
            onClick={() => setActiveTab("judges")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "judges"
                ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                : "bg-black/60 border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            JUDGE MANAGEMENT
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                : "bg-black/60 border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            RESULTS PUBLICATION
          </button>
        </section>

        {/* TAB 1: OVERVIEW & TRACK PROGRESS BREAKDOWN */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-mono uppercase text-cyan-300 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>EVALUATION PROGRESS BY TRACK (6 TRACKS)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stats.tracks.map((track) => (
                <div
                  key={track.theme_id}
                  className="p-5 rounded-2xl bg-black/80 border border-purple-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(138,43,226,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white uppercase mb-2">
                      {track.theme_name}
                    </h3>

                    <div className="space-y-1.5 text-xs font-mono text-gray-300 mb-4">
                      <div className="flex justify-between">
                        <span>Total Teams Registered:</span>
                        <span className="text-white font-bold">{track.total_teams}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Submissions Uploaded:</span>
                        <span className="text-cyan-300 font-bold">{track.total_submissions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evaluated:</span>
                        <span className="text-emerald-400 font-bold">
                          {track.evaluated_count} / {track.total_submissions}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>EVALUATION STATUS</span>
                      <span className="text-cyan-400">{track.completion_pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-purple-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${track.completion_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ALL SUBMISSIONS & TEAMS */}
        {activeTab === "submissions" && stats && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-bold font-mono uppercase text-cyan-300">
                REGISTERED TEAMS & ROUND 1 SUBMISSIONS
              </h2>

              <select
                value={submissionTrackFilter}
                onChange={(e) => setSubmissionTrackFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-black/80 border border-purple-500/40 text-white font-mono text-xs focus:outline-none"
              >
                <option value="all">ALL TRACKS</option>
                {stats.tracks.map((t) => (
                  <option key={t.theme_id} value={t.theme_id}>
                    {t.theme_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {stats.tracks
                .filter((t) => submissionTrackFilter === "all" || t.theme_id === submissionTrackFilter)
                .map((track) => (
                  <div key={track.theme_id} className="p-5 rounded-2xl bg-black/80 border border-purple-500/30">
                    <h3 className="text-md font-bold font-mono text-cyan-300 uppercase mb-4">
                      {track.theme_name} ({track.rankings.length} Submissions)
                    </h3>

                    {track.rankings.length === 0 ? (
                      <div className="text-xs font-mono text-gray-400 py-3 text-center">
                        No submissions uploaded yet for this track.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-purple-500/20 text-gray-400 uppercase">
                              <th className="py-2 px-3">Team Name</th>
                              <th className="py-2 px-3">Code</th>
                              <th className="py-2 px-3">File Name</th>
                              <th className="py-2 px-3">Score</th>
                              <th className="py-2 px-3">Shortlisted</th>
                              <th className="py-2 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-500/10">
                            {track.rankings.map((item) => (
                              <tr key={item.team_id} className="hover:bg-purple-950/20">
                                <td className="py-3 px-3 font-bold text-white">{item.team_name}</td>
                                <td className="py-3 px-3 text-cyan-400">{item.team_code}</td>
                                <td className="py-3 px-3 text-gray-300 truncate max-w-[200px]">
                                  {item.file_name || "—"}
                                </td>
                                <td className="py-3 px-3 text-emerald-400 font-bold">
                                  {item.evaluation_count > 0 ? `${item.total_score} / 100` : "Pending"}
                                </td>
                                <td className="py-3 px-3">
                                  {item.is_shortlisted ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                                      YES
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 text-[10px]">NO</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {item.file_path && (
                                    <button
                                      onClick={() => handleDownloadFile(item.file_path!)}
                                      className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-900 text-[10px] uppercase font-bold"
                                    >
                                      DOWNLOAD PPT
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: TRACK-WISE RANKING & SHORTLISTING */}
        {activeTab === "shortlists" && stats && (
          <div className="space-y-6">
            {/* Shortlisting Config Box */}
            <div className="p-6 rounded-2xl bg-black/80 border border-purple-500/40 shadow-[0_0_25px_rgba(138,43,226,0.3)]">
              <h2 className="text-lg font-bold font-mono uppercase text-pink-400 mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>TRACK-WISE LEADERBOARDS & SHORTLISTING ENGINE</span>
              </h2>
              <p className="text-xs font-mono text-gray-400 mb-4">
                Round 1 teams are ranked separately within each of the 6 tracks using official tie-breakers (Creativity &gt; Impact &gt; Track Relevance).
              </p>

              {shortlistMsg && (
                <div className="mb-4 p-3 rounded-xl bg-purple-950/80 border border-purple-500/50 text-cyan-300 text-xs font-mono">
                  {shortlistMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono uppercase text-gray-300">
                    SHORTLIST PER TRACK:
                  </label>
                  <select
                    value={topNShortlist}
                    onChange={(e) => setTopNShortlist(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-black border border-purple-500/50 text-cyan-300 font-mono text-xs font-bold"
                  >
                    <option value={1}>TOP 1 PER TRACK</option>
                    <option value={2}>TOP 2 PER TRACK</option>
                    <option value={3}>TOP 3 PER TRACK</option>
                    <option value={4}>TOP 4 PER TRACK</option>
                    <option value={5}>TOP 5 PER TRACK</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateShortlists}
                  disabled={shortlistingLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(255,46,136,0.4)] flex items-center justify-center gap-2"
                >
                  {shortlistingLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>GENERATE TRACK SHORTLISTS</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 6 Track Leaderboards */}
            <div className="space-y-6">
              {stats.tracks.map((track) => (
                <div key={track.theme_id} className="p-6 rounded-2xl bg-black/80 border border-purple-500/30">
                  <div className="flex items-center justify-between gap-2 mb-4 border-b border-purple-500/20 pb-3">
                    <h3 className="text-base font-bold font-mono text-cyan-300 uppercase">
                      🏆 {track.theme_name} LEADERBOARD
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      Evaluated: {track.evaluated_count} / {track.total_submissions}
                    </span>
                  </div>

                  {track.rankings.length === 0 ? (
                    <div className="text-xs font-mono text-gray-400 py-4 text-center">
                      No submissions to rank yet in this track.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {track.rankings.map((team) => (
                        <div
                          key={team.team_id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                            team.is_shortlisted
                              ? "bg-gradient-to-r from-purple-950/80 to-pink-950/60 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                              : "bg-black/60 border-purple-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm ${
                                team.rank === 1
                                  ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                                  : team.rank === 2
                                  ? "bg-gray-300 text-black"
                                  : team.rank === 3
                                  ? "bg-amber-700 text-white"
                                  : "bg-purple-950 text-cyan-300 border border-purple-500/40"
                              }`}
                            >
                              #{team.rank}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-mono text-sm font-bold text-white">
                                  {team.team_name}
                                </h4>
                                {team.is_shortlisted && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider">
                                    ★ SHORTLISTED
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                Code: <span className="text-cyan-300">{team.team_code}</span>
                                {team.tie_breaker_note && (
                                  <span className="text-amber-400/90 ml-2 font-semibold">
                                    ({team.tie_breaker_note})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="text-right">
                              <div className="text-[10px] text-gray-400 uppercase">SCORE</div>
                              <div className="text-sm font-black text-emerald-400">
                                {team.total_score} / 100
                              </div>
                            </div>

                            <div className="text-right border-l border-purple-500/20 pl-3">
                              <div className="text-[9px] text-gray-400">Creativity: {team.creativity_score}/35</div>
                              <div className="text-[9px] text-gray-400">Impact: {team.impact_score}/10</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: JUDGE MANAGEMENT */}
        {activeTab === "judges" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-black/80 border border-purple-500/40 shadow-[0_0_25px_rgba(138,43,226,0.3)]">
              <h2 className="text-lg font-bold font-mono uppercase text-cyan-300 mb-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>OFFICIAL JUDGE ACCOUNTS & MANAGEMENT</span>
              </h2>
              <p className="text-xs font-mono text-gray-400 mb-6">
                Active judges can log in at <span className="text-cyan-300">/judge</span> to evaluate Round 1 submissions.
              </p>

              {createJudgeMsg && (
                <div className="mb-4 p-3 rounded-xl bg-purple-950/80 border border-purple-500/50 text-cyan-300 text-xs font-mono">
                  {createJudgeMsg}
                </div>
              )}

              <form onSubmit={handleCreateJudge} className="space-y-4 max-w-lg">
                <h3 className="text-xs font-mono uppercase font-bold text-pink-400">
                  CREATE / ACTIVATE NEW JUDGE ACCOUNT:
                </h3>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Judge Display Name
                  </label>
                  <input
                    type="text"
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    placeholder="e.g. Dr. Vinayak Rao (Judge)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Judge Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newJudgeEmail}
                    onChange={(e) => setNewJudgeEmail(e.target.value)}
                    placeholder="miraethon.judge@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newJudgePassword}
                    onChange={(e) => setNewJudgePassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingJudge}
                  className="px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 flex items-center gap-2"
                >
                  {creatingJudge ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>ACTIVATE JUDGE ACCOUNT</span>
                      <UserPlus className="w-4 h-4 text-cyan-300" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: RESULTS PUBLICATION */}
        {activeTab === "settings" && stats && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-black/80 border border-purple-500/40 shadow-[0_0_25px_rgba(138,43,226,0.3)]">
              <h2 className="text-lg font-bold font-mono uppercase text-cyan-300 mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-pink-400" />
                <span>ROUND 1 RESULT PUBLICATION CONTROL</span>
              </h2>
              <p className="text-xs font-mono text-gray-400 mb-6">
                Toggle whether students can view their team&apos;s Round 1 final qualification result on their team dashboard.
              </p>

              <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-sm font-bold text-white mb-1">
                    CURRENT PUBLICATION STATUS:
                  </div>
                  <div className="font-mono text-xs">
                    {stats.results_published ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        PUBLISHED — Students can view their team&apos;s Round 1 qualification status
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4" />
                        DRAFT — Results are hidden from students (&quot;Evaluation in progress&quot;)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleTogglePublication(!stats.results_published)}
                  className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    stats.results_published
                      ? "bg-amber-950/80 border border-amber-500 text-amber-300 hover:bg-amber-900"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  }`}
                >
                  <span>{stats.results_published ? "UNPUBLISH RESULTS" : "PUBLISH RESULTS NOW"}</span>
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
