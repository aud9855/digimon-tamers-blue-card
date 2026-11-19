import { memo } from 'react';
import { describeCard, previewCardCost, type GameState } from '../../core/index';
import type { CardType, Rarity } from '../../core/index';
import { getCard } from '../../data/index';
import { cardArt } from '../art/cardArt';
import { FormSprite } from './Sprites';
import './CardView.css';

const TYPE_LABEL: Record<CardType, string> = {
  attack: '공격',
  skill: '스킬',
  signature: '필살기',
  curse: '저주',
  companion: '동료',
};
const RARITY_LABEL: Record<Rarity, string> = {
  basic: '기본',
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  special: '전용',
};
const RARITY_COLOR: Record<Rarity, string> = {
  basic: '#5b6478',
  common: '#aab4c8',
  uncommon: '#4fb3ff',
  rare: '#ffc94a',
  special: '#ff7ad9',
};

/** 7×7 도트 아이콘 (1 = 칠함). 직접 그림 */
const ICON: Record<CardType, string[]> = {
  attack: ['0000011', '0000111', '0001110', '1011100', '0111000', '0110000', '1001000'],
  skill: ['1111111', '1000001', '1011101', '1011101', '0101010', '0011100', '0001000'],
  signature: ['0001000', '0001000', '1111111', '0111110', '0011100', '0110110', '1000001'],
  curse: ['0111110', '1111111', '1001001', '1111111', '0110110', '0111110', '0101010'],
  companion: ['0100010', '1110111', '0100010', '0011100', '0111110', '0111110', '0011100'],
};

function TypeIcon({ type }: { type: CardType }) {
  return (
    <svg className="tcg-ico" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
      {ICON[type].flatMap((row, y) =>
        [...row].map((v, x) =>
          v === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#fff" />
          ) : null,
        ),
      )}
    </svg>
  );
}

export interface CardViewProps {
  defId: string;
  upgraded: boolean;
  /** 주면 지금 전투 값을 반영한 설명 */
  state?: GameState;
  dimmed?: boolean;
  selected?: boolean;
  /** hand: 손패, offer: 보상·상점에서 고르기, large: 크게 보기 */
  size?: 'hand' | 'offer' | 'large';
  /** 손패의 카드면 지금 낼 때의 비용(처음 내는 카드 할인 등)을 보여 줌 */
  cardUid?: number;
  /** 반짝임·회전 애니메이션을 끔 (카드가 많이 깔리는 덱 목록 등, GPU 부담 줄이기) */
  still?: boolean;
}

/** 카드 한 장: 풀아트 TCG 디자인 (04 B1, 모양은 CardView.css).
 *  memo: 받는 값이 같으면(고르기·끌기만 바뀐 다른 카드) 다시 그리지 않음 */
export const CardView = memo(function CardView({
  defId,
  upgraded,
  state,
  dimmed = false,
  selected = false,
  size = 'hand',
  cardUid,
  still = false,
}: CardViewProps) {
  const def = getCard(defId);
  const face = upgraded ? def.upgraded : def.base;
  const cost =
    state && cardUid !== undefined ? (previewCardCost(state, cardUid) ?? face.cost) : face.cost;
  const text = describeCard(defId, upgraded, state ? { state } : undefined);
  const large = size === 'large';
  const art = cardArt(defId);
  return (
    <div
      className={`tcg tcg-${def.type} ${
        large
          ? 'tcg-large h-72 w-52'
          : size === 'offer'
            ? 'tcg-offer h-48 w-full'
            : 'h-[100px] w-full'
      } ${still ? 'tcg-still' : ''} ${dimmed ? 'opacity-40' : ''} ${selected ? '-translate-y-2 ring-2 ring-amber-300' : ''}`}
    >
      <div className="tcg-art">
        {art.kind === 'form' ? (
          <FormSprite formId={art.formId} className="tcg-spr" decorative />
        ) : (
          <TypeIcon type={art.type} />
        )}
        <i className="tcg-fx" />
      </div>
      {def.type === 'signature' && art.kind === 'form' && (
        <div className="tcg-pop">
          <FormSprite formId={art.formId} className="tcg-spr" decorative />
        </div>
      )}
      {def.rarity !== 'basic' && <i className="tcg-holo" />}
      <div className={`tcg-cost ${cost < face.cost ? 'tcg-cost-down' : ''}`}>{cost}</div>
      <div
        className={`tcg-name ${upgraded ? 'tcg-up' : ''} ${
          def.name.length >= 7 ? 'tcg-name-xlong' : def.name.length >= 5 ? 'tcg-name-long' : ''
        }`}
      >
        <span className="tcg-name-text">{def.name}</span>
        {upgraded && <span className="tcg-plus">+</span>}
      </div>
      <div className="tcg-line">
        <span>{TYPE_LABEL[def.type]}</span>
        <span>
          <i className="tcg-gem" style={{ background: RARITY_COLOR[def.rarity] }} />
          {large ? RARITY_LABEL[def.rarity] : ''}
        </span>
      </div>
      <div className="tcg-text">
        <span className="tcg-text-body">{text}</span>
      </div>
    </div>
  );
});
