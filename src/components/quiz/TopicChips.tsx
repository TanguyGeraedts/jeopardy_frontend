import { cn } from "@/lib/cn";
import { TOPIC_LABELS } from "@/lib/topics";
import { MAX_QUIZ_TOPICS, QUIZ_TOPICS, type QuizTopic } from "@/types";

/** A quiz's topics, read-only. */
export function TopicChips({ topics, className }: { topics: QuizTopic[]; className?: string }) {
  if (topics.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {topics.map((topic) => (
        <li key={topic} className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs text-chalk/75">
          {TOPIC_LABELS[topic]}
        </li>
      ))}
    </ul>
  );
}

/** Pick up to MAX_QUIZ_TOPICS. Once full, the others are disabled until one is unpicked. */
export function TopicPicker({ value, onChange, disabled }: { value: QuizTopic[]; onChange: (topics: QuizTopic[]) => void; disabled?: boolean }) {
  const full = value.length >= MAX_QUIZ_TOPICS;
  return (
    <div className="space-y-2">
      <p className="text-xs text-chalk/55">
        Pick up to {MAX_QUIZ_TOPICS}, so people can find it by topic. {value.length}/{MAX_QUIZ_TOPICS} picked.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUIZ_TOPICS.map((topic) => {
          const on = value.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={on}
              disabled={disabled || (!on && full)}
              onClick={() => onChange(on ? value.filter((t) => t !== topic) : [...value, topic])}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-35",
                on ? "bg-gold font-semibold text-studio-night" : "bg-white/[0.07] text-chalk/80 enabled:hover:bg-white/[0.14]",
              )}
            >
              {TOPIC_LABELS[topic]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
