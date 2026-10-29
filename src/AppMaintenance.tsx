import { useEffect, useState, useSyncExternalStore } from 'react';
import { applyPwaUpdate, pwaStatus, startPwa, subscribePwa, setPwaSafe } from './pwa.ts';

export default function AppMaintenance({ safe }: { safe: boolean }) {
  const status = useSyncExternalStore(subscribePwa, pwaStatus);
  const [dismissed, dismiss] = useState<ReturnType<typeof pwaStatus> | null>(null);
  useEffect(startPwa, []);
  useEffect(() => setPwaSafe(safe), [safe]);
  return <div className="app-maintenance">
    <small>Build {import.meta.env.VITE_BUILD_VERSION || 'local'}</small>
    {safe && dismissed !== status && (status.update || status.offline || status.error) && <div role="status">
      <p>{status.error ? 'The update could not finish. You can keep playing and try again later.'
        : status.update ? 'A new version is ready. Update now between games.' : 'Ready to play offline on this device.'}</p>
      {status.update && <button className="btn-secondary" onClick={() => void applyPwaUpdate(safe)}>Update now</button>}
      <button className="btn-secondary" onClick={() => dismiss(status)}>{status.update ? 'Later' : 'OK'}</button>
    </div>}
  </div>;
}
