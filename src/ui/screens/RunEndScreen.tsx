import { Screen } from '../components/Screen';
import { useGame } from '../store';

export function RunEndScreen() {
  const state = useGame((s) => s.state);
  const newGame = useGame((s) => s.newGame);
  const won = state.phase === 'runWon';
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-black">{won ? '승리!' : '패배'}</h1>
        <p className="text-sm text-slate-400">
          {state.run
            ? `${state.run.act}막 · HP ${Math.max(0, state.run.hp)} / ${state.run.maxHp}`
            : ''}
        </p>
        <button
          type="button"
          className="min-h-12 w-full max-w-xs rounded-xl bg-sky-600 font-bold active:bg-sky-500"
          onClick={() => newGame()}
        >
          처음으로
        </button>
      </div>
    </Screen>
  );
}
