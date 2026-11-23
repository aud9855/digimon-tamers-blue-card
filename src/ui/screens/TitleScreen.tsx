import { useState } from 'react';
import { describeHazard, describeTamer, getLegalActions, tamerUnlockWins } from '../../core/index';
import { getForm, getTamers } from '../../data/index';
import { FormSprite, TamerFace } from '../components/Sprites';
import { Screen } from '../components/Screen';
import { SettingsButton } from '../components/Settings';
import { useDisplayState, useGame } from '../store';

/** 잠긴 테이머의 해금 조건 글 (02 13.5, 15.2) */
function unlockHint(wins: number): string {
  return wins <= 1 ? '3막을 깨면 열립니다' : `3막을 ${wins}번 깨면 열립니다`;
}

/** 제목 위 블루 카드 표시 (직접 그림): 빛나는 파란 카드 한 장 */
function BlueCardLogo() {
  return (
    <svg
      viewBox="0 0 40 52"
      className="h-16 w-12 [filter:drop-shadow(0_0_10px_rgb(56_189_248/0.9))]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bc-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.5" stopColor="#0284c7" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="36"
        height="48"
        rx="4"
        fill="url(#bc-face)"
        stroke="#e0f2fe"
        strokeWidth="2"
      />
      <rect x="6" y="7" width="28" height="4" rx="1" fill="#e0f2fe" opacity="0.7" />
      <path
        d="M20 16 L24 26 L34 26 L26 32 L29 42 L20 36 L11 42 L14 32 L6 26 L16 26 Z"
        fill="#f0f9ff"
        opacity="0.9"
      />
    </svg>
  );
}

export function TitleScreen() {
  const dispatch = useGame((s) => s.dispatch);
  const setPanel = useGame((s) => s.setPanel);
  const state = useDisplayState();
  const starts = getLegalActions(state).flatMap((a) => (a.type === 'startRun' ? [a] : []));
  const open = new Set(starts.map((a) => a.tamerId));
  // 고를 수 있는 해저드 단계 (02 13.6): 할 수 있는 행동에서 읽음
  const maxHazard = Math.max(0, ...starts.map((a) => a.hazard ?? 0));
  const [hazard, setHazard] = useState(0);
  const chosen = Math.min(hazard, maxHazard);
  return (
    <Screen backdrop={1}>
      <div className="flex justify-end px-4 pt-3">
        <SettingsButton />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center-safe gap-6 overflow-y-auto px-6 text-center">
        <div className="flex flex-col items-center">
          <BlueCardLogo />
          <p className="mt-3 text-sm tracking-[0.3em] text-sky-300 [text-shadow:0_0_8px_rgb(56_189_248/0.8)]">
            DIGIMON TAMERS
          </p>
          <h1 className="mt-1 bg-gradient-to-b from-white via-sky-200 to-sky-500 bg-clip-text text-4xl font-black text-transparent [filter:drop-shadow(0_3px_0_#0c4a6e)]">
            블루 카드
          </h1>
          <p className="mt-2 text-xs text-slate-400">비공식 팬 게임</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          {maxHazard > 0 && (
            <div className="ui-panel p-3 text-left" data-testid="hazard-picker">
              <p className="mb-2 text-sm text-slate-400">디지털 해저드</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: maxHazard + 1 }, (_, n) => (
                  <button
                    key={n}
                    type="button"
                    data-hazard={n}
                    onClick={() => setHazard(n)}
                    className={`min-h-11 min-w-11 rounded-lg text-sm font-bold ${
                      chosen === n ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {chosen > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-rose-200">
                  {describeHazard(chosen).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="ui-kicker text-left">테이머를 고르세요</p>
          {getTamers().map((t) => {
            const partner = getForm(t.line, 'rookie');
            const locked = !open.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                data-tamer={t.id}
                disabled={locked}
                className="ui-choice flex min-h-16 items-center gap-3"
                onClick={() =>
                  dispatch(
                    chosen > 0
                      ? { type: 'startRun', tamerId: t.id, hazard: chosen }
                      : { type: 'startRun', tamerId: t.id },
                  )
                }
              >
                <span className="relative h-14 w-14 shrink-0">
                  <FormSprite formId={partner.id} className="h-14 w-14" />
                  <TamerFace
                    tamerId={t.id}
                    className="absolute -right-1 -bottom-1 h-6 w-6 rounded bg-slate-900 ring-1 ring-sky-400/50"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <b>{t.name}</b>
                    <span className="text-xs text-rose-300">HP {t.maxHp}</span>
                  </span>
                  <span className="block text-xs text-sky-200">
                    {locked ? unlockHint(tamerUnlockWins(t.id)) : t.trait}
                  </span>
                  <span className="block text-xs leading-snug text-slate-400">
                    {describeTamer(t.id)}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              data-testid="title-codex"
              onClick={() => setPanel('codex')}
              className="ui-btn ui-btn-slate min-h-11 text-sm"
            >
              도감
            </button>
            <button
              type="button"
              data-testid="title-guide"
              onClick={() => setPanel('guide')}
              className="ui-btn ui-btn-slate min-h-11 text-sm"
            >
              하는 법
            </button>
            <button
              type="button"
              data-testid="title-info"
              onClick={() => setPanel('info')}
              className="ui-btn ui-btn-slate min-h-11 text-sm"
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
