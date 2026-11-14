// 02 3.11: 카드 밖에서 마지막 적이 쓰러져도 그 순간 승리
import { describe, expect, it } from 'vitest';
import { overrideRegistry } from '../../src/data/index';
import { act, eventsOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

describe('카드 밖에서 생긴 승리', () => {
  it('턴 시작 칩의 피해로 마지막 적이 쓰러지면 승리', () => {
    const restore = overrideRegistry({
      ...baseFixtures,
      chips: [
        ...(baseFixtures.chips ?? []),
        {
          id: 'test_zap',
          name: '시험',
          trigger: 'onTurnStart',
          effects: [{ op: 'damage', amount: 5, target: 'allEnemies' }],
        },
      ],
    });
    try {
      const state = makeBattle({ chips: ['test_zap'], enemyOverrides: [{ hp: 3 }] });
      const { state: next, events } = act(state, { type: 'endTurn' });
      expect(next.battle).toBeNull();
      expect(next.phase).toBe('reward');
      expect(eventsOf(events, 'battleEnded')).toHaveLength(1);
    } finally {
      restore();
    }
  });

  it('진화 칩의 피해로 마지막 적이 쓰러지면 승리', () => {
    const restore = overrideRegistry({
      ...baseFixtures,
      chips: [
        ...(baseFixtures.chips ?? []),
        {
          id: 'test_evo_zap',
          name: '시험',
          trigger: 'onEvolve',
          effects: [{ op: 'damage', amount: 5, target: 'allEnemies' }],
        },
      ],
    });
    try {
      const state = makeBattle({ chips: ['test_evo_zap'], memory: 9, enemyOverrides: [{ hp: 3 }] });
      const next = act(state, { type: 'evolve' }).state;
      expect(next.battle).toBeNull();
      expect(next.phase).toBe('reward');
    } finally {
      restore();
    }
  });
});
