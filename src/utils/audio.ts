// Web Audio API Synthesizer Engine for Miraethon 2K26
// 100% Original procedural sound synthesis — zero copyrighted audio assets

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private isMuted: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public registerUserInteraction() {
    this.initContext();
  }

  // Soft glowing chime / zap for button and card hovers (<200ms)
  public playHoverSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;

      osc.type = "sine";
      // Frequency glide: 580Hz -> 880Hz (bright crystalline chord interval)
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio fallback silent
    }
  }

  // Energy zap sound for clicks (<250ms)
  public playClickSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;

      osc.type = "triangle";
      // Quick pitch drop: 960Hz -> 320Hz with resonance
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio fallback silent
    }
  }

  // Deeper "portal hum" ambient loop option (OFF by default)
  public toggleAmbientHum(): boolean {
    this.initContext();
    if (this.isAmbientPlaying) {
      this.stopAmbientHum();
      this.isMuted = true;
      return false;
    } else {
      this.isMuted = false;
      this.startAmbientHum();
      return true;
    }
  }

  private startAmbientHum() {
    if (!this.ctx || this.isAmbientPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // Master ambient gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.03, now + 1.5); // Smooth 1.5s fade in

      // Low frequency fundamental (55Hz - A1)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = "sine";
      this.ambientOsc1.frequency.setValueAtTime(55, now);

      // Fifth harmonic (82.4Hz - E2) for subtle dimensional tone
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = "triangle";
      this.ambientOsc2.frequency.setValueAtTime(82.4, now);

      // Filter with LFO modulation
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, now);

      // LFO for subtle pulsing hum (0.2Hz rate)
      this.ambientLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.ambientLfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(60, now);

      this.ambientLfo.connect(filter.frequency);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);
      this.ambientLfo.start(now);

      this.isAmbientPlaying = true;
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  private stopAmbientHum() {
    if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);

      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientLfo?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
          this.ambientLfo?.disconnect();
          this.ambientGain?.disconnect();
        } catch {
          // Cleanup ignore
        }
        this.isAmbientPlaying = false;
      }, 850);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundEngine = typeof window !== "undefined" ? new SoundEngine() : null;
