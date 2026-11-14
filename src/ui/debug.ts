// 개발용 주소 옵션 (개발 서버에서만, main.tsx에서 import.meta.env.DEV일 때만 불러옴)
//   ?debug=battle&seed=N&steps=K : 봇이 만든 전투 상태 (전투 행동 K번 뒤)
//   ?debug=bot&seed=N&actions=K&phase=map : 봇이 K번 행동한 뒤, phase를 주면 그 국면이 될 때까지 더 진행
import {
  applyAction,
  createInitialState,
  fullUnlocks,
  getLegalActions,
  type GameState,
} from '../core/index';
import { greedyPolicy } from '../sim/policies/greedy';
import { createSimRng } from '../sim/rng';

/** 시드 seed의 greedy 판에서 steps번째 전투 행동 뒤의 상태 */
export function botBattleState(seed: number, steps: number): GameState {
  const ctx = {
    rng: createSimRng(seed),
    tamerId: 'takato' as const,
    evolve: 'asap' as const,
    hazard: 0,
  };
  let state = createInitialState(seed, fullUnlocks());
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

/** 시드 seed의 greedy 판에서 actions번 행동한 뒤, phase가 있으면 그 국면이 될 때까지 */
export function botRunState(seed: number, actions: number, phase?: GameState['phase']): GameState {
  const ctx = {
    rng: createSimRng(seed),
    tamerId: 'takato' as const,
    evolve: 'asap' as const,
    hazard: 0,
  };
  let state = createInitialState(seed, fullUnlocks());
  for (let i = 0; i < 5000; i++) {
    if (i >= actions && (!phase || state.phase === phase)) return state;
    const legal = getLegalActions(state);
    if (legal.length === 0) break;
    state = applyAction(state, greedyPolicy(state, legal, ctx)).state;
  }
  return state;
}

export function debugStateFromUrl(search: string): GameState | null {
  const params = new URLSearchParams(search);
  const seed = Number(params.get('seed') ?? 1);
  if (params.get('debug') === 'battle')
    return botBattleState(seed, Number(params.get('steps') ?? 0));
  if (params.get('debug') === 'bot') {
    const phase = (params.get('phase') ?? undefined) as GameState['phase'] | undefined;
    return botRunState(seed, Number(params.get('actions') ?? 0), phase);
  }
  return null;
}

/** 지금 상태에서 greedy 봇이 고를 행동 (자동 확인 스크립트가 화면 조작으로 옮김) */
export function botAction(state: GameState) {
  const ctx = {
    rng: createSimRng(state.seed),
    tamerId: 'takato' as const,
    evolve: 'asap' as const,
    hazard: 0,
  };
  const legal = getLegalActions(state);
  return legal.length > 0 ? greedyPolicy(state, legal, ctx) : null;
}
