/**
 * Built-in buzzer sounds, synthesized with the Web Audio API (no audio files to host).
 * The ids mirror jeopardy_backend gameplay/domain/model/BuzzerSound.java and must be kept in sync by hand:
 * an id only the backend knows plays the automatic sound (with a console warning), an id only listed here
 * is rejected by the backend when picked.
 */
export const BUZZER_SOUND_IDS = ["CLASSIC", "BELL", "HORN", "LASER", "CHIME", "ARCADE", "BOING", "GONG"] as const;
export type BuzzerSoundId = (typeof BUZZER_SOUND_IDS)[number];

export const BUZZER_SOUND_LABELS: Record<BuzzerSoundId, string> = {
  CLASSIC: "Classic buzzer",
  BELL: "Bell",
  HORN: "Horn",
  LASER: "Laser",
  CHIME: "Chime",
  ARCADE: "Arcade",
  BOING: "Boing",
  GONG: "Gong",
};

const warnedUnknown = new Set<string>();

/** A team without a picked sound gets one by its position, so neighbours never sound alike. */
export function buzzerSoundFor(picked: string | null | undefined, teamIndex: number): BuzzerSoundId {
  const known = BUZZER_SOUND_IDS.find((id) => id === picked);
  if (picked && !known && !warnedUnknown.has(picked)) {
    warnedUnknown.add(picked);
    console.warn(`Unknown buzzer sound "${picked}" from the backend: add it to BUZZER_SOUND_IDS. Using the automatic sound.`);
  }
  return known ?? BUZZER_SOUND_IDS[teamIndex % BUZZER_SOUND_IDS.length];
}

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  context ??= new AudioContext();
  return context;
}

/** Browsers only allow sound after the page got a click/tap. Call this from any user gesture. */
export function unlockAudio(): void {
  const ctx = audio();
  if (ctx?.state === "suspended") void ctx.resume();
}

/** True while the browser lets this page play sound. */
export const audioUnlocked = (): boolean => audio()?.state === "running";

/** Calls back whenever sound gets allowed or blocked again (e.g. the OS interrupts audio). For useSyncExternalStore. */
export function subscribeAudioState(onChange: () => void): () => void {
  const ctx = audio();
  ctx?.addEventListener("statechange", onChange);
  return () => ctx?.removeEventListener("statechange", onChange);
}

/** One oscillator note with an attack/decay envelope, into `out`. Frequencies may glide via `to`. */
function tone(
  ctx: AudioContext,
  out: AudioNode,
  { type, from, to, start, length, volume = 1, decay = "exp" }:
    { type: OscillatorType; from: number; to?: number; start: number; length: number; volume?: number; decay?: "exp" | "flat" },
) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + length);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  if (decay === "flat") {
    gain.gain.setValueAtTime(volume, t0 + length - 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  } else {
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  }
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + length + 0.05);
}

const SYNTHS: Record<BuzzerSoundId, (ctx: AudioContext, out: AudioNode) => void> = {
  // Two slightly detuned square waves: the game-show "BZZZT".
  CLASSIC: (ctx, out) => {
    tone(ctx, out, { type: "square", from: 140, start: 0, length: 0.6, volume: 0.5, decay: "flat" });
    tone(ctx, out, { type: "square", from: 147, start: 0, length: 0.6, volume: 0.5, decay: "flat" });
  },
  BELL: (ctx, out) => {
    tone(ctx, out, { type: "sine", from: 880, start: 0, length: 1.2, volume: 0.75 });
    tone(ctx, out, { type: "sine", from: 1760, start: 0, length: 0.8, volume: 0.4 });
    tone(ctx, out, { type: "sine", from: 2640, start: 0, length: 0.5, volume: 0.2 });
  },
  // Volumes are balanced by ear-ish and by measured peak (~0.3 after the master gain) so no team is louder.
  HORN: (ctx, out) => {
    tone(ctx, out, { type: "sawtooth", from: 233, start: 0, length: 0.22, volume: 0.8, decay: "flat" });
    tone(ctx, out, { type: "sawtooth", from: 277, start: 0.26, length: 0.35, volume: 0.8, decay: "flat" });
  },
  LASER: (ctx, out) => tone(ctx, out, { type: "square", from: 1600, to: 140, start: 0, length: 0.5, volume: 0.9, decay: "flat" }),
  CHIME: (ctx, out) =>
    [1047, 1319, 1568].forEach((f, i) => tone(ctx, out, { type: "triangle", from: f, start: i * 0.12, length: 0.6, volume: 0.8 })),
  ARCADE: (ctx, out) =>
    [523, 659, 784, 1047].forEach((f, i) => tone(ctx, out, { type: "square", from: f, start: i * 0.07, length: 0.09, volume: 0.85, decay: "flat" })),
  BOING: (ctx, out) => {
    tone(ctx, out, { type: "sine", from: 120, to: 520, start: 0, length: 0.18 });
    tone(ctx, out, { type: "sine", from: 520, to: 160, start: 0.18, length: 0.35 });
  },
  GONG: (ctx, out) => {
    tone(ctx, out, { type: "sine", from: 98, start: 0, length: 2.2, volume: 0.55 });
    tone(ctx, out, { type: "sine", from: 147, start: 0, length: 1.8, volume: 0.3 });
    tone(ctx, out, { type: "sine", from: 233, start: 0, length: 1.2, volume: 0.15 });
  },
};

/** Plays a buzzer sound. Silently does nothing until the page has been clicked once (browser autoplay rules). */
export function playBuzzerSound(id: BuzzerSoundId, volume = 0.35): void {
  const ctx = audio();
  if (!ctx) return;
  unlockAudio();
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  SYNTHS[id](ctx, master);
}
