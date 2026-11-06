import type { KartEffect } from './mario/kartQuest.ts';

function Eyes({ y = 35 }: { y?: number }) {
  return <g fill="#182329" stroke="none"><ellipse cx="27" cy={y} rx="2.5" ry="5" /><ellipse cx="37" cy={y} rx="2.5" ry="5" /></g>;
}

// Chunky, consistent artwork stays legible on phones without depending on
// the device's emoji font. Space names remain in the surrounding accessible label.
export default function KartSpaceIcon({ effect, left = false }: { effect: KartEffect; left?: boolean }) {
  return <svg className={`kart-powerup kart-powerup-${effect}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <g strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      {effect === 'pipe' && <>
        <path d="M15 23h34v35H15Z" fill="#18b943" stroke="#094b26" />
        <path d="M21 26v29" stroke="#8af36c" strokeWidth="6" />
        <path d="M44 26v29" stroke="#0a802f" strokeWidth="5" />
        <rect x="8" y="9" width="48" height="18" rx="1.5" fill="#29d647" stroke="#094b26" />
        <path d="M12 13h39M16 15v8" stroke="#b2ff83" strokeWidth="3" />
        <path d="M51 14v9H12" fill="none" stroke="#109333" strokeWidth="3" />
      </>}
      {effect === 'mushroom' && <>
        <rect x="19" y="31" width="26" height="27" rx="9" fill="#ffe8bb" stroke="#56372c" />
        <path d="M6 32C6 17 16 5 32 5s26 12 26 27c0 9-52 9-52 0Z" fill="#ed263b" stroke="#56372c" />
        <ellipse cx="32" cy="18" rx="8" ry="10" fill="#fff9e9" stroke="none" />
        <path d="M10 22q11-5 10 8t-13 1M54 22q-11-5-10 8t13 1" fill="#fff9e9" stroke="none" />
        <Eyes y={44} />
      </>}
      {effect === 'star' && <>
        <path d="m32 5 8.5 16.5L59 25 46 38l2 19-16-8-16 8 2-19L5 25l18.5-3.5Z" fill="#ffda4b" stroke="#986321" />
        <path d="m29 15-6 12-8 2" fill="none" stroke="#fff4a9" strokeWidth="4" />
        <Eyes y={32} />
      </>}
      {effect === 'banana' && <>
        <path d="M29 9h7c-2 11 1 21 8 30l-11 9-13-9c8-11 11-20 9-30Z" fill="#ffe035" stroke="#97651b" />
        <path d="M25 33C20 45 12 48 5 44c1 12 17 14 27-3M38 33c4 11 12 17 21 14-3 13-19 12-27-6" fill="#ffd02b" stroke="#97651b" />
        <path d="M31 39c-7 8-10 15-8 20 11-1 17-8 15-17" fill="#ffed6b" stroke="#97651b" />
        <path d="m29 10 1-5h6v5" fill="#8a6930" stroke="#624521" />
        <path d="M30 14q-1 6-3 10" fill="none" stroke="#fff7a3" strokeWidth="3" />
        <g fill="#343022" stroke="none"><ellipse cx="29" cy="29" rx="1.8" ry="3.6" /><ellipse cx="36" cy="29" rx="1.8" ry="3.6" /><ellipse cx="32.5" cy="37" rx="2.7" ry="1.5" /></g>
      </>}
      {effect === 'box' && <>
        <rect x="6" y="6" width="52" height="52" rx="2" fill="#ffbc25" stroke="#8b4716" />
        <path d="M10 52V10h42" fill="none" stroke="#ffe675" strokeWidth="3" />
        <path d="M54 12v42H12" fill="none" stroke="#dd8316" strokeWidth="3" />
        <g fill="#9b571d" stroke="none"><circle cx="13" cy="13" r="1.8" /><circle cx="51" cy="13" r="1.8" /><circle cx="13" cy="51" r="1.8" /><circle cx="51" cy="51" r="1.8" /></g>
        <path d="M22 17h18v5h5v12h-5v5h-5v5h-8V33h6v-5h4v-5H26v6h-8v-7h4Z" fill="#a35a1a" stroke="none" transform="translate(1 2)" />
        <path d="M22 17h18v5h5v12h-5v5h-5v5h-8V33h6v-5h4v-5H26v6h-8v-7h4Z" fill="#fff8d6" stroke="none" />
        <path d="M27 47h8v7h-8Z" fill="#fff8d6" stroke="none" />
      </>}
      {effect === 'rival' && <>
        <path d="M13 57V8" stroke="#ffe8a2" strokeWidth="5" />
        <path d="M16 10h40v32H16Z" fill="#fff9e9" stroke="#263347" />
        {[0, 1, 2, 3].flatMap(row => [0, 1, 2, 3, 4].filter(col => (row + col) % 2 === 0).map(col => <rect key={`${row}:${col}`} x={16 + col * 8} y={10 + row * 8} width="8" height="8" fill="#34465d" stroke="none" />))}
        <circle cx="13" cy="7" r="3" fill="#ffda4b" stroke="none" />
      </>}
      {effect === 'road' && <path d="M13 32h36M37 20l12 12-12 12" transform={left ? 'rotate(180 32 32)' : undefined} fill="none" stroke="#c7d8df" strokeWidth="5" />}
    </g>
  </svg>;
}
