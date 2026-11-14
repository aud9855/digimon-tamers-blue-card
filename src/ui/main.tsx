import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useGame } from './store';

if (import.meta.env.DEV) {
  // 개발 서버에서만: 자동 확인 스크립트가 지금 상태를 읽을 수 있게 함
  (window as unknown as { __game: () => unknown }).__game = () => useGame.getState().state;
  const { botAction } = await import('./debug');
  (window as unknown as { __bot: () => unknown }).__bot = () => botAction(useGame.getState().state);
  // ?seed=N: 정해진 시드로 새 게임
  const seed = new URLSearchParams(location.search).get('seed');
  if (seed !== null && !location.search.includes('debug='))
    useGame.getState().newGame(Number(seed));
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
