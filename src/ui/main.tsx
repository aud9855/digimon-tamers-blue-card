import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useGame } from './store';

if (import.meta.env.DEV) {
  // 개발 서버에서만: 자동 확인 스크립트가 지금 상태를 읽을 수 있게 함
  (window as unknown as { __game: () => unknown }).__game = () => useGame.getState().state;
}

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
