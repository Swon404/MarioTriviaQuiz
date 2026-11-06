import type { KartEffect } from './mario/kartQuest.ts';

function Smile({ y = 35 }: { y?: number }) {
  return <g fill="#263347" stroke="none"><ellipse cx="27" cy={y} rx="2" ry="3" /><ellipse cx="37" cy={y} rx="2" ry="3" /><path d={`M28 ${y + 7}q4 5 8 0`} fill="none" stroke="#263347" strokeWidth="2" strokeLinecap="round" /></g>;
}

// Chunky, consistent artwork stays legible on phones without depending on
// the device's emoji font. Space names remain in the surrounding accessible label.
export default function KartSpaceIcon({ effect, left = false }: { effect: KartEffect; left?: boolean }) {
  return <svg className={`kart-powerup kart-powerup-${effect}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <g strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      {effect === 'pipe' && <>
        <path d="M15 21h34v32q0 5-5 5H20q-5 0-5-5Z" fill="#36c867" stroke="#124c37" />
        <path d="M20 27v24" stroke="#a1ffb0" strokeWidth="5" />
        <rect x="9" y="12" width="46" height="16" rx="5" fill="#63eb7c" stroke="#124c37" />
        <ellipse cx="32" cy="12" rx="23" ry="7" fill="#91f9a1" stroke="#124c37" />
        <ellipse cx="32" cy="12" rx="16" ry="3.5" fill="#186840" stroke="none" />
        <Smile y={38} />
      </>}
      {effect === 'mushroom' && <>
        <rect x="19" y="31" width="26" height="27" rx="11" fill="#fff0c7" stroke="#673c40" />
        <path d="M6 32C6 17 16 5 32 5s26 12 26 27c0 9-52 9-52 0Z" fill="#ff596e" stroke="#673c40" />
        <ellipse cx="32" cy="18" rx="8" ry="10" fill="#fff9e9" stroke="none" />
        <path d="M10 22q11-5 10 8t-13 1M54 22q-11-5-10 8t13 1" fill="#fff9e9" stroke="none" />
        <Smile y={43} />
      </>}
      {effect === 'star' && <>
        <path d="m32 5 8.5 16.5L59 25 46 38l2 19-16-8-16 8 2-19L5 25l18.5-3.5Z" fill="#ffda4b" stroke="#986321" />
        <path d="m29 15-6 12-8 2" fill="none" stroke="#fff4a9" strokeWidth="4" />
        <Smile y={31} />
      </>}
      {effect === 'banana' && <>
        <path d="M29 10h7l-2 8q-3 13 5 23l-12 4q-8-17 2-35Z" fill="#fff0a0" stroke="#926124" />
        <path d="M27 32Q17 47 6 43q4 14 21 8l6-10q5 16 23 10-12-5-16-19-6 9-7 9Z" fill="#ffdb48" stroke="#926124" />
        <path d="M32 39q-9 9-7 20 12-1 14-10Z" fill="#ffe777" stroke="#926124" />
        <path d="m29 9 1-4h7l-1 5" fill="#6bb668" stroke="#49774a" />
        <Smile y={27} />
      </>}
      {effect === 'box' && <>
        <rect x="8" y="8" width="48" height="48" rx="10" fill="#ffb338" stroke="#9d5823" />
        <path d="M15 27V19q0-4 4-4h23" fill="none" stroke="#fff0a2" strokeWidth="4" />
        <path d="M24 25q0-10 9-10 10 0 10 8 0 6-8 9v6" fill="none" stroke="#fff9e7" strokeWidth="6" />
        <circle cx="35" cy="46" r="3.5" fill="#fff9e7" stroke="none" />
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
