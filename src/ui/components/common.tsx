// 여러 화면이 함께 쓰는 작은 부품
import type { ReactNode } from 'react';
import type { CardInstance } from '../../core/index';
import { CardView } from './CardView';

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  tone = 'sky',
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'sky' | 'slate' | 'amber';
  testId?: string;
}) {
  const color = {
    sky: 'bg-sky-600 active:bg-sky-500',
    slate: 'bg-slate-700 active:bg-slate-600',
    amber: 'bg-amber-600 active:bg-amber-500',
  }[tone];
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 w-full rounded-xl px-4 font-bold text-white disabled:bg-slate-800 disabled:text-slate-500 ${color}`}
    >
      {children}
    </button>
  );
}

/** 덱에서 카드 한 장 고르기 (휴식 강화, 상점 지우기) */
export function DeckPicker({
  title,
  cards,
  onPick,
  onClose,
  preview,
}: {
  title: string;
  cards: CardInstance[];
  onPick: (card: CardInstance) => void;
  onClose: () => void;
  /** 고르기 전에 보여 줄 모습 (강화면 강화된 면) */
  preview?: (card: CardInstance) => { defId: string; upgraded: boolean };
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950/95" data-testid="deck-picker">
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg px-3 text-sm text-slate-300 active:bg-slate-800"
          >
            닫기
          </button>
        </div>
        <div className="grid flex-1 grid-cols-4 content-start gap-x-2 gap-y-3 overflow-y-auto px-4 pt-2 pb-6">
          {cards.map((card) => {
            const shown = preview ? preview(card) : card;
            return (
              <button
                key={card.uid}
                type="button"
                data-pick-uid={card.uid}
                onClick={() => onPick(card)}
                className="text-left"
              >
                <CardView defId={shown.defId} upgraded={shown.upgraded} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 이번에 얻은 것 (비트, 칩) 한 줄 */
export function GainLine({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-amber-200">{children}</div>;
}
