/** One colour per team, by position. Full class names so Tailwind can see them. */
const TEAM_COLORS = [
  { solid: "bg-red-600 hover:bg-red-500", bar: "bg-red-500" },
  { solid: "bg-sky-600 hover:bg-sky-500", bar: "bg-sky-500" },
  { solid: "bg-emerald-600 hover:bg-emerald-500", bar: "bg-emerald-500" },
  { solid: "bg-orange-600 hover:bg-orange-500", bar: "bg-orange-500" },
  { solid: "bg-violet-600 hover:bg-violet-500", bar: "bg-violet-500" },
  { solid: "bg-pink-600 hover:bg-pink-500", bar: "bg-pink-500" },
] as const;

export const teamColor = (teamIndex: number) => TEAM_COLORS[teamIndex % TEAM_COLORS.length];
