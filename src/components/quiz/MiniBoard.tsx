import { cn } from "@/lib/cn";

/** Columns and rows a card has room for; bigger boards are cut off on the right/bottom. */
const MAX_COLUMNS = 6;
const MAX_ROWS = 5;

/**
 * A quiz's board in miniature: category names across the top, one small block per question below, the shape players
 * will see. Never the questions themselves (this is what Discover may show of someone else's quiz).
 */
export function MiniBoard({ categories, className }: { categories: { name: string; questionCount: number }[]; className?: string }) {
  if (categories.length === 0) {
    return (
      <div className={cn("grid h-28 place-items-center rounded-sm bg-studio-night/60 text-sm text-chalk/40", className)}>
        Empty board
      </div>
    );
  }

  const shown = categories.slice(0, MAX_COLUMNS);
  const rows = Math.min(MAX_ROWS, Math.max(1, ...shown.map((c) => c.questionCount)));

  return (
    <div
      aria-hidden
      className={cn("grid h-28 gap-[3px] rounded-sm bg-studio-night p-[3px]", className)}
      style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}
    >
      {shown.map((category, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-[3px]">
          <div className="flex h-9 shrink-0 items-center justify-center rounded-[2px] bg-board-blue px-1">
            <span className="line-clamp-2 text-center font-display text-[0.7rem] uppercase leading-[1.05] tracking-wide">{category.name}</span>
          </div>
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className={cn("min-h-0 flex-1 rounded-[2px]", row < category.questionCount ? "bg-board-blue/80" : "bg-board-blue/15")} />
          ))}
        </div>
      ))}
    </div>
  );
}
