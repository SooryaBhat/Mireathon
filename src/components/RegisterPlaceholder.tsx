"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, Sparkles, Send } from "lucide-react";

import VideoBackground from "./VideoBackground";

export default function RegisterPlaceholder() {
  /*
   * TODO: Supabase Integration Instructions
   * 1. Install @supabase/supabase-js package: `npm install @supabase/supabase-js`
   * 2. Initialize Supabase client:
   *    import { createClient } from '@supabase/supabase-js'
   *    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
   * 3. Handle form submission in `handleSubmit`:
   *    const { data, error } = await supabase.from('registrations').insert([formData])
   */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase submit handler will go here once registration opens
  };

  return (
    <section id="register" className="relative py-28 px-6 bg-[#05050a] text-white overflow-hidden">
      {/* Animated Glowing Video Background Layer */}
      <VideoBackground
        variant="themes"
        webmSrc="/assets/themes-loop.webm"
        posterSrc="/assets/rift-bg.png"
        overlayOpacity={0.45}
      />

      {/* Background Neon Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-950/25 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Registration Console // Status: Standby</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          >
            CLAIM YOUR RIFT PASS
          </motion.h2>

          {/* Registration Opening Soon Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(138,43,226,0.3)]"
          >
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="font-mono text-sm uppercase tracking-wider text-cyan-300 font-semibold">
              Registration Opening Soon — Prepare Your Squad
            </span>
          </motion.div>
        </div>

        {/* Disabled Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-10 glass-rift border border-purple-500/30 opacity-75 cursor-not-allowed select-none overflow-hidden"
        >
          {/* Overlay Lock Watermark */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] mb-4 animate-bounce">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-mono uppercase text-white tracking-wider">
              REGISTRATION PORTAL LOCKED
            </h3>
            <p className="text-xs sm:text-sm font-mono text-cyan-300/80 max-w-md mt-2">
              Official portal access keys will be released shortly. Review track specifications & assemble your squad in the meantime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs sm:text-sm pointer-events-none">
            {/* Team Name */}
            <div>
              <label className="block text-cyan-400 uppercase tracking-widest mb-2 font-bold">
                Squad / Team Name
              </label>
              <input
                type="text"
                disabled
                placeholder="e.g. CyberVanguard"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-gray-400 placeholder:text-gray-600 focus:outline-none"
              />
            </div>

            {/* Team Leader & Member Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-300 uppercase tracking-widest mb-2 font-bold">
                  Team Leader Name
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Leader Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-gray-400 placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-purple-300 uppercase tracking-widest mb-2 font-bold">
                  Leader Email Address
                </label>
                <input
                  type="email"
                  disabled
                  placeholder="leader@college.edu"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-gray-400 placeholder:text-gray-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Member 2, 3, 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">
                  Member 2 Name
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Member 2 Name"
                  className="w-full px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">
                  Member 3 Name (Optional)
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Member 3 Name"
                  className="w-full px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">
                  Member 4 Name (Optional)
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Member 4 Name"
                  className="w-full px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Track Dropdown */}
            <div>
              <label className="block text-pink-400 uppercase tracking-widest mb-2 font-bold">
                Preferred Innovation Track
              </label>
              <select
                disabled
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-gray-400 focus:outline-none"
              >
                <option>Select Track Dimension...</option>
                <option>1. Retail & Reality (Gold)</option>
                <option>2. Finance & Investments (Green)</option>
                <option>3. Health & Wellness (Teal)</option>
                <option>4. Travel & Food (Coral)</option>
                <option>5. Sports & Fitness (Electric Blue)</option>
                <option>6. Music & OTT (Magenta)</option>
              </select>
            </div>

            {/* Disabled Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-500 font-mono text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>Registration Coming Soon</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
