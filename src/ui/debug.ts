// 개발용: 주소에 ?debug=battle&seed=N&steps=K 를 붙이면 봇이 만든 전투 상태로 시작 (04 T1-2)
// 개발 서버에서만 불러옵니다 (main.tsx에서 import.meta.env.DEV일 때만).
import { applyAction, createInitialState, getLegalActions, type GameState } from '../core/index';
import { greedyPolicy } from '../sim/policies/greedy';
import { createSimRng } from '../sim/rng';

/** 시드 seed의 greedy 판에서 steps번째 전투 행동 뒤의 상태 */
export function botBattleState(seed: number, steps: number): GameState {
  const ctx = { rng: createSimRng(seed), tamerId: 'takato' as const, evolve: 'asap' as const };
  let state = createInitialState(seed);
  let battleSteps = 0;
  for (let i = 0; i < 5000; i++) {
    if (state.phase === 'battle' && battleSteps >= steps) return state;
    const legal = getLegalActions(state);
    if (legal.length === 0) break;
    if (state.phase === 'battle') battleSteps++;
    state = applyAction(state, greedyPolicy(state, legal, ctx)).state;
  }
  return state;
}

export function debugStateFromUrl(search: string): GameState | null {
  const params = new URLSearchParams(search);
  if (params.get('debug') !== 'battle') return null;
  return botBattleState(Number(params.get('seed') ?? 1), Number(params.get('steps') ?? 0));
}
