// 결과 화면 (runWon / runLost)
import { getChip, getTamer } from '../../data/index';
import { displayFormId, Hero, PrimaryButton, ScreenTitle } from '../components/common';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function RunEndScreen() {
  const state = useDisplayState();
  const newGame = useGame((s) => s.newGame);
  const notice = useGame((s) => s.unlockNotice);
  const run = state.run;
  const won = state.phase === 'runWon';
  return (
    <Screen backdrop={run?.act}>
      <div
        className={`flex flex-1 flex-col items-center justify-center-safe gap-5 overflow-y-auto px-6 py-6 text-center ${
          won ? '' : 'bg-rose-950/30'
        }`}
      >
        <ScreenTitle
          kicker={won ? 'RUN CLEAR' : 'GAME OVER'}
          accent={won ? '#fbbf24' : '#fb7185'}
          center
        >
          <span className={`text-4xl ${won ? 'text-amber-300' : 'text-rose-400'}`}>
            {won ? '승리!' : '패배'}
          </span>
        </ScreenTitle>
        {run && (
          <Hero
            formId={displayFormId(run.tamerId, run.maxStage)}
            size={112}
            ray="252 211 77"
            dim={!won}
          />
        )}
        {run && (
          <div className="ui-panel w-full max-w-xs p-4 text-left text-sm text-slate-300">
            <p>
              테이머: <b className="text-white">{getTamer(run.tamerId).name}</b>
            </p>
            <div className="my-2 grid grid-cols-3 gap-2">
              <div className="ui-stat">
                도달<b>{run.act}막</b>
              </div>
              <div className="ui-stat">
                지나온 칸<b>{run.path.length}</b>
              </div>
              <div className="ui-stat">
                덱<b>{run.deck.length}장</b>
              </div>
            </div>
            <p>
              HP {Math.max(0, run.hp)} / {run.maxHp} · {run.bits} 비트
            </p>
            {run.chips.length > 0 && (
              <p>칩: {run.chips.map((id) => getChip(id).name).join(', ')}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">시드 {state.seed}</p>
          </div>
        )}
        {notice.length > 0 && (
          <div
            className="ui-panel w-full max-w-xs border-amber-400 p-4 text-left text-sm"
            data-testid="unlock-notice"
          >
            <p className="mb-1 font-bold text-amber-300">새로 열렸습니다</p>
            {notice.map((n) => (
              <p key={n}>{n}</p>
            ))}
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
