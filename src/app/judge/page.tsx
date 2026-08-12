"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Lock,
  LogOut,
  Shield,
  Sliders,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  JudgeSubmissionView,
  Evaluation,
  JUDGING_CRITERIA,
  getSubmissionsForJudge,
  saveJudgeEvaluation,
} from "@/lib/evaluationService";
import { getSubmissionSignedUrl } from "@/lib/submissionService";
import { getCurrentUserProfile, signInStudent } from "@/lib/teamService";

export default function JudgePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("miraethon.judge@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Judge Data
  const [submissions, setSubmissions] = useState<JudgeSubmissionView[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Active Evaluation Modal
  const [activeModalItem, setActiveModalItem] = useState<JudgeSubmissionView | null>(null);
  const [activeSignedUrl, setActiveSignedUrl] = useState<string | null>(null);
  const [evalScores, setEvalScores] = useState({
    creativity: 0,
    businessProblem: 0,
    technology: 0,
    feasibility: 0,
    impact: 0,
    trackRelevance: 0,
    presentation: 0,
  });
  const [evalComments, setEvalComments] = useState("");
  const [savingEval, setSavingEval] = useState(false);
  const [evalError, setEvalError] = useState("");

  // Check current auth session on mount
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const res = await getCurrentUserProfile();

      if (res.user && res.profile) {
        if (res.role === "judge" || res.role === "admin") {
          setCurrentUser(res.user);
          setProfile(res.profile);
          loadSubmissions(res.user.id, selectedTrack, selectedStatus);
        } else {
          // Student role attempting to access /judge -> Redirect to home page
          router.push("/");
        }
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  // Reload submissions when filters change
  const loadSubmissions = async (judgeId: string, track: string, status: string) => {
    setDataLoading(true);
    const res = await getSubmissionsForJudge(judgeId, track, status);
    if (res.submissions) {
      setSubmissions(res.submissions);
    }
    setDataLoading(false);
  };

  const handleFilterTrackChange = (track: string) => {
    setSelectedTrack(track);
    if (currentUser) {
      loadSubmissions(currentUser.id, track, selectedStatus);
    }
  };

  const handleFilterStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (currentUser) {
      loadSubmissions(currentUser.id, selectedTrack, status);
    }
  };

  // Handle Judge Sign In
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

    if (res.role !== "judge" && res.role !== "admin") {
      setLoginError("Unauthorized access: Student accounts cannot access the Judge Portal.");
      setProfile(null);
      await supabase.auth.signOut();
      setCurrentUser(null);
      return;
    }

    setCurrentUser(res.user);
    setProfile(res.profile);
    loadSubmissions(res.user.id, selectedTrack, selectedStatus);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
    setSubmissions([]);
  };

  // Open Evaluation Modal for a Submission
  const handleOpenEvaluation = async (item: JudgeSubmissionView) => {
    setActiveModalItem(item);
    setEvalError("");
    setActiveSignedUrl(null);

    // Initialize scores if evaluation exists
    if (item.evaluation) {
      setEvalScores({
        creativity: Number(item.evaluation.creativity_score || 0),
        businessProblem: Number(item.evaluation.business_problem_score || 0),
        technology: Number(item.evaluation.technology_score || 0),
        feasibility: Number(item.evaluation.feasibility_score || 0),
        impact: Number(item.evaluation.impact_score || 0),
        trackRelevance: Number(item.evaluation.track_relevance_score || 0),
        presentation: Number(item.evaluation.presentation_score || 0),
      });
      setEvalComments(item.evaluation.comments || "");
    } else {
      setEvalScores({
        creativity: 0,
        businessProblem: 0,
        technology: 0,
        feasibility: 0,
        impact: 0,
        trackRelevance: 0,
        presentation: 0,
      });
      setEvalComments("");
    }

    // Fetch signed URL for downloading submission file
    if (item.file_path) {
      const url = await getSubmissionSignedUrl(item.file_path);
      setActiveSignedUrl(url);
    }
  };

  // Calculate live total score
  const totalScore = Number(
    (
      evalScores.creativity +
      evalScores.businessProblem +
      evalScores.technology +
      evalScores.feasibility +
      evalScores.impact +
      evalScores.trackRelevance +
      evalScores.presentation
    ).toFixed(2)
  );

  // Submit Evaluation
  const handleSaveEvaluation = async (status: "draft" | "submitted") => {
    if (!activeModalItem || !currentUser) return;
    setEvalError("");
    setSavingEval(true);

    const payload: Evaluation = {
      submission_id: activeModalItem.submission_id,
      team_id: activeModalItem.team_id,
      judge_id: currentUser.id,
      creativity_score: evalScores.creativity,
      business_problem_score: evalScores.businessProblem,
      technology_score: evalScores.technology,
      feasibility_score: evalScores.feasibility,
      impact_score: evalScores.impact,
      track_relevance_score: evalScores.trackRelevance,
      presentation_score: evalScores.presentation,
      total_score: totalScore,
      comments: evalComments.trim(),
      status: status,
    };

    const res = await saveJudgeEvaluation(payload);
    setSavingEval(false);

    if (res.error) {
      setEvalError(`Failed to save evaluation: ${res.error}`);
    } else {
      setActiveModalItem(null);
      loadSubmissions(currentUser.id, selectedTrack, selectedStatus);
    }
  };

  // Stats calculation
  const totalSubmissionsCount = submissions.length;
  const evaluatedCount = submissions.filter((s) => s.evaluation && s.evaluation.status === "submitted").length;
  const pendingCount = totalSubmissionsCount - evaluatedCount;
  const completionPct = totalSubmissionsCount > 0 ? Math.round((evaluatedCount / totalSubmissionsCount) * 100) : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3 font-mono">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-cyan-300">Loading Judge Portal...</span>
        </div>
      </div>
    );
  }

  // 1. JUDGE LOGIN VIEW
  if (!currentUser || (profile?.role !== "judge" && profile?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#05050a] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(138,43,226,0.3)] relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-[10px] uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>JUDICIAL EVALUATION PORTAL</span>
            </div>
            <h1 className="text-2xl font-black font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500">
              MIRAETHON 2026
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Sign in with your official Judge credentials
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
                Judge Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="miraethon.judge@gmail.com"
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
              className="w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2"
            >
              {isSubmittingAuth ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>ENTER JUDGE DASHBOARD</span>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN JUDGE DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-[#05050a] text-white py-8 px-4 sm:px-8 font-sans relative select-none">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-purple-500/20 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-mono uppercase tracking-tight text-white">
              ROUND 1 — EVALUATION DASHBOARD
            </h1>
            <p className="text-xs font-mono text-cyan-400">
              Evaluator: {profile?.full_name || currentUser.email} ({profile?.role || "Judge"})
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 font-mono text-xs uppercase tracking-wider transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Statistics Banner */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">
              TOTAL SUBMISSIONS
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
              {totalSubmissionsCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              EVALUATED
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {evaluatedCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              PENDING
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {pendingCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-pink-500/30 backdrop-blur-md">
            <div className="text-xs font-mono text-pink-400 uppercase tracking-wider mb-1">
              COMPLETION
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-pink-400">
              {completionPct}%
            </div>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/70 border border-purple-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            <Filter className="w-4 h-4" />
            <span>FILTER SUBMISSIONS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => handleFilterTrackChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-black/80 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">ALL TRACKS</option>
              <option value="retail-real-estate">01 — RETAIL & REAL ESTATE</option>
              <option value="finance-investments">02 — FINANCE & INVESTMENTS</option>
              <option value="health-wellness">03 — HEALTH & WELLNESS</option>
              <option value="travel-food">04 — TRAVEL & FOOD</option>
              <option value="sports-fitness">05 — SPORTS & FITNESS</option>
              <option value="music-ott">06 — MUSIC & OTT</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterStatusChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-black/80 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">ALL STATUSES</option>
              <option value="pending">PENDING EVALUATION</option>
              <option value="evaluated">EVALUATED</option>
            </select>
          </div>
        </section>

        {/* Submissions List / Grid */}
        <section>
          {dataLoading ? (
            <div className="py-16 text-center font-mono text-xs text-cyan-300 animate-pulse">
              Loading submissions data...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs text-gray-400 rounded-2xl border border-dashed border-purple-500/20 bg-black/40">
              No submissions found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {submissions.map((item) => {
                const isEvaluated = item.evaluation && item.evaluation.status === "submitted";
                return (
                  <div
                    key={item.submission_id}
                    className={`p-5 rounded-2xl bg-black/80 border transition-all duration-300 flex flex-col justify-between ${
                      isEvaluated
                        ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        : "border-purple-500/30 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(138,43,226,0.2)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                          {item.theme_name}
                        </span>
                        {isEvaluated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] uppercase font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>{item.evaluation?.total_score} / 100</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[10px] uppercase font-bold">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-mono text-white mb-1">
                        {item.team_name}
                      </h3>
                      <div className="text-xs font-mono text-gray-400 mb-3">
                        CODE: <span className="text-cyan-300">{item.team_code}</span> • MEMBERS: {item.members_count}
                      </div>

                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs font-mono space-y-1 mb-4">
                        <div className="text-gray-300 truncate">
                          📄 {item.file_name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Submitted: {new Date(item.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEvaluation(item)}
                      className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isEvaluated
                          ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80"
                          : "bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                      }`}
                    >
                      <span>{isEvaluated ? "EDIT MARKS" : "EVALUATE SUBMISSION"}</span>
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 3. OFFICIAL 100-POINT JUDGING EVALUATION MODAL */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#080614] border border-purple-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(138,43,226,0.4)] relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-[10px] uppercase tracking-widest mb-2">
                  <span>{activeModalItem.theme_name}</span>
                </div>
                <h2 className="text-2xl font-black font-mono text-white">
                  EVALUATE: {activeModalItem.team_name}
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  Team Code: <span className="text-cyan-300">{activeModalItem.team_code}</span>
                </p>
              </div>

              {/* Download File & Team Info */}
              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="text-xs font-mono">
                  <div className="text-cyan-300 font-bold">FILE: {activeModalItem.file_name}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5">
                    Submitted: {new Date(activeModalItem.submitted_at).toLocaleString()}
                  </div>
                </div>

                {activeSignedUrl ? (
                  <a
                    href={activeSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <Download className="w-4 h-4" />
                    <span>OPEN / DOWNLOAD PPT</span>
                  </a>
                ) : (
                  <span className="text-xs font-mono text-gray-400 animate-pulse">
                    Preparing download link...
                  </span>
                )}
              </div>

              {evalError && (
                <div className="mb-6 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono text-center">
                  {evalError}
                </div>
              )}

              {/* Official 100-Point Criteria Form */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                  <h3 className="font-mono text-sm font-bold text-cyan-300 uppercase tracking-wider">
                    OFFICIAL JUDGING CRITERIA (100 MARKS TOTAL)
                  </h3>
                  <div className="font-mono text-lg font-black text-pink-400">
                    TOTAL: <span className="text-white">{totalScore}</span> / 100
                  </div>
                </div>

                {/* 1. Creativity & Innovation (35) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>1. Creativity & Innovation (35 marks - Primary Tie-Breaker)</span>
                    <span className="text-cyan-400">{evalScores.creativity} / 35</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="0.5"
                    value={evalScores.creativity}
                    onChange={(e) => setEvalScores({ ...evalScores, creativity: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 2. Business Problem & Relevance (15) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>2. Business Problem & Relevance (15 marks)</span>
                    <span className="text-cyan-400">{evalScores.businessProblem} / 15</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={evalScores.businessProblem}
                    onChange={(e) => setEvalScores({ ...evalScores, businessProblem: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 3. AI / Technology Application (15) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>3. AI / Technology Application (15 marks)</span>
                    <span className="text-cyan-400">{evalScores.technology} / 15</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={evalScores.technology}
                    onChange={(e) => setEvalScores({ ...evalScores, technology: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 4. Feasibility & Execution Potential (10) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>4. Feasibility & Execution Potential (10 marks)</span>
                    <span className="text-cyan-400">{evalScores.feasibility} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={evalScores.feasibility}
                    onChange={(e) => setEvalScores({ ...evalScores, feasibility: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 5. Business Impact & Scalability (10) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>5. Business Impact & Scalability (10 marks - 2nd Tie-Breaker)</span>
                    <span className="text-cyan-400">{evalScores.impact} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={evalScores.impact}
                    onChange={(e) => setEvalScores({ ...evalScores, impact: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 6. Track Relevance (10) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>6. Track Relevance (10 marks - 3rd Tie-Breaker)</span>
                    <span className="text-cyan-400">{evalScores.trackRelevance} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={evalScores.trackRelevance}
                    onChange={(e) => setEvalScores({ ...evalScores, trackRelevance: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 7. Presentation & Clarity (5) */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1 font-mono text-xs font-bold text-white">
                    <span>7. Presentation & Clarity (5 marks)</span>
                    <span className="text-cyan-400">{evalScores.presentation} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={evalScores.presentation}
                    onChange={(e) => setEvalScores({ ...evalScores, presentation: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Judge Comments */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    JUDGE COMMENTS & FEEDBACK (FOR ADMIN REVIEW)
                  </label>
                  <textarea
                    rows={3}
                    value={evalComments}
                    onChange={(e) => setEvalComments(e.target.value)}
                    placeholder="Provide constructive feedback regarding the idea's creativity, feasibility, and technical application..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-xs font-mono"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => handleSaveEvaluation("draft")}
                    disabled={savingEval}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    SAVE DRAFT
                  </button>

                  <button
                    onClick={() => handleSaveEvaluation("submitted")}
                    disabled={savingEval}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(138,43,226,0.6)] flex items-center justify-center gap-2"
                  >
                    {savingEval ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>SUBMIT EVALUATION</span>
                        <CheckCircle className="w-4 h-4 text-cyan-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
