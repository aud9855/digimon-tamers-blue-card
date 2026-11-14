import { describeTamer, getLegalActions } from '../../core/index';
import { getForm, getTamers } from '../../data/index';
import { ATTRIBUTE_BG } from '../components/labels';
import { Screen } from '../components/Screen';
import { SettingsButton } from '../components/Settings';
import { useDisplayState, useGame } from '../store';

export function TitleScreen() {
  const dispatch = useGame((s) => s.dispatch);
  const setPanel = useGame((s) => s.setPanel);
  const state = useDisplayState();
  const open = new Set(
    getLegalActions(state).flatMap((a) => (a.type === 'startRun' ? [a.tamerId] : [])),
  );
  return (
    <Screen>
      <div className="flex justify-end px-4 pt-3">
        <SettingsButton />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 text-center">
        <div>
          <p className="text-sm tracking-widest text-sky-300">DIGIMON TAMERS</p>
          <h1 className="mt-2 text-3xl font-black">블루 카드</h1>
          <p className="mt-3 text-xs text-slate-400">비공식 팬 게임</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <p className="text-left text-sm text-slate-400">테이머를 고르세요</p>
          {getTamers().map((t) => {
            const partner = getForm(t.line, 'rookie');
            const locked = !open.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                data-tamer={t.id}
                disabled={locked}
                className="flex min-h-16 items-center gap-3 rounded-xl bg-slate-800 p-3 text-left active:bg-slate-700 disabled:opacity-40"
                onClick={() => dispatch({ type: 'startRun', tamerId: t.id })}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${ATTRIBUTE_BG[partner.attribute]} text-xs font-bold`}
                >
                  {partner.name}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <b>{t.name}</b>
                    <span className="text-xs text-rose-300">HP {t.maxHp}</span>
                  </span>
                  <span className="block text-xs text-sky-200">
                    {locked ? '3막을 깨면 열립니다' : t.trait}
                  </span>
                  <span className="block text-xs leading-snug text-slate-400">
                    {describeTamer(t.id)}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="title-guide"
              onClick={() => setPanel('guide')}
              className="min-h-11 rounded-xl bg-slate-800 text-sm font-bold active:bg-slate-700"
            >
              하는 법
            </button>
            <button
              type="button"
              data-testid="title-info"
              onClick={() => setPanel('info')}
              className="min-h-11 rounded-xl bg-slate-800 text-sm font-bold active:bg-slate-700"
            >
              정보·저작권
            </button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          비공식·비영리 팬 게임 · 디지몬 관련 권리는 © BANDAI, © TOEI ANIMATION, © WiZ 등에 있습니다
        </p>
      </div>
    </Screen>
  );
}
