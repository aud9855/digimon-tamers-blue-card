import type { CardInstance, GameState } from '../../core/index';
import { CardView } from './CardView';

/** 손패: 5장씩 두 줄 (최대 10장). 360px에서 겹치지 않도록 칸을 나눔 */
export function Hand({
  state,
  cards,
  playable,
  selectedUid,
  onCardPointerDown,
  onCardClick,
}: {
  state: GameState;
  cards: CardInstance[];
  playable?: (card: CardInstance) => boolean;
  selectedUid?: number | null;
  onCardPointerDown?: (card: CardInstance, e: React.PointerEvent) => void;
  onCardClick?: (card: CardInstance) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-x-1.5 gap-y-3 px-3 pt-3" data-testid="hand">
      {cards.map((card) => (
        <div
          key={card.uid}
          data-card-uid={card.uid}
          className="touch-none"
          onPointerDown={onCardPointerDown ? (e) => onCardPointerDown(card, e) : undefined}
          onClick={onCardClick ? () => onCardClick(card) : undefined}
        >
          <CardView
            defId={card.defId}
            upgraded={card.upgraded}
            state={state}
            dimmed={playable ? !playable(card) : false}
            selected={selectedUid === card.uid}
          />
        </div>
      ))}
    </div>
  );
}
