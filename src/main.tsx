import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGhostMode } from './lib/ghostMode';

// Global error handler to show errors on screen
window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;width:100%;">${e.message}</div>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML += `<div style="position:fixed;top:0;left:0;z-index:9999;background:orange;color:white;padding:20px;width:100%;">${e.reason}</div>`;
});

// Initialize anti-tracking protections
// initGhostMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
