"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** Must match the thumb size in globals.css (.range-input). */
const THUMB_REM = 1.25;

/** Where the centre of the thumb sits along the track for a 0-100 position (native thumbs stay inside the track). */
export const thumbPosition = (pct: number) => `calc(${pct}% + ${((0.5 - pct / 100) * THUMB_REM).toFixed(4)}rem)`;

export const percent = (value: number, min: number, max: number) => (max === min ? 0 : ((value - min) / (max - min)) * 100);

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** How the value (and the end labels) are shown. */
  format?: (value: number) => string;
  hint?: string;
  error?: string | null;
  disabled?: boolean;
}

/** A labelled slider with the current value shown as a pill. */
export function SliderField({ label, value, min, max, step = 1, onChange, format = String, hint, error, disabled }: SliderFieldProps) {
  const id = useId();
  return (
    <div className={cn("space-y-2", disabled && "opacity-50")}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-white/80">
          {label}
        </label>
        <output htmlFor={id} className="rounded-full bg-jeopardy-gold/15 px-2.5 py-0.5 text-sm font-bold tabular-nums text-jeopardy-gold">
          {format(value)}
        </output>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15" />
        <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-jeopardy-gold" style={{ width: thumbPosition(percent(value, min, max)) }} />
        <input
          id={id}
          type="range"
          className="range-input range-input-single"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : hint ? <p className="text-xs text-white/40">{hint}</p> : null}
    </div>
  );
}
