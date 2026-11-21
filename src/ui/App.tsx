// 국면(phase)에 따라 화면을 바꿈 (03 9.1)
import { memo, useEffect } from 'react';
import type { Phase } from '../core/index';
import { ActClearScreen } from './screens/ActClearScreen';
import { BattleScreen } from './screens/BattleScreen';
import { EventScreen } from './screens/EventScreen';
import { MapScreen } from './screens/MapScreen';
import { RestScreen } from './screens/RestScreen';
import { RewardScreen } from './screens/RewardScreen';
import { RunEndScreen } from './screens/RunEndScreen';
import { StartChipScreen } from './screens/StartChipScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TitleScreen } from './screens/TitleScreen';
import { TreasureScreen } from './screens/TreasureScreen';
import { FxLayer } from './components/FxLayer';
import { PlaybackOverlay } from './components/PlaybackOverlay';
import { ErrorScreen } from './components/ErrorBoundary';
import { PanelHost } from './components/Settings';
import { isConsistentState } from './save';
import { installInputGuard, lockInput } from './inputGuard';
import { useDisplayState, useGame } from './store';

const SCREENS: Record<Phase, () => React.JSX.Element | null> = {
  title: TitleScreen,
  startChip: StartChipScreen,
  map: MapScreen,
  battle: BattleScreen,
  reward: RewardScreen,
  shop: ShopScreen,
  rest: RestScreen,
  event: EventScreen,
  treasure: TreasureScreen,
  actClear: ActClearScreen,
  runWon: RunEndScreen,
  runLost: RunEndScreen,
};

/** 휴대폰 뒤로 버튼·제스처로 실수로 나가지 않게 함 (03 9.2) */
function useBackButtonGuard() {
  useEffect(() => {
    history.pushState({ guard: true }, '');
    const onPop = () => {
      history.pushState({ guard: true }, '');
      // 열린 창(설정·도감 등)이 있으면 뒤로가기로 닫음 (APK 뒤로 버튼과 같게)
      const { panel, setPanel } = useGame.getState();
      if (panel) setPanel(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}

/** 국면·턴이 바뀐 직후의 연타가 새 화면 버튼에 닿지 않게 (팀 점검 QA 1·2) */
function useInputGuard(phase: Phase, turn: number | undefined) {
  useEffect(() => installInputGuard(), []);
  useEffect(() => {
    lockInput();
  }, [phase, turn]);
}

// 받는 값이 없는 겹 화면: 필요한 것은 각자 구독하므로 App이 다시 그려질 때 따라 그리지 않음
const FxLayerMemo = memo(FxLayer);
const PlaybackOverlayMemo = memo(PlaybackOverlay);
const PanelHostMemo = memo(PanelHost);

export function App() {
  useBackButtonGuard();
  const state = useDisplayState();
  useInputGuard(state.phase, state.battle?.turn);
  const Current = SCREENS[state.phase] as (typeof SCREENS)[Phase] | undefined;
  // 상태가 국면과 맞지 않으면 화면이 아무것도 그리지 못하므로 빈 화면 대신 안내
  if (!Current || !isConsistentState(state)) {
    const message = `상태가 맞지 않음: phase=${state.phase}, pending=${state.pending?.kind ?? '없음'}`;
    return <ErrorScreen message={message} />;
  }
  return (
    <>
      <Current />
      <FxLayerMemo />
      <PlaybackOverlayMemo />
      <PanelHostMemo />
    </>
  );
}
