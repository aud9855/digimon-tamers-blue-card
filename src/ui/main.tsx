import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Action } from '../core/index';
import { App as GameApp } from './App';
import './index.css';
import {
  isResumable,
  loadGame,
  loadProfile,
  loadSettings,
  saveGame,
  saveProfile,
  saveSettings,
} from './save';
import { useGame } from './store';

const params = new URLSearchParams(location.search);
/** 개발 서버에서 주소로 상태를 정했으면 저장을 불러오지 않음 */
const devOverride = import.meta.env.DEV && (params.has('debug') || params.has('seed'));

// 저장 불러오기 (03 9.1): 진행 중인 판이 있으면 그 자리에서 이어 함
const settings = await loadSettings();
useGame.setState({ speed: settings.speed, seenGuide: settings.seenGuide });
// 프로필(해금·도감)을 먼저 불러와 제목 화면의 판이 해금 정보를 갖게 함 (02 13.5)
useGame.setState({ profile: await loadProfile() });
useGame.getState().newGame();
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
  if (s.profile !== prev.profile) void saveProfile(s.profile);
  if (s.speed !== prev.speed || s.seenGuide !== prev.seenGuide) {
    void saveSettings({ speed: s.speed, seenGuide: s.seenGuide });
  }
  // 처음 전투에 들어가면 하는 법을 한 번 보여 줌
  if (s.state.phase === 'battle' && prev.state.phase !== 'battle' && !s.seenGuide && !devOverride) {
    useGame.setState({ panel: 'guide', seenGuide: true });
  }
});

// 오프라인 실행 (04 T1-8): 웹 배포 빌드에서만 서비스 워커 등록 (APK는 파일이 앱 안에 있음)
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js');
}

// APK: 휴대폰 뒤로 버튼으로 앱이 닫히지 않게, 열린 창만 닫음 (03 9.2)
if (Capacitor.isNativePlatform()) {
  void App.addListener('backButton', () => {
    if (useGame.getState().panel) useGame.getState().setPanel(null);
  });
}

const root = document.getElementById('root');
if (!root) throw new Error('#root가 없습니다');
createRoot(root).render(
  <StrictMode>
    <GameApp />
  </StrictMode>,
);
