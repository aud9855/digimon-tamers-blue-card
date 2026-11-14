// 휴식 (02 7.3)
import { useState } from 'react';
import { getLegalActions } from '../../core/index';
import { constants } from '../../data/index';
import { DeckPicker, PrimaryButton } from '../components/common';
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

  return (
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col justify-center gap-4 px-6">
        <h1 className="text-center text-2xl font-black">휴식</h1>
        <p className="text-center text-sm text-slate-400">둘 중 하나를 고르세요</p>
        <PrimaryButton
          tone="amber"
          testId="rest-heal"
          onClick={() => dispatch({ type: 'restHeal' })}
        >
          쉬기: 최대 HP의 {Math.round(constants.REST_HEAL_PCT * 100)}% 회복
        </PrimaryButton>
        <PrimaryButton
          testId="rest-upgrade"
          disabled={upgradable.size === 0}
          onClick={() => setUpgrading(true)}
        >
          {upgradable.size === 0 ? '강화할 카드가 없습니다' : '카드 1장 강화'}
        </PrimaryButton>
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
