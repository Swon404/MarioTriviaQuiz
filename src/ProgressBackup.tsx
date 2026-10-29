import { useState } from 'react';
import { createProgressBackup, downloadProgress, importProgressBackup, parseBackup, previewBackup, type ProgressBackup as Backup } from './mario/progressBackup.ts';

export default function ProgressBackup() {
  const [backup, setBackup] = useState<Backup | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fail = (error: unknown) => setMessage(error instanceof Error ? error.message : 'The backup could not be read.');
  return <details className="progress-backup">
    <summary>Back up or restore progress</summary>
    <p>Includes scores, lifetime progress, timed records with replays, and learning history. Active rounds and device settings stay on this device. Keep a copy in Files to use on another device.</p>
    <button className="btn-secondary" disabled={busy} onClick={() => { try { downloadProgress(createProgressBackup()); setMessage('Backup prepared. Keep the downloaded file somewhere safe.'); } catch (error) { fail(error); } }}>Download progress backup</button>
    <label>Choose progress backup <input type="file" accept="application/json,.json" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0];
      event.target.value = ''; setBackup(null); setMessage('');
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) { setMessage('Backup is too large (maximum 20 MB).'); return; }
      setBusy(true);
      try { setBackup(parseBackup(await file.text())); } catch (error) { fail(error); } finally { setBusy(false); }
    }} /></label>
    {backup && <div>
      <p>Backup from {new Date(backup.createdAt).toLocaleString()}.</p>
      <ul>{previewBackup(backup).map(part => <li key={part.section}>{part.section}: {part.count}</li>)}</ul>
      <p>Close other quiz tabs first. Add new records and keep existing records with the same ID. The page reloads after importing.</p>
      <button className="btn-primary" disabled={busy} onClick={() => {
        setBusy(true);
        try { importProgressBackup(backup); window.location.reload(); } catch (error) { fail(error); setBusy(false); }
      }}>Merge this backup</button>
      <button className="btn-secondary" disabled={busy} onClick={() => setBackup(null)}>Cancel import</button>
    </div>}
    {message && <p role="status">{message}</p>}
  </details>;
}
