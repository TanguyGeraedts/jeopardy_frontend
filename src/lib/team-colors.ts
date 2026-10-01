import type { TeamColour } from "@/types";

type ColourStyle = {
    /** Filled button. */
    solid: string;
    /** Thin bar on top of a scoreboard card. */
    bar: string;
    /** Round swatch (colour picker, labels). */
    swatch: string;
};

/**
 * The lobby service's colours as hex values. Class names are written out in full
 * (no string building) so Tailwind can see them.
 */
export const TEAM_COLOUR_STYLES: Record<TeamColour, ColourStyle> = {
    RED: { solid: "bg-[#EF4444] hover:brightness-110", bar: "bg-[#EF4444]", swatch: "bg-[#EF4444]" },
    BLUE: { solid: "bg-[#3B82F6] hover:brightness-110", bar: "bg-[#3B82F6]", swatch: "bg-[#3B82F6]" },
    GREEN: { solid: "bg-[#10B981] hover:brightness-110", bar: "bg-[#10B981]", swatch: "bg-[#10B981]" },
    YELLOW: { solid: "bg-[#F59E0B] hover:brightness-110", bar: "bg-[#F59E0B]", swatch: "bg-[#F59E0B]" },
    PURPLE: { solid: "bg-[#8B5CF6] hover:brightness-110", bar: "bg-[#8B5CF6]", swatch: "bg-[#8B5CF6]" },
    ORANGE: { solid: "bg-[#F97316] hover:brightness-110", bar: "bg-[#F97316]", swatch: "bg-[#F97316]" },
    PINK: { solid: "bg-[#EC4899] hover:brightness-110", bar: "bg-[#EC4899]", swatch: "bg-[#EC4899]" },
    TEAL: { solid: "bg-[#14B8A6] hover:brightness-110", bar: "bg-[#14B8A6]", swatch: "bg-[#14B8A6]" },
};

export const teamColourStyle = (colour: TeamColour) => TEAM_COLOUR_STYLES[colour];

const BY_POSITION = Object.values(TEAM_COLOUR_STYLES);

/** One colour per team, by position (used until teams carry their own colour). Same order as the lobby's colour list. */
export const teamColor = (teamIndex: number) => BY_POSITION[teamIndex % BY_POSITION.length];