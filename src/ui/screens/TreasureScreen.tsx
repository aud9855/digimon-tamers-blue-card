// 보물 (02 7.4)
import { describeChip } from '../../core/index';
import { constants, getChip } from '../../data/index';
import { Hero, PrimaryButton, ScreenTitle } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';
import { ChipIcon, NodeIcon } from '../components/Sprites';

export function TreasureScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const pending = state.pending?.kind === 'treasure' ? state.pending : null;
  if (!pending) return null;

  return (
    <Screen backdrop={state.run?.act}>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col items-center justify-center-safe gap-5 overflow-y-auto px-6 py-4 text-center">
        <ScreenTitle kicker="TREASURE" accent="#fbbf24" center>
          보물
        </ScreenTitle>
        <Hero size={96} ray="252 211 77">
          <NodeIcon type="treasure" className="relative h-24 w-24" />
        </Hero>
        {pending.chipId ? (
          <div className="ui-panel w-full max-w-xs px-4 py-3">
            <p className="flex items-center justify-center gap-2 font-bold text-sky-200">
              <ChipIcon chipId={pending.chipId} className="h-8 w-8" />
              {getChip(pending.chipId).name}
            </p>
            <p className="mt-1 text-sm text-slate-300">{describeChip(pending.chipId)}</p>
          </div>
        ) : (
          <p className="ui-panel px-4 py-3 text-amber-300">
            남은 칩이 없어 {constants.NO_CHIP_BITS} 비트를 얻었습니다
          </p>
        )}
        <div className="w-full max-w-xs">
          <PrimaryButton testId="proceed" onClick={() => dispatch({ type: 'proceed' })}>
            계속
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
