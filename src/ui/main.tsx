import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Action } from '../core/index';
import { App } from './App';
import './index.css';
import { isResumable, loadGame, loadSettings, saveGame, saveSettings } from './save';
import { useGame } from './store';

const params = new URLSearchParams(location.search);
/** 개발 서버에서 주소로 상태를 정했으면 저장을 불러오지 않음 */
const devOverride = import.meta.env.DEV && (params.has('debug') || params.has('seed'));

// 저장 불러오기 (03 9.1): 진행 중인 판이 있으면 그 자리에서 이어 함
const settings = await loadSettings();
useGame.setState({ speed: settings.speed });
if (!devOverride) {
  const saved = await loadGame();
  if (saved && isResumable(saved)) useGame.setState({ state: saved, lastEvents: [] });
}

if (import.meta.env.DEV) {
  // 개발 서버에서만: 자동 확인 스크립트가 지금 상태와 봇의 다음 행동을 읽을 수 있게 함
  const { botAction, debugStateFromUrl } = await import('./debug');
  const w = window as unknown as {
    __game: () => unknown;
    __bot: () => unknown;
    __dispatch: (action: Action) => void;
    __speed: () => unknown;
  };
  w.__game = () => useGame.getState().state;
  w.__bot = () => botAction(useGame.getState().state);
  /** 재생을 건너뛰고 바로 행동 (확인 스크립트가 빨리 진행할 때) */
  w.__dispatch = (action) => {
    useGame.getState().skipPlayback();
    useGame.getState().dispatch(action);
    useGame.getState().skipPlayback();
  };
  w.__speed = () => useGame.getState().speed;
  const seed = params.get('seed');
  if (seed !== null && !params.has('debug')) useGame.getState().newGame(Number(seed));
  const debugState = debugStateFromUrl(location.search);
  if (debugState) useGame.setState({ state: debugState, lastEvents: [] });
}

// 행동 하나가 끝날 때마다 저장 (재생 중인 화면이 아니라 진짜 상태를 저장)
useGame.subscribe((s, prev) => {
  if (s.state !== prev.state) void saveGame(s.state);
  if (s.speed !== prev.speed) void saveSettings({ speed: s.speed });
});

const root = document.getElementById('root');
if (!root) throw new Error('#root가 없습니다');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
