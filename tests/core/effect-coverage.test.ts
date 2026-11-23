// 효과 종류마다 처리·설명·봇 점수가 빠지지 않았는지 (확장 1차 기반 작업)
// SAMPLES의 타입이 모든 op를 요구하므로, 새 효과 종류를 더하면 여기서 먼저 타입 오류가 납니다.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runEffects } from '../../src/core/battle/effects';
import { describeCard } from '../../src/core/describe';
import type { CardDef, Effect, GameEvent } from '../../src/core/types';
import { overrideRegistry } from '../../src/data/index';
import { effectValue } from '../../src/sim/policies/cardValue';
import { makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

const SAMPLES: { [K in Effect['op']]: Extract<Effect, { op: K }> } = {
  damage: { op: 'damage', amount: 6, target: 'enemy' },
  shield: { op: 'shield', amount: 5 },
  draw: { op: 'draw', count: 1 },
  gainMemory: { op: 'gainMemory', amount: 1 },
  heal: { op: 'heal', amount: 3 },
  loseHp: { op: 'loseHp', amount: 2 },
  applyStatus: { op: 'applyStatus', status: 'weak', amount: 1, target: 'enemy' },
  freeEvolve: { op: 'freeEvolve' },
  addCard: { op: 'addCard', cardId: 'strike', to: 'hand', count: 1 },
  ifStage: { op: 'ifStage', min: 'champion', then: [{ op: 'shield', amount: 3 }] },
  ifEvolvedThisTurn: { op: 'ifEvolvedThisTurn', then: [{ op: 'draw', count: 1 }] },
  ifPlayedThisTurn: { op: 'ifPlayedThisTurn', min: 1, then: [{ op: 'heal', amount: 1 }] },
};

function probeCard(effect: Effect): CardDef {
  return {
    id: `probe_${effect.op}`,
    name: `시험 ${effect.op}`,
    type: 'skill',
    rarity: 'common',
    pool: 'none',
    base: { cost: 1, effects: [effect] },
    upgraded: { cost: 1, effects: [effect] },
  };
}

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry({ ...baseFixtures, cards: Object.values(SAMPLES).map(probeCard) });
});
afterEach(() => restore());

describe.each(Object.values(SAMPLES))('효과 $op', (effect) => {
  it('core가 처리함 (예외 없음)', () => {
    const state = makeBattle({ enemies: ['test_dummy'], drawPile: ['strike', 'guard'] });
    const events: GameEvent[] = [];
    expect(() => runEffects(state, events, [effect], { targetIndex: 0 })).not.toThrow();
  });

  it('카드 설명 글이 있음', () => {
    const text = describeCard(`probe_${effect.op}`, false);
    expect(text.trim().length).toBeGreaterThan(0);
    expect(text).not.toContain('undefined');
  });

  it('봇 점수가 숫자임', () => {
    expect(Number.isFinite(effectValue(effect))).toBe(true);
  });
});
