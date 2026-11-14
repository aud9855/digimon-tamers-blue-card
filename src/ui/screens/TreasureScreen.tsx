// 보물 (02 7.4)
import { describeChip } from '../../core/index';
import { constants, getChip } from '../../data/index';
import { PrimaryButton } from '../components/common';
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
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <NodeIcon type="treasure" className="h-16 w-16" />
        <h1 className="text-xl font-black">보물</h1>
        {pending.chipId ? (
          <div className="rounded-xl bg-sky-950 px-4 py-3">
            <p className="flex items-center justify-center gap-2 font-bold text-sky-200">
              <ChipIcon chipId={pending.chipId} className="h-6 w-6" />
              {getChip(pending.chipId).name}
            </p>
            <p className="mt-1 text-sm text-slate-300">{describeChip(pending.chipId)}</p>
          </div>
        ) : (
          <p className="text-amber-300">
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
