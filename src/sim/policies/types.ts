import type { Action, GameState, TamerId } from '../../core/index';
import type { SimRng } from '../rng';

export type EvolveMode = 'asap' | 'turn2' | 'never';

export interface PolicyContext {
  rng: SimRng;
  tamerId: TamerId;
  evolve: EvolveMode;
  /** 판 시작에 고를 디지털 해저드 단계 (02 13.6) */
  hazard: number;
}

/** 정책: 지금 상태와 할 수 있는 행동을 받아 하나를 고름 (03 7.1) */
export type Policy = (state: GameState, legal: Action[], ctx: PolicyContext) => Action;
