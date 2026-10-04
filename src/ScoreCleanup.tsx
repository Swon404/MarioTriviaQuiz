import { useState } from 'react';
import { hasCleanupBackup, keepBestTimes, undoScoreCleanup, type TimedGame } from './mario/scoreCleanup.ts';

export default function ScoreCleanup({ kind, onChange }: { kind: TimedGame; onChange: () => void }) {
  const [message, setMessage] = useState('');
  return <div className="score-cleanup">
    <button className="back-btn" onClick={() => {
      if (!window.confirm('Keep only the fastest time in each settings table? Removed times and replays can be restored with Undo cleanup. Earned EP is unchanged.')) return;
      const result = keepBestTimes(kind);
      setMessage(result.ok ? `${result.removed} times removed. Earned EP is unchanged.` : 'Cleanup could not be completed. Check this device’s storage.');
      onChange();
    }}>Keep best per table</button>
    {hasCleanupBackup(kind) && <button className="back-btn" onClick={() => {
      setMessage(undoScoreCleanup(kind) ? 'Removed times restored. New records are kept too.' : 'Restore could not be completed. Your backup is still available.');
      onChange();
    }}>Undo cleanup</button>}
    {message && <p role="status">{message}</p>}
  </div>;
}
