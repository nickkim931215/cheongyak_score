"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Pachelbel's Canon in D — chord progression (bass + 3-note chord for arpeggio)
const PROGRESSION: Array<{ bass: number; chord: [number, number, number] }> = [
  { bass: 146.83, chord: [293.66, 369.99, 440.0] }, // D  : D3, D4 F#4 A4
  { bass: 110.0, chord: [277.18, 329.63, 440.0] }, // A  : A2, C#4 E4 A4
  { bass: 123.47, chord: [246.94, 293.66, 369.99] }, // Bm : B2, B3 D4 F#4
  { bass: 92.5, chord: [220.0, 277.18, 369.99] }, // F#m: F#2, A3 C#4 F#4
  { bass: 98.0, chord: [246.94, 293.66, 392.0] }, // G  : G2, B3 D4 G4
  { bass: 146.83, chord: [293.66, 369.99, 440.0] }, // D
  { bass: 98.0, chord: [246.94, 293.66, 392.0] }, // G
  { bass: 110.0, chord: [277.18, 329.63, 440.0] }, // A
];

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    sharedCtx = new AC();
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

function scheduleNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  durationSec: number,
  type: OscillatorType,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  // Soft attack, sustain, exponential release
  g.gain.setValueAtTime(0.0001, startTime);
  g.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.08);
  g.gain.setValueAtTime(peakGain, startTime + durationSec * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
  osc.connect(g).connect(destination);
  osc.start(startTime);
  osc.stop(startTime + durationSec + 0.05);
}

class BgmEngine {
  ctx: AudioContext;
  master: GainNode;
  isPlaying = false;

  private schedulerTimer: number | null = null;
  private nextStepTime = 0;
  private stepIdx = 0;
  private arpIdx = 0;

  // 2 seconds per chord, 4 arpeggio notes per chord (every 0.5s) → 16s loop
  private readonly STEP_SEC = 0.5;
  private readonly LOOKAHEAD_SEC = 0.25;
  private readonly TIMER_MS = 50;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;

    // Warmer tone via low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.5;
    this.master.connect(filter).connect(ctx.destination);
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.stepIdx = 0;
    this.arpIdx = 0;

    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), t);
    this.master.gain.exponentialRampToValueAtTime(0.22, t + 1.0);

    this.runScheduler();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  }

  private runScheduler = () => {
    if (!this.isPlaying) return;
    while (this.nextStepTime < this.ctx.currentTime + this.LOOKAHEAD_SEC) {
      this.scheduleStep(this.nextStepTime);
      this.nextStepTime += this.STEP_SEC;
      this.arpIdx = (this.arpIdx + 1) % 4;
      if (this.arpIdx === 0) {
        this.stepIdx = (this.stepIdx + 1) % PROGRESSION.length;
      }
    }
    this.schedulerTimer = window.setTimeout(this.runScheduler, this.TIMER_MS);
  };

  private scheduleStep(when: number) {
    const chord = PROGRESSION[this.stepIdx];
    if (!chord) return;

    // Sustained bass note at the start of each chord (2 seconds)
    if (this.arpIdx === 0) {
      scheduleNote(this.ctx, this.master, chord.bass, when, 2.0, "sine", 0.35);
      // Soft pad chord layer
      scheduleNote(this.ctx, this.master, chord.bass * 2, when, 2.0, "sine", 0.12);
    }

    // Arpeggio pattern: root → third → fifth → third
    const arpPattern: [number, number, number, number] = [
      chord.chord[0],
      chord.chord[1],
      chord.chord[2],
      chord.chord[1],
    ];
    const noteFreq = arpPattern[this.arpIdx];
    scheduleNote(this.ctx, this.master, noteFreq, when, 0.65, "triangle", 0.18);

    // Subtle higher octave shimmer on beats 2 and 4
    if (this.arpIdx === 1 || this.arpIdx === 3) {
      scheduleNote(
        this.ctx,
        this.master,
        noteFreq * 2,
        when,
        0.4,
        "sine",
        0.05
      );
    }
  }
}

let sharedEngine: BgmEngine | null = null;

function getEngine(): BgmEngine | null {
  const ctx = getCtx();
  if (!ctx) return null;
  if (!sharedEngine) sharedEngine = new BgmEngine(ctx);
  return sharedEngine;
}

const STORAGE_KEY = "cys.bgmEnabled";

export function useBackgroundMusic() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const pendingRestoreRef = useRef(false);

  // Drive the audio engine from enabled state
  useEffect(() => {
    const engine = getEngine();
    if (!engine) return;
    if (enabled) engine.start();
    else engine.stop();
  }, [enabled]);

  // Restore previously-saved preference. Browsers block autoplay without a
  // user gesture, so if BGM was on before, wait for the first user interaction
  // and start then.
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== "1") return;
    } catch {
      return;
    }

    pendingRestoreRef.current = true;
    const onGesture = () => {
      if (!pendingRestoreRef.current) return;
      pendingRestoreRef.current = false;
      setEnabled(true);
      cleanup();
    };
    const cleanup = () => {
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
    };
    document.addEventListener("pointerdown", onGesture, { once: true });
    document.addEventListener("keydown", onGesture, { once: true });
    return cleanup;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  return { enabled, toggle };
}
