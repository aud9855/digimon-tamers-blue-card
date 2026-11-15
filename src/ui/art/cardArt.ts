// 카드 그림 창에 넣을 그림 (04 B1). 공식 카드 일러스트는 쓰지 않음.
// 디지몬은 전투와 같은 원작 도트(official/), 아이콘은 직접 그린 도트.
// - 필살기: 그 필살기를 가진 디지몬
// - 테이머 카드(공격·스킬): 그 테이머의 성장기 파트너
// - 공용·동료·저주 카드: 종류 아이콘
import type { CardType } from '../../core/index';
import { getCard, getForm, getForms, getTamer } from '../../data/index';

export type CardArt = { kind: 'form'; formId: string } | { kind: 'icon'; type: CardType };

export function cardArt(defId: string): CardArt {
  const def = getCard(defId);
  if (def.type === 'signature') {
    const form = getForms().find((f) => f.signatureCardId === defId);
    if (form) return { kind: 'form', formId: form.id };
  }
  if (
    (def.type === 'attack' || def.type === 'skill') &&
    def.pool !== 'neutral' &&
    def.pool !== 'none'
  ) {
    return { kind: 'form', formId: getForm(getTamer(def.pool).line, 'rookie').id };
  }
  return { kind: 'icon', type: def.type };
}
