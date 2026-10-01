"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
    defaultLobbyForm,
    MAX_PLAYERS,
    MIN_PLAYERS,
    TEAM_COUNT_MAX,
    TEAM_COUNT_MIN,
    toLobbyRequest,
    validateLobby,
    withTeamColour,
    withTeamCount,
} from "@/lib/lobby-config";
import { teamColourStyle } from "@/lib/team-colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RangeSliderField } from "@/components/ui/RangeSliderField";
import { SliderField } from "@/components/ui/SliderField";
import { ToggleField } from "@/components/ui/ToggleField";
import { TEAM_COLOURS } from "@/types";
import type { LobbyForm, LobbyMode, LobbyRequest, TeamsLobbyRequest } from "@/types";

const MODES: { value: LobbyMode; label: string; hint: string }[] = [
    { value: "TEAMS", label: "Teams", hint: "Players are split into coloured teams" },
    { value: "SOLO", label: "Solo", hint: "Everyone plays for themselves" },
];

interface LobbySetupProps {
    /** Start from these settings (e.g. when coming back from the admin screen). */
    initial?: LobbyForm;
    /** The validated request body for the lobby service. */
    onCreate: (request: LobbyRequest, form: LobbyForm) => void;
}

/** The screen before the game: pick the mode and lobby settings, then create the lobby. */
export function LobbySetup({ initial, onCreate }: LobbySetupProps) {
    const [form, setForm] = useState<LobbyForm>(() => initial ?? defaultLobbyForm());
    const [submitted, setSubmitted] = useState(false);

    const errors = validateLobby(form);
    // Only show messages after the first attempt so the form doesn't open full of red.
    const err = <K extends keyof typeof errors>(key: K) => (submitted ? errors[key] : undefined);
    const config = form.mode === "TEAMS" ? form.teams : form.solo;
    const solo = form.mode === "SOLO";

    const patchTeams = (patch: Partial<TeamsLobbyRequest>) => setForm((f) => ({ ...f, teams: { ...f.teams, ...patch } }));
    // Fields both modes share, written to whichever mode is selected.
    const patchShared = (patch: { minPlayers?: number; maxPlayers?: number; allowLateJoin?: boolean }) =>
        setForm((f) => (f.mode === "TEAMS" ? { ...f, teams: { ...f.teams, ...patch } } : { ...f, solo: { ...f.solo, ...patch } }));

    function submit() {
        setSubmitted(true);
        if (Object.keys(errors).length === 0) onCreate(toLobbyRequest(form), form);
    }

    return (
        <div className="space-y-6">
            <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-white/80">Game mode</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                    {MODES.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            aria-pressed={form.mode === m.value}
                            onClick={() => setForm((f) => ({ ...f, mode: m.value }))}
                            className={cn(
                                "rounded-xl border p-4 text-left transition",
                                form.mode === m.value ? "border-jeopardy-gold bg-jeopardy-gold/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                            )}
                        >
                            <p className="font-bold">{m.label}</p>
                            <p className="text-sm text-white/50">{m.hint}</p>
                        </button>
                    ))}
                </div>
            </fieldset>

            <Card className="space-y-6">
                <h2 className="text-lg font-bold">Players</h2>

                <RangeSliderField
                    label="Players in the lobby"
                    min={MIN_PLAYERS}
                    max={MAX_PLAYERS}
                    low={config.minPlayers}
                    high={config.maxPlayers}
                    lowLocked={solo}
                    highFloor={solo ? config.minPlayers : form.teams.teamCount}
                    onChange={(low, high) => patchShared({ minPlayers: low, maxPlayers: high })}
                    hint={solo ? undefined : "The game can start at the minimum; the lobby closes at the maximum"}
                    error={err("minPlayers") ?? err("maxPlayers")}
                />

                {!solo && (
                    <>
                        <SliderField
                            label="Number of teams"
                            min={TEAM_COUNT_MIN}
                            max={TEAM_COUNT_MAX}
                            value={form.teams.teamCount}
                            format={(n) => `${n} teams`}
                            onChange={(n) => setForm((f) => ({ ...f, teams: withTeamCount(f.teams, n) }))}
                            error={err("teamCount")}
                        />
                        <ToggleField
                            label="Balanced teams"
                            description="Keep team sizes as even as possible"
                            checked={form.teams.balancedTeams}
                            onChange={(balancedTeams) => patchTeams({ balancedTeams })}
                        />
                    </>
                )}
            </Card>

            {!solo && (
                <Card className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold">Team colours</h2>
                        <p className="text-sm text-white/50">Pick a colour for each team. Choosing one that's taken swaps the two teams.</p>
                        {err("teamColours") && <p className="text-xs text-red-300">{err("teamColours")}</p>}
                    </div>
                    <ul className="space-y-3">
                        {form.teams.teamColours.map((colour, index) => (
                            <li key={index} className="flex flex-wrap items-center gap-3">
                                <span className="w-16 text-sm text-white/60">Team {index + 1}</span>
                                <div role="radiogroup" aria-label={`Team ${index + 1} colour`} className="flex flex-wrap gap-2">
                                    {TEAM_COLOURS.map((c) => {
                                        const selected = c === colour;
                                        const taken = !selected && form.teams.teamColours.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                aria-label={c.toLowerCase()}
                                                title={`${c}${taken ? " (swap with another team)" : ""}`}
                                                onClick={() => setForm((f) => ({ ...f, teams: withTeamColour(f.teams, index, c) }))}
                                                className={cn(
                                                    "grid size-9 place-items-center rounded-lg border-2 transition",
                                                    teamColourStyle(c).swatch,
                                                    selected ? "border-white ring-2 ring-jeopardy-gold" : "border-transparent",
                                                    taken && "opacity-30 hover:opacity-70",
                                                )}
                                            >
                                                {selected && <span className="text-sm font-black text-white drop-shadow">&#10003;</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-xs font-semibold text-white/70">{colour}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <Card className="space-y-6">
                <h2 className="text-lg font-bold">Lobby</h2>
                <ToggleField
                    label="Allow late joining"
                    description="Players can join after the game has started"
                    checked={config.allowLateJoin}
                    onChange={(allowLateJoin) => patchShared({ allowLateJoin })}
                />
            </Card>

            <details className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-white/70">Request body preview</summary>
                <pre className="mt-3 overflow-x-auto font-mono text-xs text-white/70">{JSON.stringify(toLobbyRequest(form), null, 2)}</pre>
            </details>

            <div className="flex items-center gap-3">
                <Button onClick={submit}>Create lobby</Button>
                {submitted && Object.keys(errors).length > 0 && <p className="text-sm text-red-300">Fix the highlighted settings first.</p>}
            </div>
        </div>
    );
}