// 시작 디아크 고르기 (02 12.7)
import { describeChip } from '../../core/index';
import { getChip, getTamer } from '../../data/index';
import { ScreenTitle } from '../components/common';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';
import { ChipIcon } from '../components/Sprites';

export function StartChipScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const pending = state.pending?.kind === 'startChip' ? state.pending : null;
  if (!pending || !state.run) return null;
  return (
    <Screen backdrop={1}>
      <div className="flex flex-1 flex-col justify-center-safe gap-5 overflow-y-auto px-6 py-6">
        <ScreenTitle kicker={`${getTamer(state.run.tamerId).name}의 디아크`} center>
          시작 칩을 고르세요
        </ScreenTitle>
        <div className="mt-2 flex flex-col gap-3">
          {pending.chipIds.map((id, index) => (
            <button
              key={id}
              type="button"
              data-start-chip={index}
              onClick={() => dispatch({ type: 'chooseStartChip', index })}
              className="ui-choice flex min-h-16 items-center gap-3"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-950/80 ring-1 ring-sky-400/50">
                <ChipIcon chipId={id} className="h-8 w-8" />
              </span>
              <span className="min-w-0">
                <b className="block text-sky-200">{getChip(id).name}</b>
                <span className="block text-sm text-slate-300">{describeChip(id)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
