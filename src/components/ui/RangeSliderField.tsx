"use client";

import { useId } from "react";
import { percent, thumbPosition } from "./SliderField";

interface RangeSliderFieldProps {
    label: string;
    min: number;
    max: number;
    low: number;
    high: number;
    onChange: (low: number, high: number) => void;
    /** The minimum handle can't be moved (the mode fixes it). */
    lowLocked?: boolean;
    /** The maximum handle can't go below this (besides the low handle). */
    highFloor?: number;
    lowLabel?: string;
    highLabel?: string;
    /** Singular/plural noun for the readout, e.g. ["player", "players"]. */
    unit?: [string, string];
    hint?: string;
    error?: string | null;
}

/** One track with two handles: the lowest and highest value allowed. */
export function RangeSliderField({
                                     label,
                                     min,
                                     max,
                                     low,
                                     high,
                                     onChange,
                                     lowLocked = false,
                                     highFloor = min,
                                     lowLabel = "Minimum",
                                     highLabel = "Maximum",
                                     unit = ["player", "players"],
                                     hint,
                                     error,
                                 }: RangeSliderFieldProps) {
    const id = useId();
    const lowPos = thumbPosition(percent(low, min, max));
    const highPos = thumbPosition(percent(high, min, max));
    // If both handles sit on the same spot, keep the one that can still move on top.
    const lowOnTop = low === high && low >= max;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span id={id} className="text-sm font-medium text-white/80">
          {label}
        </span>
                <output className="rounded-full bg-jeopardy-gold/15 px-2.5 py-0.5 text-sm font-bold tabular-nums text-jeopardy-gold">
                    {low === high ? `${low} ${low === 1 ? unit[0] : unit[1]}` : `${low}\u2013${high} ${unit[1]}`}
                </output>
            </div>

            <div role="group" aria-labelledby={id} className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15" />
                <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-jeopardy-gold" style={{ left: lowPos, right: `calc(100% - ${highPos})` }} />
                <input
                    type="range"
                    className="range-input"
                    style={{ zIndex: lowOnTop ? 3 : 2 }}
                    min={min}
                    max={max}
                    step={1}
                    value={low}
                    disabled={lowLocked}
                    aria-label={`${lowLabel} ${unit[1]}${lowLocked ? " (fixed for this mode)" : ""}`}
                    onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
                />
                <input
                    type="range"
                    className="range-input"
                    style={{ zIndex: 2 }}
                    min={min}
                    max={max}
                    step={1}
                    value={high}
                    aria-label={`${highLabel} ${unit[1]}`}
                    onChange={(e) => onChange(low, Math.max(Number(e.target.value), low, highFloor))}
                />
            </div>

            <div className="flex justify-between text-xs text-white/40">
                <span>{min}</span>
                <span>{max}</span>
            </div>
            {error ? (
                <p className="text-xs text-red-300">{error}</p>
            ) : (
                <>
                    {lowLocked && <p className="text-xs text-white/40">The minimum is fixed for this mode. Drag the maximum to set the cap.</p>}
                    {hint && <p className="text-xs text-white/40">{hint}</p>}
                </>
            )}
        </div>
    );
}