import type { SessionBuzz } from "@/types";

const seconds = (ms: number) => (Math.max(0, ms) / 1000).toFixed(3);

/**
 * The time shown next to a buzz: the first one gets its reaction time ("0.412s" after the buzzers opened),
 * everyone after gets how far behind the first they were ("+0.038s"). Measured on the server, so phones' clocks don't matter.
 */
export function buzzTime(buzzes: readonly SessionBuzz[], index: number): string {
  const buzz = buzzes[index];
  if (!buzz) return "";
  return index === 0 ? `${seconds(buzz.reactionMs)}s` : `+${seconds(buzz.reactionMs - buzzes[0].reactionMs)}s`;
}
