// 카드 고르기 (02 7.1): 전투 보상, 테이머 특성, 이벤트
import { getLegalActions } from '../../core/index';
import { getChip } from '../../data/index';
import { CardView } from '../components/CardView';
import { GainLine, PrimaryButton } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function RewardScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const lastEvents = useGame((s) => s.lastEvents);
  const pending = state.pending?.kind === 'reward' ? state.pending : null;
  if (!pending) return null;
  const offer = pending.offers[0];
  const legal = getLegalActions(state);

  const won = lastEvents.some((e) => e.type === 'battleEnded' && e.won);
  const gotBits = lastEvents.some((e) => e.type === 'bitsChanged');
  const chips = lastEvents.flatMap((e) => (e.type === 'chipGained' ? [e.chipId] : []));

  return (
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4">
        <h1 className="text-xl font-black">{won ? '승리!' : '카드 고르기'}</h1>
        {(gotBits || chips.length > 0) && (
          <div className="flex flex-col gap-2" data-testid="gains">
            {gotBits && <GainLine>비트를 얻었습니다 · 지금 {state.run?.bits} 비트</GainLine>}
            {chips.map((id) => (
              <GainLine key={id}>디아크 칩: {getChip(id).name}</GainLine>
            ))}
          </div>
        )}
        <p className="text-sm text-slate-300">
          덱에 넣을 카드를 한 장 고르세요
          {pending.offers.length > 1 ? ` (남은 고르기 ${pending.offers.length})` : ''}
        </p>
        <div className="grid grid-cols-3 gap-3" data-testid="offer">
          {offer?.cards.map((c, index) => (
            <button
              key={`${c.defId}-${index}`}
              type="button"
              data-offer-index={index}
              disabled={!legal.some((a) => a.type === 'pickCard' && a.index === index)}
              onClick={() => dispatch({ type: 'pickCard', index })}
            >
              <div className="[&>div]:h-36">
                <CardView defId={c.defId} upgraded={c.upgraded} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-2 pb-4">
        <PrimaryButton tone="slate" testId="skip" onClick={() => dispatch({ type: 'skipCards' })}>
          건너뛰기
        </PrimaryButton>
      </div>
    </Screen>
  );
}
