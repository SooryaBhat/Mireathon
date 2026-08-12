"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
} from "@/lib/teamService";

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
  const [dbThemes, setDbThemes] = useState<ThemeTrack[]>(THEME_TRACKS);

  useEffect(() => {
    getHackathonSettings().then((s) => {
      setIsRegistrationOpen(s.registration_open);
    });
    fetchThemes().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setDbThemes(fetched);
        // Default selected track to real database UUID theme
        setSelectedTrack(fetched[0]);
      }
    });
  }, []);

  // Handle Account Signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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

      // Check if user is already in a team
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
  };

  // Handle Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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
      // Fetch full team data
      const full = await getUserTeam(currentProfile.id);
      setTeamMembers(full.members);
      setActiveTheme(full.theme || THEME_TRACKS[0]);
      setStep("DASHBOARD");
    }
  };

  const copyCode = () => {
    if (activeTeam?.team_code) {
      navigator.clipboard.writeText(activeTeam.team_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <section id="register" className="relative py-28 px-6 bg-[#05050a] text-white overflow-hidden border-t border-purple-500/20">
      {/* Cinematic Animated Video Background & Procedural Particle Layer */}
      <VideoBackground
        variant="hero"
        webmSrc="/assets/rift-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.45}
      />

      {/* Atmospheric Glowing Orbs & Dimensional Portal Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-900/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-purple-500/20 bg-gradient-to-tr from-cyan-500/5 via-purple-500/5 to-pink-500/5 blur-xl pointer-events-none animate-pulse" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(138,43,226,0.4)] backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>MIRAETHON 2026 // SQUAD REGISTRATION</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-500 drop-shadow-[0_0_25px_rgba(138,43,226,0.5)]"
          >
            ASSEMBLE YOUR SQUAD
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-gray-300 font-sans text-sm sm:text-base max-w-xl mx-auto"
          >
            Create an account, register your innovation squad, or join an existing team code.
          </motion.p>

          {!isRegistrationOpen && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono uppercase shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Lock className="w-4 h-4 text-red-400" />
              <span>REGISTRATIONS CLOSED // Existing squads can still log in</span>
            </div>
          )}
        </div>

        {/* Dynamic Multi-Step Futuristic Command Console Glass Panel */}
        <div className="glass-rift rounded-3xl p-6 sm:p-10 border border-purple-500/40 hover:border-cyan-400/50 shadow-[0_0_60px_rgba(138,43,226,0.35)] relative overflow-hidden min-h-[460px] flex flex-col justify-center transition-all duration-300">
          {/* Sci-Fi HUD Corner Brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-pink-500/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-300 text-xs sm:text-sm font-mono flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: INITIAL CHOICE */}
            {step === "CHOICE" && (
              <motion.div
                key="CHOICE"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                <h3 className="text-2xl font-bold font-mono uppercase tracking-wider text-cyan-300">
                  ENTER THE WORLD
                </h3>
                <p className="text-sm font-sans text-gray-300 max-w-md mx-auto">
                  Sign in with your existing account or create a new student profile to register your squad.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto pt-4">
                  {isRegistrationOpen && (
                    <button
                      onClick={() => {
                        setErrorMsg("");
                        setStep("SIGNUP");
                      }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-cyan-950/40 border border-cyan-400/50 hover:border-cyan-300 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(34,211,238,0.2)] group"
                    >
                      <UserPlus className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                        Create New Account
                      </span>
                      <span className="text-xs text-gray-400 font-sans">
                        New student registration
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setStep("LOGIN");
                    }}
                    className={`p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-950/40 border border-purple-500/50 hover:border-pink-400 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(236,72,153,0.2)] group ${
                      !isRegistrationOpen ? "col-span-full" : ""
                    }`}
                  >
                    <LogIn className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      Sign In Existing User
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      Access squad dashboard
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CREATE ACCOUNT FORM */}
            {step === "SIGNUP" && (
              <motion.div
                key="SIGNUP"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto w-full space-y-5"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-cyan-300">
                    CREATE STUDENT ACCOUNT
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Direct access — no email confirmation required
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Student Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(138,43,226,0.6)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>CREATE ACCOUNT</span>
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

            {/* STEP 3: SIGN IN FORM */}
            {step === "LOGIN" && (
              <motion.div
                key="LOGIN"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto w-full space-y-5"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-pink-400">
                    ENTER MIRAETHON
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    // Existing user portal authentication
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-500/40 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 text-sm font-mono"
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

            {/* STEP 4: TEAM CHOICE (CREATE OR JOIN) */}
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
                      Become Team Leader & select track
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
                    // Enter squad details & select 1 innovation world
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

                  {/* Theme Track Cards Selection */}
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
                className="max-w-md mx-auto w-full space-y-5"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono uppercase text-pink-400">
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

                {/* Team Code Display Box */}
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
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                      // SQUAD DASHBOARD
                    </span>
                    <h3 className="text-3xl font-extrabold font-mono uppercase text-white">
                      {activeTeam.team_name}
                    </h3>
                  </div>

                  {/* Team Code Widget */}
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

                {/* Track Feature Card */}
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

                {/* Roster Grid */}
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

                {/* Status Bar */}
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>ROUND 1 SUBMISSION STATUS: DRAFT</span>
                  </div>
                  <span className="text-gray-400">PDF / PPTX upload opens soon</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
