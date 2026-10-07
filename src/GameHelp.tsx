import type { ReactNode } from 'react';

export default function GameHelp({ first, hint, children }: { first: boolean; hint: string; children?: ReactNode }) {
  return <div className="game-help">
    {first && <p className="help-copy">{hint}</p>}
    <details><summary>How to play</summary><div>{children ?? hint}</div></details>
  </div>;
}
