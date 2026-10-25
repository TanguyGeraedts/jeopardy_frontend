import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { groupByPlace, ordinal, rankTeams, type RankedTeam } from "@/lib/ranking";
import { sessionTeamStyle } from "@/lib/team-colors";
import type { GameSession } from "@/types";

/** Step height by place. The board always fills the window, so viewport units keep the steps in proportion. */
const STEP_HEIGHT: Record<number, string> = { 1: "h-[48vh]", 2: "h-[35vh]", 3: "h-[25vh]" };
/** Width of a step per team standing on it. */
const STEP_WIDTH_VW = 19;
/** Gap between one step rising and the next (3rd, then 2nd, then 1st). */
const STAGGER_MS = 900;
const FIRST_DELAY_MS = 300;

/**
 * The end of the show, on the shared screen: the board's blue tiles stacked into a podium (scores in the tiles' gold),
 * the top three places on it and everyone else in a row below. Ties share a step. Plays once: 3rd rises, then 2nd, then 1st.
 */
export function FinalScoreboard({ session }: { session: GameSession }) {
  const solo = session.mode === "SOLO";
  const groups = groupByPlace(rankTeams(session));
  const podium = groups.filter((group) => group[0].place <= 3).slice(0, 3);
  const rest = groups.slice(podium.length).flat();

  // Rises last-to-first; the headline waits for the winner's step.
  const riseDelay = (groupIndex: number) => FIRST_DELAY_MS + (podium.length - 1 - groupIndex) * STAGGER_MS;
  const headlineDelay = riseDelay(0) + 700;
  // Classic podium order: 2nd on the left, 1st in the middle, 3rd on the right.
  const order = [1, 0, 2].filter((i) => i < podium.length);

  const winners = podium[0] ?? [];
  const headline =
    winners.length === 0
      ? "Nobody played"
      : winners.length === 1
        ? `${winners[0].team.name} wins`
        : `${winners.map((w) => w.team.name).join(" & ")} tie for first`;

  return (
    <div className="flex h-full flex-col gap-[1.2vw] overflow-hidden rounded-sm bg-studio-night">
      <h2
        className={cn(
          "shrink-0 text-balance px-[2vw] text-center font-display leading-[0.95] tracking-wide text-gold motion-safe:animate-podium-name",
          // Ties and long team names: one line, so the podium keeps its room.
          headline.length > 22 ? "text-[clamp(2.25rem,4.6vw,5rem)]" : "text-[clamp(3rem,8vw,8.5rem)]",
        )}
        style={delay(headlineDelay)}
      >
        {headline}
      </h2>

      <div className="flex min-h-0 flex-1 items-end justify-center gap-[0.6vw] overflow-hidden px-[4vw]">
        {order.map((groupIndex) => (
          <PodiumStep key={groupIndex} group={podium[groupIndex]} solo={solo} riseDelay={riseDelay(groupIndex)} />
        ))}
      </div>

      {rest.length > 0 && (
        <ol className="flex shrink-0 flex-wrap justify-center gap-[0.5vw] motion-safe:animate-podium-name" style={delay(headlineDelay)}>
          {rest.map((entry) => (
            <RestRow key={entry.team.id} entry={entry} solo={solo} />
          ))}
        </ol>
      )}
    </div>
  );
}

function PodiumStep({ group, solo, riseDelay }: { group: RankedTeam[]; solo: boolean; riseDelay: number }) {
  const { place } = group[0];
  const first = place === 1;

  return (
    // A tie takes a wider step: one column per team on it.
    <div className="flex min-w-0 flex-col justify-end" style={{ flex: `0 1 ${group.length * STEP_WIDTH_VW}vw` }}>
      <ul className="flex justify-center gap-[1vw] px-[0.5vw] pb-[0.8vw] motion-safe:animate-podium-name" style={delay(riseDelay + 500)}>
        {group.map((entry) => (
          <li key={entry.team.id} className="min-w-0 flex-1 text-center">
            <p className={cn("line-clamp-2 font-display leading-[0.95] tracking-wide", first ? "text-[clamp(2rem,4.2vw,4.75rem)]" : "text-[clamp(1.5rem,3vw,3.25rem)]")}>
              {entry.team.name}
            </p>
            {!solo && entry.members.length > 0 && (
              <p className="mt-[0.3vw] line-clamp-2 text-[clamp(0.8rem,1.05vw,1.15rem)] text-chalk/70">{entry.members.map((p) => p.name).join(", ")}</p>
            )}
          </li>
        ))}
      </ul>

      <div
        className={cn("flex shrink-0 flex-col overflow-hidden rounded-t-sm bg-board-blue motion-safe:animate-podium-rise", STEP_HEIGHT[place])}
        style={delay(riseDelay)}
      >
        {/* One bar per team on the step, in their own colours. */}
        <div className="flex h-[max(8px,0.6vw)] shrink-0">
          {group.map((entry) => (
            <div key={entry.team.id} className={cn("flex-1", sessionTeamStyle(entry.team.colour, entry.index).bar)} />
          ))}
        </div>
        <div className="flex flex-1 flex-col items-center justify-start gap-[0.4vw] pt-[1.2vw]">
          <p className="font-display text-[clamp(1.5rem,2.6vw,3rem)] leading-none tracking-wide text-chalk/80">{ordinal(place)}</p>
          <p
            className={cn(
              "font-display leading-none tabular-nums",
              first ? "text-[clamp(3.5rem,8vw,9rem)]" : "text-[clamp(2.5rem,5.5vw,6rem)]",
              group[0].team.score < 0 ? "text-buzzer-red" : "text-gold",
            )}
          >
            {group[0].team.score}
          </p>
        </div>
      </div>
    </div>
  );
}

function RestRow({ entry, solo }: { entry: RankedTeam; solo: boolean }) {
  return (
    <li className="flex min-w-[12vw] items-baseline gap-[0.8vw] overflow-hidden rounded-sm bg-desk px-[1vw] py-[0.5vw]">
      <span className="font-display text-[clamp(1.25rem,1.8vw,2rem)] leading-none text-chalk/60">{ordinal(entry.place)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[clamp(0.95rem,1.25vw,1.35rem)] font-semibold">{entry.team.name}</span>
        {!solo && entry.members.length > 0 && (
          <span className="block truncate text-[clamp(0.75rem,0.9vw,1rem)] text-chalk/60">{entry.members.map((p) => p.name).join(", ")}</span>
        )}
      </span>
      <span className={cn("font-display text-[clamp(1.75rem,2.6vw,3rem)] leading-none tabular-nums", entry.team.score < 0 && "text-buzzer-red")}>
        {entry.team.score}
      </span>
    </li>
  );
}

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
