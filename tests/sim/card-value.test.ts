// 봇 카드 점수 (확장 1차 기반 작업): 손 점수표에 없는 새 카드도 0점이 되지 않음
import { describe, expect, it } from 'vitest';
import type { CardDef } from '../../src/core/types';
import { getCards } from '../../src/data/index';
import { estimateCardScore } from '../../src/sim/policies/cardValue';

describe('카드 값 추정', () => {
  it('보상·상점에 나오는 카드는 모두 1~8점, 저주는 -10', () => {
    for (const def of getCards()) {
      const score = estimateCardScore(def);
      if (def.type === 'curse') expect(score).toBe(-10);
      else expect(score, def.id).toBeGreaterThanOrEqual(1);
      expect(score, def.id).toBeLessThanOrEqual(8);
    }
  });

  it('새 카드: 세면 높고 약하면 낮음 (0점이 아님)', () => {
    const card = (id: string, cost: number, amount: number): CardDef => ({
      id,
      name: id,
      type: 'attack',
      rarity: 'common',
      pool: 'neutral',
      base: { cost, effects: [{ op: 'damage', amount, target: 'enemy' }] },
      upgraded: { cost, effects: [{ op: 'damage', amount: amount + 3, target: 'enemy' }] },
    });
    const weak = estimateCardScore(card('new_weak', 2, 5));
    const strong = estimateCardScore(card('new_strong', 1, 14));
    expect(weak).toBeGreaterThan(0);
    expect(strong).toBeGreaterThan(weak);
    expect(estimateCardScore(card('new_strong', 1, 14), true)).toBeGreaterThanOrEqual(strong);
  });
});
