import type { Action, GameState, TamerId } from '../../core/index';
import type { SimRng } from '../rng';

export type EvolveMode = 'asap' | 'turn2' | 'never';

export interface PolicyContext {
  rng: SimRng;
  tamerId: TamerId;
  evolve: EvolveMode;
  /** 판 시작에 고를 디지털 해저드 단계 (02 13.6) */
  hazard: number;
  /** 제시되면 고를 변이 id (02 15.1). 없으면 늘 건너뜀 */
  mutation?: string;
}

/** 정책: 지금 상태와 할 수 있는 행동을 받아 하나를 고름 (03 7.1) */
/**
 * 변이 국면 (02 15.1): 정해 둔 변이가 제시됐으면 고르고, 아니면 건너뜀.
 * 봇의 기본은 건너뛰기 (M2 지표는 변이 없는 판으로 잼). 봇 난수를 쓰지 않음
 */
export function mutationAction(state: GameState, ctx: PolicyContext): Action {
  const ids = state.pending?.kind === 'mutation' ? state.pending.mutationIds : [];
  const index = ctx.mutation === undefined ? -1 : ids.indexOf(ctx.mutation);
  return index >= 0 ? { type: 'chooseMutation', index } : { type: 'skipMutation' };
}

export type Policy = (state: GameState, legal: Action[], ctx: PolicyContext) => Action;
