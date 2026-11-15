// 카드 위치와 섞기 검사 (card-game 스킬의 검사 목록을 참고).
// 1) 봇이 판을 끝까지 하는 동안, 행동마다 같은 카드(uid)가 두 곳에 있지 않고 덱의 카드가 사라지지 않음
// 2) shuffle이 고르게 섞음 (4장의 24가지 순서, 카이제곱)
import { describe, expect, it } from 'vitest';
import {
  applyAction,
  createInitialState,
  fullUnlocks,
  getLegalActions,
  type GameState,
  type TamerId,
} from '../../src/core/index';
import { shuffle } from '../../src/core/rng';
import { greedyPolicy } from '../../src/sim/policies/greedy';
import { randomPolicy } from '../../src/sim/policies/random';
import { createSimRng } from '../../src/sim/rng';

/** 전투 중 카드가 있을 수 있는 곳 */
function zoneUids(state: GameState): string[] {
  const b = state.battle;
  if (!b) return [];
  return [
    ...b.drawPile,
    ...b.hand,
    ...b.discardPile,
    ...b.exhaustPile,
    ...b.companions,
    ...(b.handChoice ?? []).flat(),
  ].map((c) => String(c.uid));
}

function checkZones(state: GameState, where: string) {
  const uids = zoneUids(state);
  const seen = new Set<string>();
  for (const uid of uids) {
    expect(seen.has(uid), `${where}: 카드 ${uid}가 두 곳에 있음`).toBe(false);
    seen.add(uid);
  }
  // 덱의 카드는 전투 중 어딘가에 있어야 함 (사라지지 않음)
  if (state.phase === 'battle' && state.run) {
    for (const card of state.run.deck) {
      expect(seen.has(String(card.uid)), `${where}: 덱 카드 ${card.uid}가 사라짐`).toBe(true);
    }
  }
}

const TAMERS: TamerId[] = ['takato', 'rika', 'henry', 'ai_mako'];

describe('카드 위치 불변식', () => {
  it.each(TAMERS)('%s: 봇 두 종류로 판을 끝까지, 행동마다 검사', (tamerId) => {
    for (const [name, policy] of [
      ['greedy', greedyPolicy],
      ['random', randomPolicy],
    ] as const) {
      let battleChecks = 0;
      for (const seed of [1, 2, 3]) {
        const ctx = { rng: createSimRng(seed), tamerId, evolve: 'asap' as const, hazard: 0 };
        let state = createInitialState(seed, fullUnlocks());
        for (let i = 0; i < 4000; i++) {
          const legal = getLegalActions(state);
          if (legal.length === 0) break;
          state = applyAction(state, policy(state, legal, ctx)).state;
          checkZones(state, `${tamerId}/${name}/시드 ${seed}/행동 ${i}`);
          if (state.phase === 'battle') battleChecks++;
        }
      }
      // 실제로 전투를 거쳤는지 (검사가 헛돌지 않게)
      expect(battleChecks, name).toBeGreaterThan(50);
    }
  });
});

describe('shuffle 고르기', () => {
  it('4장을 24,000번 섞으면 24가지 순서가 고르게 나옴 (카이제곱 < 41.6, p 0.01)', () => {
    const state = createInitialState(12345);
    const counts = new Map<string, number>();
    const N = 24000;
    for (let i = 0; i < N; i++) {
      const key = shuffle(state, 'battle', ['a', 'b', 'c', 'd']).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(24);
    const expected = N / 24;
    let chi = 0;
    for (const c of counts.values()) chi += (c - expected) ** 2 / expected;
    expect(chi).toBeLessThan(41.6);
  });
});
