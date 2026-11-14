// 국면(phase)에 따라 화면을 바꿈 (03 9.1)
import { useEffect } from 'react';
import type { Phase } from '../core/index';
import { ActClearScreen } from './screens/ActClearScreen';
import { BattleScreen } from './screens/BattleScreen';
import { EventScreen } from './screens/EventScreen';
import { MapScreen } from './screens/MapScreen';
import { RestScreen } from './screens/RestScreen';
import { RewardScreen } from './screens/RewardScreen';
import { RunEndScreen } from './screens/RunEndScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TitleScreen } from './screens/TitleScreen';
import { TreasureScreen } from './screens/TreasureScreen';
import { PlaybackOverlay } from './components/PlaybackOverlay';
import { SettingsPanel } from './components/Settings';
import { useDisplayState } from './store';

const SCREENS: Record<Phase, () => React.JSX.Element | null> = {
  title: TitleScreen,
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
    const onPop = () => history.pushState({ guard: true }, '');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}

export function App() {
  useBackButtonGuard();
  const phase = useDisplayState().phase;
  const Current = SCREENS[phase];
  return (
    <>
      <Current />
      <PlaybackOverlay />
      <SettingsPanel />
    </>
  );
}
