// Coordinates share the road's 400 x 600 viewBox. Fractional spaces follow
// the two quadratic curves at each hairpin, rather than crossing the grass.
export function kartPoint(position: number): { x: number; y: number } {
  const p = Math.max(0, Math.min(24, position));
  if (p < 1) return { x: 50, y: 20 + p * 30 };
  const index = p - 1;
  const row = Math.min(5, Math.floor(index / 4));
  const along = index - row * 4;
  const right = row % 2 === 0;
  const y = row * 100 + 50;
  if (along <= 3) return { x: right ? 50 + along * 100 : 350 - along * 100, y };
  const t = (along - 3) * 2;
  const edge = right ? 350 : 50;
  const direction = right ? 1 : -1;
  return t <= 1
    ? { x: edge + direction * 25 * (2 * t - t * t), y: y + 50 * t * t }
    : { x: edge + direction * 25 * (1 - (t - 1) ** 2), y: y + 50 + 50 * (2 * (t - 1) - (t - 1) ** 2) };
}

export function kartMotion(from: number, to: number) {
  const start = Math.max(0, Math.min(24, from));
  const end = Math.max(0, Math.min(24, to));
  const steps = Math.max(1, Math.ceil(Math.abs(end - start) * 20));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const position = start + (end - start) * i / steps;
    const point = kartPoint(position);
    // Keep facing forwards when a banana sends the kart into reverse.
    const before = kartPoint(Math.max(0, position - .001));
    const after = kartPoint(Math.min(24, position + .001));
    return { left: `${point.x / 4}%`, top: `${point.y / 6}%`, angle: Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI + 90 };
  });
}
