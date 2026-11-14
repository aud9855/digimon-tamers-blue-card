import { getTamers } from '../../data/index';
import { Screen } from '../components/Screen';
import { SettingsButton } from '../components/Settings';
import { useGame } from '../store';

export function TitleScreen() {
  const dispatch = useGame((s) => s.dispatch);
  return (
    <Screen>
      <div className="flex justify-end px-4 pt-3">
        <SettingsButton />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 text-center">
        <div>
          <p className="text-sm tracking-widest text-sky-300">DIGIMON TAMERS</p>
          <h1 className="mt-2 text-3xl font-black">블루 카드</h1>
          <p className="mt-3 text-xs text-slate-400">비공식 팬 게임</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {getTamers().map((t) => (
            <button
              key={t.id}
              type="button"
              className="min-h-12 rounded-xl bg-sky-600 font-bold active:bg-sky-500"
              onClick={() => dispatch({ type: 'startRun', tamerId: t.id })}
            >
              {t.name}로 시작
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
