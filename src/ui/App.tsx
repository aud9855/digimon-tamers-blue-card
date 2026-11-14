// 국면(phase)에 따라 화면을 바꿈 (03 9.1)
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
import { useGame } from './store';

const SCREENS: Record<Phase, () => React.JSX.Element> = {
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

export function App() {
  const phase = useGame((s) => s.state.phase);
  const Current = SCREENS[phase];
  return <Current />;
}
