// 결과 화면 (runWon / runLost)
import { getChip, getTamer } from '../../data/index';
import { PrimaryButton } from '../components/common';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function RunEndScreen() {
  const state = useDisplayState();
  const newGame = useGame((s) => s.newGame);
  const run = state.run;
  const won = state.phase === 'runWon';
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className={`text-4xl font-black ${won ? 'text-amber-300' : 'text-rose-400'}`}>
          {won ? '승리!' : '패배'}
        </h1>
        {run && (
          <div className="w-full max-w-xs rounded-xl bg-slate-900 p-4 text-left text-sm text-slate-300">
            <p>
              테이머: <b className="text-white">{getTamer(run.tamerId).name}</b>
            </p>
            <p>
              {run.act}막 · 지나온 칸 {run.path.length}개
            </p>
            <p>
              HP {Math.max(0, run.hp)} / {run.maxHp} · {run.bits} 비트
            </p>
            <p>덱 {run.deck.length}장</p>
            {run.chips.length > 0 && (
              <p>칩: {run.chips.map((id) => getChip(id).name).join(', ')}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">시드 {state.seed}</p>
          </div>
        )}
        <div className="w-full max-w-xs">
          <PrimaryButton testId="new-game" onClick={() => newGame()}>
            처음으로
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
