import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useGame } from './store';

if (import.meta.env.DEV && location.search.includes('debug=')) {
  const { debugStateFromUrl } = await import('./debug');
  const debugState = debugStateFromUrl(location.search);
  if (debugState) useGame.setState({ state: debugState, lastEvents: [] });
}

const root = document.getElementById('root');
if (!root) throw new Error('#root가 없습니다');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
