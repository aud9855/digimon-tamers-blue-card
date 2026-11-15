// 카드 그림 창 (04 B1): 모든 카드가 그림을 갖고, 디지몬 그림이면 있는 형태여야 함
import { describe, expect, it } from 'vitest';
import { getCards, getFormById } from '../../src/data/index';
import { cardArt } from '../../src/ui/art/cardArt';
import { battleBackground } from '../../src/ui/art/stage';

describe('카드 그림 창', () => {
  it('모든 카드에 그림이 정해짐', () => {
    for (const card of getCards()) {
      const art = cardArt(card.id);
      if (art.kind === 'form') expect(() => getFormById(art.formId), card.id).not.toThrow();
      else expect(art.type).toBe(card.type);
    }
  });

  it('필살기는 그 필살기를 가진 디지몬, 테이머 공격 카드는 성장기 파트너', () => {
    expect(cardArt('royal_saber')).toEqual({ kind: 'form', formId: 'gallantmon' });
    const takatoAttack = getCards().find((c) => c.pool === 'takato' && c.type === 'attack');
    expect(takatoAttack && cardArt(takatoAttack.id)).toEqual({ kind: 'form', formId: 'guilmon' });
  });
});

describe('막별 배경', () => {
  it('1~3막은 서로 다른 배경, 그 밖의 막은 끝 배경', () => {
    const urls = [1, 2, 3].map(battleBackground);
    expect(new Set(urls).size).toBe(3);
    expect(battleBackground(4)).toBe(urls[2]);
    expect(battleBackground(0)).toBe(urls[0]);
  });
});
