"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundKind = "click" | "tab" | "toggle" | "success" | "hover";

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

function playTone(opts: {
  freq: number;
  durationMs: number;
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
}) {
  const ctx = getCtx();
  if (!ctx) return;
  const { freq, durationMs, type = "sine", gain = 0.08, glideTo } = opts;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(
      glideTo,
      ctx.currentTime + durationMs / 1000
    );
  }

  // ADSR-ish envelope: fast attack, exp decay → click-like
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + durationMs / 1000
  );

  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
}

const PRESETS: Record<SoundKind, () => void> = {
  click: () =>
    playTone({ freq: 880, glideTo: 660, durationMs: 90, type: "triangle", gain: 0.07 }),
  tab: () =>
    playTone({ freq: 520, glideTo: 780, durationMs: 110, type: "sine", gain: 0.06 }),
  toggle: () =>
    playTone({ freq: 660, glideTo: 990, durationMs: 80, type: "square", gain: 0.04 }),
  hover: () =>
    playTone({ freq: 1200, durationMs: 40, type: "sine", gain: 0.025 }),
  success: () => {
    playTone({ freq: 660, durationMs: 120, type: "triangle", gain: 0.06 });
    setTimeout(
      () =>
        playTone({ freq: 990, durationMs: 180, type: "triangle", gain: 0.06 }),
      90
    );
  },
};

const STORAGE_KEY = "cys.soundEnabled";

export function useSound() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== null) setEnabled(v === "1");
    } catch {}
  }, []);

  const play = useCallback((kind: SoundKind) => {
    if (!enabledRef.current) return;
    try {
      PRESETS[kind]();
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      if (next) {
        try {
          PRESETS.toggle();
        } catch {}
      }
      return next;
    });
  }, []);

  return { enabled, toggle, play };
}
