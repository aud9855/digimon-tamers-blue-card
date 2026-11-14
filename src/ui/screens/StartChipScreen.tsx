// 시작 디아크 고르기 (02 12.7)
import { describeChip } from '../../core/index';
import { getChip, getTamer } from '../../data/index';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';
import { ChipIcon } from '../components/Sprites';

export function StartChipScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const pending = state.pending?.kind === 'startChip' ? state.pending : null;
  if (!pending || !state.run) return null;
  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-4 px-6">
        <p className="text-center text-sm text-slate-400">
          {getTamer(state.run.tamerId).name}의 디아크
        </p>
        <h1 className="text-center text-2xl font-black">시작 칩을 고르세요</h1>
        <div className="mt-2 flex flex-col gap-3">
          {pending.chipIds.map((id, index) => (
            <button
              key={id}
              type="button"
              data-start-chip={index}
              onClick={() => dispatch({ type: 'chooseStartChip', index })}
              className="min-h-16 rounded-xl bg-sky-950 px-4 py-3 text-left active:bg-sky-900"
            >
              <b className="flex items-center gap-2 text-sky-200">
                <ChipIcon chipId={id} className="h-6 w-6" />
                {getChip(id).name}
              </b>
              <span className="block text-sm text-slate-300">{describeChip(id)}</span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
