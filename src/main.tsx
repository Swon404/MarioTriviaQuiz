import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './MarioApp.tsx';
import './styles.css';
import './mario-theme.css';
import './modes.css';
import { recoverProgressImport } from './mario/progressBackup.ts';
import { startOnlineSync } from './mario/onlineScores.ts';

let recovered = true;
try { recovered = recoverProgressImport(); } catch { /* Storage access can be blocked; normal in-memory play remains available. */ }
if (recovered) startOnlineSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {recovered ? <App /> : <main className="mario-app"><h1>Progress recovery needs another try</h1><p>An interrupted import could not be rolled back. Your recovery copy is still on this device. Close other quiz tabs and free some browser storage without clearing this site’s data, then reload.</p><button onClick={() => window.location.reload()}>Retry recovery</button></main>}
  </StrictMode>,
);
