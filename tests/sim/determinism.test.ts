import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, getLegalActions } from '../../src/core/index';
import type { GameState } from '../../src/core/types';
import { POLICIES, MAX_ACTIONS, runOne, type PolicyName } from '../../src/sim/runner';
import { createSimRng } from '../../src/sim/rng';

/** 한 판을 돌리되, saveAt번째 행동 전에 상태를 JSON으로 저장했다 되살려 이어 함 */
function playWithSave(seed: number, policy: PolicyName, saveAt: number): GameState {
  const ctx = {
    rng: createSimRng(seed),
    tamerId: 'takato' as const,
    evolve: 'asap' as const,
    hazard: 0,
  };
  let state = createInitialState(seed);
  for (let step = 0; step < MAX_ACTIONS; step++) {
    if (step === saveAt) state = JSON.parse(JSON.stringify(state)) as GameState;
    const legal = getLegalActions(state);
    if (legal.length === 0) break;
    state = applyAction(state, POLICIES[policy](state, legal, ctx)).state;
  }
  return state;
}

describe('결정성 (03 5절 약속 2·5)', () => {
  it('같은 시드·정책이면 마지막 상태가 같다', () => {
    for (const policy of ['greedy', 'random'] as const) {
      for (const seed of [1, 7, 42]) {
        const a = runOne(seed, { policy, tamerId: 'takato', evolve: 'asap' });
        const b = runOne(seed, { policy, tamerId: 'takato', evolve: 'asap' });
        expect(b.finalState).toEqual(a.finalState);
        expect(b.actions).toBe(a.actions);
      }
    }
  });

  it('다른 시드면 대체로 다른 판', () => {
    const finals = [1, 2, 3, 4, 5].map((seed) =>
      JSON.stringify(
        runOne(seed, { policy: 'greedy', tamerId: 'takato', evolve: 'asap' }).finalState,
      ),
    );
    expect(new Set(finals).size).toBeGreaterThan(3);
  });

  it('한 판 도중 어느 시점에서 JSON으로 저장했다 되살려 이어 해도 마지막 상태가 같다', () => {
    for (const policy of ['greedy', 'random'] as const) {
      for (const seed of [3, 11]) {
        const expected = playWithSave(seed, policy, -1);
        const total = runOne(seed, { policy, tamerId: 'takato', evolve: 'asap' }).actions;
        // 시작, 첫 전투 근처, 중간, 끝 근처 등 여러 시점
        const points = [0, 1, 5, 17, Math.floor(total / 3), Math.floor(total / 2), total - 1];
        for (const saveAt of points) {
          expect(
            playWithSave(seed, policy, saveAt),
            `${policy} 시드 ${seed} 저장 ${saveAt}`,
          ).toEqual(expected);
        }
      }
    }
  });

  it('applyAction은 받은 상태를 바꾸지 않는다 (한 판 내내)', () => {
    const ctx = {
      rng: createSimRng(5),
      tamerId: 'takato' as const,
      evolve: 'asap' as const,
      hazard: 0,
    };
    let state = createInitialState(5);
    for (let step = 0; step < 300; step++) {
      const legal = getLegalActions(state);
      if (legal.length === 0) break;
      const before = JSON.stringify(state);
      const next = applyAction(state, POLICIES.greedy(state, legal, ctx)).state;
      expect(JSON.stringify(state)).toBe(before);
      state = next;
    }
  });
});
