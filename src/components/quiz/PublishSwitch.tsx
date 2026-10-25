import { cn } from "@/lib/cn";

/** Public = findable in Discover. The label says the state, the switch changes it. */
export function PublishSwitch({ published, busy, disabled, onToggle }: { published: boolean; busy?: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label="Show in Discover"
      disabled={busy || disabled}
      onClick={onToggle}
      className="flex shrink-0 items-center gap-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className={published ? "text-gold" : "text-chalk/55"}>{published ? "Public" : "Private"}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition", published ? "bg-gold" : "bg-white/20")}>
        <span className={cn("absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform", published && "translate-x-4 bg-studio-night")} />
      </span>
    </button>
  );
}
