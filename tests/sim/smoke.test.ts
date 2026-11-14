import { describe, expect, it } from 'vitest';
import { MAX_ACTIONS, runMany } from '../../src/sim/runner';

describe('봇 스모크 (03 8절)', () => {
  it('random 봇 200판이 예외 없이 5,000행동 안에 끝난다', () => {
    const records = runMany({ policy: 'random', tamerId: 'takato', evolve: 'asap' }, 200, 1);
    for (const r of records) {
      expect(r.timedOut, `시드 ${r.seed}`).toBe(false);
      expect(r.actions).toBeLessThanOrEqual(MAX_ACTIONS);
      expect(['runWon', 'runLost']).toContain(r.finalState.phase);
    }
  });

  it('greedy 봇 세 가지 진화 방식이 각각 20판을 끝낸다', () => {
    for (const evolve of ['asap', 'turn2', 'never'] as const) {
      const records = runMany({ policy: 'greedy', tamerId: 'takato', evolve }, 20, 1);
      for (const r of records) expect(r.timedOut, `${evolve} 시드 ${r.seed}`).toBe(false);
      if (evolve === 'never') {
        expect(records.flatMap((r) => r.battles).every((b) => b.evolveCount === 0)).toBe(true);
      }
    }
  });
});
