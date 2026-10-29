// Call before saving, with records already filtered to the same rules/configuration.
// Timed stores contain eligible human attempts only, including both local players.
export function personalTimeBest(records: readonly { player: string; elapsedMs: number }[], player: string): number | undefined {
  const name = player.trim().toLocaleLowerCase();
  const times = records.filter(item => item.player.trim().toLocaleLowerCase() === name).map(item => item.elapsedMs);
  return times.length ? Math.min(...times) : undefined;
}
export function personalBestMessage(time: number, previous?: number): string {
  if (previous === undefined) return 'First personal best for this challenge!';
  if (time >= previous) return '';
  const difference = previous - time;
  return `Personal best — ${difference < 100 ? 'less than 0.1' : (difference / 1000).toFixed(1)}s faster!`;
}
