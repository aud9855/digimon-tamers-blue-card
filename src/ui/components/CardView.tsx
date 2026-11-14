import { describeCard, type GameState } from '../../core/index';
import { getCard } from '../../data/index';
import type { CardType } from '../../core/index';

const TYPE_STYLE: Record<CardType, string> = {
  attack: 'border-rose-400 bg-rose-950',
  skill: 'border-sky-400 bg-sky-950',
  signature: 'border-amber-300 bg-amber-950',
  curse: 'border-slate-500 bg-slate-900',
};

export interface CardViewProps {
  defId: string;
  upgraded: boolean;
  /** 주면 지금 전투 값을 반영한 설명 */
  state?: GameState;
  dimmed?: boolean;
  selected?: boolean;
  size?: 'hand' | 'large';
}

export function CardView({
  defId,
  upgraded,
  state,
  dimmed = false,
  selected = false,
  size = 'hand',
}: CardViewProps) {
  const def = getCard(defId);
  const face = upgraded ? def.upgraded : def.base;
  const text = describeCard(defId, upgraded, state ? { state } : undefined);
  const large = size === 'large';
  return (
    <div
      className={`relative flex flex-col rounded-lg border-2 ${TYPE_STYLE[def.type]} ${
        large ? 'h-72 w-52 p-3' : 'h-[100px] w-full p-1'
      } ${dimmed ? 'opacity-40' : ''} ${selected ? '-translate-y-2 ring-2 ring-amber-300' : ''}`}
    >
      <div
        className={`absolute flex items-center justify-center rounded-full bg-memory font-black text-slate-900 ${
          large ? '-top-3 -left-3 h-9 w-9 text-lg' : '-top-1.5 -left-1.5 h-5 w-5 text-xs'
        }`}
      >
        {face.cost}
      </div>
      <div
        className={`line-clamp-2 text-center font-bold break-keep ${
          large ? 'mt-1 text-lg' : 'mt-1 text-[12px] leading-tight'
        } ${upgraded ? 'text-lime-300' : ''}`}
      >
        {def.name}
        {upgraded ? '+' : ''}
      </div>
      <div
        className={`mt-1 flex-1 overflow-hidden text-center leading-tight break-keep text-slate-200 ${
          large ? 'text-sm' : 'text-[12px]'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
