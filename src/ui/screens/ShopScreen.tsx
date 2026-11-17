// 상점 (02 7.2)
import { useState } from 'react';
import { describeChip, getLegalActions } from '../../core/index';
import { getChip } from '../../data/index';
import { CardView } from '../components/CardView';
import { DeckPicker, PrimaryButton, ScreenTitle } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';
import { ChipIcon } from '../components/Sprites';

export function ShopScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const [removing, setRemoving] = useState(false);
  const shop = state.pending?.kind === 'shop' ? state.pending : null;
  const run = state.run;
  if (!shop || !run) return null;
  const legal = getLegalActions(state);
  const canBuyCard = (index: number) =>
    legal.some((a) => a.type === 'shopBuyCard' && a.index === index);
  const canBuyChip = (index: number) =>
    legal.some((a) => a.type === 'shopBuyChip' && a.index === index);
  const removable = new Set(legal.flatMap((a) => (a.type === 'shopRemoveCard' ? [a.cardUid] : [])));

  return (
    <Screen backdrop={run.act}>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-3 pb-4">
        <ScreenTitle kicker="SHOP" accent="#f59e0b">
          상점
        </ScreenTitle>

        <section>
          <h2 className="ui-kicker mb-3 [--accent:#fcd34d]">카드</h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            {shop.cards.map((item, index) => (
              <button
                key={`${item.defId}-${index}`}
                type="button"
                data-shop-card={index}
                disabled={!canBuyCard(index)}
                onClick={() => dispatch({ type: 'shopBuyCard', index })}
                className="flex flex-col items-center gap-1 disabled:opacity-60 disabled:grayscale-[0.5]"
              >
                {item.sold ? (
                  <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-950/60 text-xs text-slate-400">
                    판매됨
                  </div>
                ) : (
                  <CardView defId={item.defId} upgraded={false} size="offer" />
                )}
                <span className="rounded-full bg-amber-950/80 px-2 text-sm font-bold text-amber-300 ring-1 ring-amber-500/50">
                  {item.price} 비트
                </span>
              </button>
            ))}
          </div>
        </section>

        {shop.chips.length > 0 && (
          <section>
            <h2 className="ui-kicker mb-2 [--accent:#fcd34d]">디아크 칩</h2>
            <div className="flex flex-col gap-2">
              {shop.chips.map((item, index) => (
                <button
                  key={item.chipId}
                  type="button"
                  data-shop-chip={index}
                  disabled={!canBuyChip(index)}
                  onClick={() => dispatch({ type: 'shopBuyChip', index })}
                  className="ui-choice flex min-h-12 items-center justify-between gap-3 [--accent:#f59e0b]"
                >
                  <span className="min-w-0">
                    <b className="flex items-center gap-1 text-sky-200">
                      <ChipIcon chipId={item.chipId} className="h-6 w-6" />
                      {getChip(item.chipId).name}
                    </b>
                    <span className="block text-xs text-slate-300">
                      {item.sold ? '판매됨' : describeChip(item.chipId)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-amber-950/80 px-2 text-sm font-bold text-amber-300 ring-1 ring-amber-500/50">
                    {item.price} 비트
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="ui-kicker mb-2 [--accent:#fcd34d]">카드 지우기</h2>
          <PrimaryButton
            tone="slate"
            testId="shop-remove"
            disabled={removable.size === 0}
            onClick={() => setRemoving(true)}
          >
            {shop.removalUsed ? '이 상점에서는 이미 지웠습니다' : '덱에서 카드 1장 지우기'}
          </PrimaryButton>
        </section>
      </div>
      <div className="px-4 pt-2 pb-4">
        <PrimaryButton testId="proceed" onClick={() => dispatch({ type: 'proceed' })}>
          나가기
        </PrimaryButton>
      </div>
      {removing && (
        <DeckPicker
          title="지울 카드를 고르세요"
          cards={run.deck.filter((c) => removable.has(c.uid))}
          onClose={() => setRemoving(false)}
          onPick={(card) => {
            setRemoving(false);
            dispatch({ type: 'shopRemoveCard', cardUid: card.uid });
          }}
        />
      )}
    </Screen>
  );
}
