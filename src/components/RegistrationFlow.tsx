"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  PlusCircle,
  LogIn,
  UserPlus,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  Download,
  FileText,
  UploadCloud,
  CheckCircle,
  Clock,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import VideoBackground from "./VideoBackground";
import {
  Profile,
  Team,
  ThemeTrack,
  THEME_TRACKS,
  signUpStudent,
  signInStudent,
  createTeam,
  joinTeamByCode,
  getUserTeam,
  getHackathonSettings,
  fetchThemes,
  isDeadlinePassed,
  getCurrentUserProfile,
} from "@/lib/teamService";
import {
  Submission,
  getTeamSubmission,
  uploadSubmission,
} from "@/lib/submissionService";
import { getStudentTeamResult } from "@/lib/adminService";

type Step =
  | "CHOICE"
  | "SIGNUP"
  | "LOGIN"
  | "TEAM_CHOICE"
  | "CREATE_TEAM"
  | "JOIN_TEAM"
  | "TEAM_SUCCESS"
  | "DASHBOARD";

export default function RegistrationFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("CHOICE");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  // Forms
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [teamName, setTeamName] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<ThemeTrack>(THEME_TRACKS[0]);

  const [joinCode, setJoinCode] = useState("");
  const [previewTeam, setPreviewTeam] = useState<Team | null>(null);

  // Active Team & Members
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeTrack | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState("2026-08-28T23:59:59+05:30");
  const [deadlinePassedState, setDeadlinePassedState] = useState(false);
  const [dbThemes, setDbThemes] = useState<ThemeTrack[]>(THEME_TRACKS);

  // Round 1 Submission State
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionSignedUrl, setSubmissionSignedUrl] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [resultStatus, setResultStatus] = useState<{
    resultsPublished: boolean;
    isShortlisted: boolean;
    rankInTrack?: number;
  }>({ resultsPublished: false, isShortlisted: false });

  useEffect(() => {
    getHackathonSettings().then((s) => {
      setIsRegistrationOpen(s.registration_open);
      if (s.registration_deadline) {
        setRegistrationDeadline(s.registration_deadline);
        setDeadlinePassedState(isDeadlinePassed(s.registration_deadline));
      }
    });

    fetchThemes().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setDbThemes(fetched);
        setSelectedTrack(fetched[0]);
      }
    });

    // Initial Auth & Role Check directly from database (Single Source of Truth)
    getCurrentUserProfile().then(async (res) => {
      if (res.user && res.profile) {
        setCurrentUser(res.user);
        setCurrentProfile(res.profile);

        if (res.role === "admin") {
          router.push("/admin");
        } else if (res.role === "judge") {
          router.push("/judge");
        } else {
          // Student role -> Check squad membership
          const teamRes = await getUserTeam(res.user.id);
          if (teamRes.team) {
            setActiveTeam(teamRes.team);
            setTeamMembers(teamRes.members);
            setActiveTheme(teamRes.theme || THEME_TRACKS[0]);
            setStep("DASHBOARD");
          }
        }
      }
    });
  }, [router]);

  // Fetch Team Submission & Results whenever active team changes
  const loadSubmissionData = async (teamId: string) => {
    const subRes = await getTeamSubmission(teamId);
    setSubmission(subRes.submission);
    setSubmissionSignedUrl(subRes.signedUrl);

    const resStatus = await getStudentTeamResult(teamId);
    setResultStatus(resStatus);
  };

  useEffect(() => {
    if (activeTeam && step === "DASHBOARD") {
      loadSubmissionData(activeTeam.id);
    }
  }, [activeTeam, step]);

  // Handle Account Signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (deadlinePassedState) {
      setErrorMsg("Registrations for Miraethon 2026 closed on 28 August 2026.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await signUpStudent(fullName.trim(), email.trim(), password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setCurrentUser(res.user);
      setCurrentProfile(res.profile);
      setStep("TEAM_CHOICE");
    }
  };

  // Handle Account Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);
    const res = await signInStudent(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setCurrentUser(res.user);
      setCurrentProfile(res.profile);

      // Route based on Database Profile Role (Single Source of Truth)
      if (res.role === "admin") {
        router.push("/admin");
      } else if (res.role === "judge") {
        router.push("/judge");
      } else {
        // Student role -> Check squad membership
        setLoading(true);
        const teamRes = await getUserTeam(res.user.id);
        setLoading(false);

        if (teamRes.team) {
          setActiveTeam(teamRes.team);
          setTeamMembers(teamRes.members);
          setActiveTheme(teamRes.theme || THEME_TRACKS[0]);
          setStep("DASHBOARD");
        } else {
          setStep("TEAM_CHOICE");
        }
      }
    }
  };

  // Handle Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (deadlinePassedState) {
      setErrorMsg("Team creation closed on 28 August 2026.");
      return;
    }

    if (!teamName.trim()) {
      setErrorMsg("Please enter a team name.");
      return;
    }

    if (!currentProfile) {
      setErrorMsg("User session invalid. Please log in again.");
      return;
    }

    setLoading(true);
    const res = await createTeam(currentProfile.id, teamName.trim(), selectedTrack.id);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.team) {
      setActiveTeam(res.team);
      setActiveTheme(selectedTrack);
      setTeamMembers([{ id: "1", user_id: currentProfile.id, member_role: "leader", profile: currentProfile }]);
      setStep("TEAM_SUCCESS");
    }
  };

  // Handle Join Team
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (deadlinePassedState) {
      setErrorMsg("Team joining closed on 28 August 2026.");
      return;
    }

    if (!joinCode.trim()) {
      setErrorMsg("Please enter a valid Team Code.");
      return;
    }

    if (!currentProfile) {
      setErrorMsg("User session invalid. Please log in again.");
      return;
    }

    setLoading(true);
    const res = await joinTeamByCode(currentProfile.id, joinCode.trim());
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.team) {
      setActiveTeam(res.team);
      const full = await getUserTeam(currentProfile.id);
      setTeamMembers(full.members);
      setActiveTheme(full.theme || THEME_TRACKS[0]);
      setStep("DASHBOARD");
    }
  };

  // Handle Round 1 Submission Upload (Leader Only)
  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!submissionFile) {
      setUploadError("Please select a .pptx, .ppt, or .pdf file to upload.");
      return;
    }

    if (!activeTeam || !currentProfile) return;

    setUploadingSubmission(true);
    const res = await uploadSubmission(activeTeam.id, currentProfile.id, submissionFile);
    setUploadingSubmission(false);

    if (res.error) {
      setUploadError(res.error);
    } else if (res.submission) {
      setUploadSuccess("Round 1 Idea Submission uploaded successfully!");
      setSubmissionFile(null);
      loadSubmissionData(activeTeam.id);
    }
  };

  const copyCode = () => {
    if (activeTeam?.team_code) {
      navigator.clipboard.writeText(activeTeam.team_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const isLeader = activeTeam && currentProfile && activeTeam.leader_id === currentProfile.id;

  return (
    <section id="register" className="w-full py-16 sm:py-24 px-3 sm:px-6 relative z-10 select-none overflow-hidden max-w-full">
      <VideoBackground />

      <div className="max-w-4xl mx-auto relative z-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-cyan-300 font-mono text-xs tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(138,43,226,0.3)] backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>MIRAETHON 2026 — REGISTRATION & SUBMISSION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500">
            ENTER THE HACKATHON RIFT
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400 font-sans max-w-xl mx-auto">
            Assemble your team, select your track, download the template, and submit your Round 1 idea.
          </p>
        </div>

        {/* Global Error Alert Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Main Flow Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-black/80 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(138,43,226,0.3)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: CHOICE */}
            {step === "CHOICE" && (
              <motion.div
                key="CHOICE"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-mono uppercase text-white">
                    WELCOME TO MIRAETHON 2026
                  </h3>
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    // Choose your access path to continue
                  </p>
                </div>

                {deadlinePassedState ? (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs font-mono">
                    ⚠️ REGISTRATION IS CLOSED (Deadline: 28 August 2026). Existing students can log in to view squad submissions and results.
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto pt-2">
                  {!deadlinePassedState && (
                    <button
                      onClick={() => {
                        setErrorMsg("");
                        setStep("SIGNUP");
                      }}
                      className="p-6 rounded-2xl bg-black/60 border border-purple-500/50 hover:border-cyan-400 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group"
                    >
                      <UserPlus className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                        NEW STUDENT REGISTRATION
                      </span>
                      <span className="text-xs text-gray-400 font-sans">
                        Create student account &amp; team
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("LOGIN");
                    }}
                    className={`p-6 rounded-2xl bg-black/60 border border-purple-500/50 hover:border-pink-400 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group ${
                      deadlinePassedState ? "sm:col-span-2 max-w-xs mx-auto" : ""
                    }`}
                  >
                    <LogIn className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      EXISTING STUDENT LOGIN
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      Access squad dashboard &amp; submission
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SIGNUP FORM */}
            {step === "SIGNUP" && (
              <motion.div
                key="SIGNUP"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-cyan-300">
                    CREATE STUDENT ACCOUNT
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Enter your details for Miraethon 2026
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">College Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@srinivas.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(138,43,226,0.6)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>CREATE ACCOUNT &amp; PROCEED</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("CHOICE");
                    }}
                    className="text-xs font-mono text-gray-400 hover:text-white underline"
                  >
                    Back to choices
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LOGIN FORM */}
            {step === "LOGIN" && (
              <motion.div
                key="LOGIN"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-pink-300">
                    STUDENT LOGIN
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Enter your email &amp; password to access squad
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="student@srinivas.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>ENTER MIRAETHON</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("CHOICE");
                    }}
                    className="text-xs font-mono text-gray-400 hover:text-white underline"
                  >
                    Back to choices
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: TEAM CHOICE */}
            {step === "TEAM_CHOICE" && (
              <motion.div
                key="TEAM_CHOICE"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-mono uppercase text-cyan-300">
                    WELCOME, {currentProfile?.full_name || "STUDENT"}
                  </h3>
                  <p className="text-xs font-mono text-purple-300 uppercase tracking-widest">
                    // Choose your team assembly path
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto pt-2">
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("CREATE_TEAM");
                    }}
                    className="p-6 rounded-2xl bg-black/60 border border-purple-500/50 hover:border-cyan-400 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group"
                  >
                    <PlusCircle className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      CREATE A SQUAD
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      Become Team Leader &amp; select track
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("JOIN_TEAM");
                    }}
                    className="p-6 rounded-2xl bg-black/60 border border-purple-500/50 hover:border-pink-400 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group"
                  >
                    <Users className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      JOIN EXISTING TEAM
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      Enter Team Code (MIRA26-XXXX)
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: CREATE TEAM FORM */}
            {step === "CREATE_TEAM" && (
              <motion.div
                key="CREATE_TEAM"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-cyan-300">
                    CREATE YOUR SQUAD
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Enter squad details &amp; select 1 innovation world
                  </p>
                </div>

                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Team / Squad Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NeuralForge"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-cyan-400 mb-3 font-bold">
                      CHOOSE YOUR WORLD (Select 1 Track):
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {dbThemes.map((track) => {
                        const isSelected = selectedTrack.id === track.id || selectedTrack.slug === track.slug;
                        return (
                          <div
                            key={track.id}
                            onClick={() => setSelectedTrack(track)}
                            className={`p-3 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-purple-950/80 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-[1.02]"
                                : "bg-black/60 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                              <Image
                                src={track.image_url}
                                alt={track.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-mono font-bold text-white uppercase">
                                {track.name}
                              </div>
                              <div className="text-[10px] font-sans text-gray-400 line-clamp-1 mt-0.5">
                                {track.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(138,43,226,0.6)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>ACTIVATE SQUAD</span>
                        <Zap className="w-4 h-4 text-cyan-300" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setStep("TEAM_CHOICE")}
                    className="text-xs font-mono text-gray-400 hover:text-white underline"
                  >
                    Back to team options
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: JOIN TEAM FORM */}
            {step === "JOIN_TEAM" && (
              <motion.div
                key="JOIN_TEAM"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-pink-300">
                    JOIN EXISTING SQUAD
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Enter 8-character Team Code provided by squad leader
                  </p>
                </div>

                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      TEAM CODE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MIRA26-A7K9"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-pink-400 text-base font-mono tracking-widest text-center uppercase font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>JOIN SQUAD</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setStep("TEAM_CHOICE")}
                    className="text-xs font-mono text-gray-400 hover:text-white underline"
                  >
                    Back to team options
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: TEAM CREATION SUCCESS BANNER */}
            {step === "TEAM_SUCCESS" && activeTeam && (
              <motion.div
                key="TEAM_SUCCESS"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SQUAD ACTIVATED SUCCESSFULLY</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold font-mono uppercase text-white">
                  {activeTeam.team_name}
                </h3>

                <div className="p-5 rounded-2xl bg-purple-950/60 border border-purple-500/40 max-w-sm mx-auto space-y-2 backdrop-blur-md">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    UNIQUE TEAM CODE (SHARE WITH MEMBERS):
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-mono font-bold text-cyan-300 tracking-widest">
                      {activeTeam.team_code}
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-2 rounded-lg bg-black/60 border border-white/20 hover:border-cyan-400 text-gray-300 hover:text-white transition-all"
                      title="Copy Team Code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setStep("DASHBOARD")}
                    className="px-8 py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(138,43,226,0.6)] flex items-center gap-2"
                  >
                    <span>ENTER SQUAD DASHBOARD</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: SQUAD DASHBOARD VIEW */}
            {step === "DASHBOARD" && activeTeam && (
              <motion.div
                key="DASHBOARD"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                      // SQUAD DASHBOARD
                    </span>
                    <h3 className="text-3xl font-extrabold font-mono uppercase text-white">
                      {activeTeam.team_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40">
                    <span className="text-xs font-mono text-gray-400">CODE:</span>
                    <span className="font-mono font-bold text-cyan-300 tracking-wider">
                      {activeTeam.team_code}
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-1.5 rounded bg-black/60 border border-white/20 hover:border-cyan-400 text-gray-300 hover:text-white"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Selected Track Feature Card */}
                {activeTheme && (
                  <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <Image src={activeTheme.image_url} alt={activeTheme.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-pink-400 uppercase font-bold">
                        SELECTED INNOVATION TRACK:
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{activeTheme.name}</div>
                      <div className="text-xs text-gray-400 font-sans">{activeTheme.description}</div>
                    </div>
                  </div>
                )}

                {/* Squad Roster */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-3">
                    SQUAD ROSTER ({teamMembers.length} / 4 MEMBERS):
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamMembers.map((mem, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                            0{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {mem.profile?.full_name || "Team Member"}
                            </div>
                            <div className="text-[10px] text-gray-400">{mem.profile?.email}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-bold border ${
                            mem.member_role === "leader"
                              ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                              : "bg-purple-950/60 border-purple-500/40 text-purple-300"
                          }`}
                        >
                          {mem.member_role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── DEDICATED SECTION: ROUND 1 // PROPOSAL SUBMISSION ── */}
                <div className="p-6 sm:p-8 rounded-3xl bg-black/80 border border-purple-500/40 shadow-[0_0_30px_rgba(138,43,226,0.3)] space-y-6 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-widest mb-1">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>ROUND 1 // PROPOSAL SUBMISSION</span>
                      </div>
                      <h4 className="text-xl font-bold font-mono text-white">
                        BUSINESS INNOVATION IDEA SUBMISSION
                      </h4>
                    </div>

                    {/* Prominent Download Official Template Button */}
                    <a
                      href="/assets/mireathon_2k26_team_templete.pptx"
                      download="mireathon_2k26_team_templete.pptx"
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>MIRAETHON 2K26 TEAM TEMPLATE</span>
                    </a>
                  </div>

                  <p className="text-xs font-mono text-gray-300 leading-relaxed">
                    Download the official Miraethon 2026 team template, prepare your proposal deck, and upload the final PPT, PPTX, or PDF file before the deadline.
                  </p>

                  {/* Info Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">DEADLINE:</span>
                      <span className="text-amber-400 font-bold">28 AUGUST 2026</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">ACCEPTED FORMATS:</span>
                      <span className="text-cyan-300 font-bold">PPT / PPTX / PDF</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">MAXIMUM SIZE:</span>
                      <span className="text-pink-400 font-bold">10 MB</span>
                    </div>
                  </div>

                  {/* Submission Status & File Display */}
                  {submission ? (
                    <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
                          <CheckCircle className="w-4 h-4" />
                          <span>✓ SUBMISSION RECEIVED</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/60 border border-emerald-500/20 font-mono text-xs">
                        <div className="truncate">
                          <span className="text-white font-bold block truncate">Filename: {submission.file_name}</span>
                          <span className="text-emerald-400 text-[10px] font-bold">
                            Status: SUBMITTED • Size: {(submission.file_size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>

                        {submissionSignedUrl && (
                          <a
                            href={submissionSignedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-[10px] font-bold uppercase shrink-0"
                          >
                            OPEN / DOWNLOAD PROPOSAL
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>No proposal submitted yet for this squad.</span>
                    </div>
                  )}

                  {/* Upload / Replace Form (Leader Only) */}
                  {deadlinePassedState ? (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400 shrink-0" />
                      <span>SUBMISSION CLOSED — Round 1 submissions closed on 28 August 2026.</span>
                    </div>
                  ) : isLeader ? (
                    <form onSubmit={handleUploadSubmission} className="space-y-4 pt-2">
                      <div className="font-mono text-xs uppercase font-bold text-cyan-300">
                        {submission ? "REPLACE PROPOSAL FILE (LEADER ONLY):" : "UPLOAD PROPOSAL (LEADER ONLY):"}
                      </div>

                      {uploadError && (
                        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs">
                          {uploadError}
                        </div>
                      )}

                      {uploadSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs">
                          {uploadSuccess}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="file"
                          accept=".pptx,.ppt,.pdf"
                          onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                          className="w-full text-xs font-mono text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-purple-900/60 file:text-cyan-300 hover:file:bg-purple-800 cursor-pointer bg-black/60 p-2 rounded-xl border border-purple-500/30"
                        />

                        <button
                          type="submit"
                          disabled={uploadingSubmission}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2 shrink-0"
                        >
                          {uploadingSubmission ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4 text-cyan-300" />
                              <span>{submission ? "REPLACE PROPOSAL" : "UPLOAD PROPOSAL"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-gray-400 font-mono text-xs">
                      🔒 File upload management is restricted to Team Leader ({activeTeam.team_name}).
                    </div>
                  )}

                  {/* Round 1 Result Banner */}
                  <div className="pt-4 border-t border-purple-500/20">
                    <h5 className="font-mono text-xs uppercase font-bold text-gray-300 mb-2">
                      ROUND 1 EVALUATION &amp; QUALIFICATION RESULT:
                    </h5>

                    {!resultStatus.resultsPublished ? (
                      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>Round 1 evaluation is currently in progress by our judicial panel. Final results will be published soon.</span>
                      </div>
                    ) : resultStatus.isShortlisted ? (
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-emerald-950/80 border border-amber-400 text-amber-200 font-mono text-xs shadow-[0_0_25px_rgba(251,191,36,0.3)]">
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-300 mb-1">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <span>🎉 CONGRATULATIONS! QUALIFIED FOR ROUND 2</span>
                        </div>
                        <p className="text-[11px] text-gray-300">
                          Your squad has successfully been shortlisted among the top teams in {activeTheme?.name || "your track"}!
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-700 text-gray-300 font-mono text-xs">
                        <span className="font-bold text-pink-400 block mb-1">NOT SHORTLISTED FOR ROUND 2</span>
                        Thank you for participating in Miraethon 2026. Keep innovating!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
