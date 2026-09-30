export type TurnScores = {
  active: 0 | 1;
  points: [number, number];
  correct: [number, number];
  streaks: [number, number];
  bestStreaks: [number, number];
  elapsed: [number, number];
  previousOrderMs: number | null;
};
export const newTurnScores = (): TurnScores => ({ active: 0, points: [0, 0], correct: [0, 0], streaks: [0, 0], bestStreaks: [0, 0], elapsed: [0, 0], previousOrderMs: null });
export function scoreTurn(state: TurnScores, index: number, correct: boolean, points: number, elapsedMs: number, timedOrder: boolean, clueDuel = false): TurnScores {
  const next: TurnScores = { ...state, points: [...state.points], correct: [...state.correct], streaks: [...state.streaks], bestStreaks: [...state.bestStreaks], elapsed: [...state.elapsed] };
  const player = state.active;
  next.correct[player] += Number(correct);
  next.points[player] += timedOrder ? 0 : points;
  next.elapsed[player] += elapsedMs;
  next.streaks[player] = correct ? state.streaks[player] + 1 : 0;
  next.bestStreaks[player] = Math.max(next.bestStreaks[player], next.streaks[player]);
  if (timedOrder) {
    if (index % 2 === 0) next.previousOrderMs = elapsedMs;
    else if (state.previousOrderMs !== null) {
      if (state.previousOrderMs <= elapsedMs) next.points[0] += 1;
      if (elapsedMs <= state.previousOrderMs) next.points[1] += 1;
      next.previousOrderMs = null;
    }
  }
  next.active = (clueDuel && correct ? 1 - state.active : (index + 1) % 2) as 0 | 1;
  return next;
}
