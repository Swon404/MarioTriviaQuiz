import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './MarioApp.tsx';
import './styles.css';
import './mario-theme.css';
import './modes.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
