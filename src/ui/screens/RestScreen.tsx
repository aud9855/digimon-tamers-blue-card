// 휴식 (02 7.3)
import { useState } from 'react';
import { getLegalActions } from '../../core/index';
import { constants, getForm, getTamer } from '../../data/index';
import { DeckPicker, Hero, PixelFire, ScreenTitle } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function RestScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const [upgrading, setUpgrading] = useState(false);
  const run = state.run;
  if (!run) return null;
  const legal = getLegalActions(state);
  const upgradable = new Set(legal.flatMap((a) => (a.type === 'restUpgrade' ? [a.cardUid] : [])));
  // 쉴 때는 매 전투 시작 모습(성장기)으로
  const partner = getForm(getTamer(run.tamerId).line, 'rookie');

  return (
    <Screen backdrop={run.act}>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col justify-center-safe gap-4 overflow-y-auto px-6 py-4">
        <ScreenTitle kicker="REST" accent="#34d399" center>
          휴식
        </ScreenTitle>
        <div className="flex items-end justify-center gap-2">
          <Hero formId={partner.id} size={96} ray="252 211 77" />
          <PixelFire className="-ml-10 h-14 w-14" />
        </div>
        <p className="text-center text-sm text-slate-300">
          모닥불 앞에서 한숨 돌립니다. 둘 중 하나를 고르세요
        </p>
        <button
          type="button"
          data-testid="rest-heal"
          onClick={() => dispatch({ type: 'restHeal' })}
          className="ui-choice [--accent:#fbbf24]"
        >
          <b className="block text-amber-200">쉬기</b>
          <span className="block text-sm text-slate-300">
            최대 HP의 {Math.round(constants.REST_HEAL_PCT * 100)}% 회복
          </span>
        </button>
        <button
          type="button"
          data-testid="rest-upgrade"
          disabled={upgradable.size === 0}
          onClick={() => setUpgrading(true)}
          className="ui-choice [--accent:#38bdf8]"
        >
          <b className="block text-sky-200">
            {upgradable.size === 0 ? '강화할 카드가 없습니다' : '카드 1장 강화'}
          </b>
          <span className="block text-sm text-slate-300">덱의 카드 하나를 더 세게</span>
        </button>
      </div>
      {upgrading && (
        <DeckPicker
          title="강화할 카드 (강화된 모습)"
          cards={run.deck.filter((c) => upgradable.has(c.uid))}
          preview={(c) => ({ defId: c.defId, upgraded: true })}
          onClose={() => setUpgrading(false)}
          onPick={(card) => {
            setUpgrading(false);
            dispatch({ type: 'restUpgrade', cardUid: card.uid });
          }}
        />
      )}
    </Screen>
  );
}
