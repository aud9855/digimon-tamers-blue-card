// 한 판 돌리기, 여러 판 모으기 (03 7.2)
import {
  applyAction,
  createInitialState,
  getLegalActions,
  type GameEvent,
  type GameState,
  type TamerId,
} from '../core/index';
import { greedyPolicy } from './policies/greedy';
import { randomPolicy } from './policies/random';
import type { EvolveMode, Policy } from './policies/types';
import { createSimRng } from './rng';

export type PolicyName = 'random' | 'greedy';

export const POLICIES: Record<PolicyName, Policy> = {
  random: randomPolicy,
  greedy: greedyPolicy,
};

/** 한 판은 행동 이 수를 넘으면 실패로 처리 */
export const MAX_ACTIONS = 5000;

export interface RunConfig {
  policy: PolicyName;
  tamerId: TamerId;
  evolve: EvolveMode;
}

export type BattleRecord = Extract<GameEvent, { type: 'battleEnded' }>;

export interface RunRecord {
  seed: number;
  won: boolean;
  /** 행동 수가 MAX_ACTIONS를 넘어 끝나지 않음 */
  timedOut: boolean;
  actions: number;
  battles: BattleRecord[];
  turnsEnded: number;
  overdrawTurns: number;
  /** 카드 보상에서 고른 카드 id */
  picks: string[];
  finalState: GameState;
}

export function runOne(seed: number, config: RunConfig): RunRecord {
  const policy = POLICIES[config.policy];
  const ctx = { rng: createSimRng(seed), tamerId: config.tamerId, evolve: config.evolve };
  let state = createInitialState(seed);
  const record: RunRecord = {
    seed,
    won: false,
    timedOut: false,
    actions: 0,
    battles: [],
    turnsEnded: 0,
    overdrawTurns: 0,
    picks: [],
    finalState: state,
  };

  while (record.actions < MAX_ACTIONS) {
    const legal = getLegalActions(state);
    if (legal.length === 0) break;
    const action = policy(state, legal, ctx);
    if (action.type === 'pickCard' && state.pending?.kind === 'reward') {
      const picked = state.pending.offers[0]?.cards[action.index];
      if (picked) record.picks.push(picked.defId);
    }
    const result = applyAction(state, action);
    state = result.state;
    record.actions += 1;
    for (const e of result.events) {
      if (e.type === 'battleEnded') record.battles.push(e);
      if (e.type === 'turnEnded') {
        record.turnsEnded += 1;
        if (e.memory < 0) record.overdrawTurns += 1;
      }
    }
  }

  record.won = state.phase === 'runWon';
  record.timedOut = state.phase !== 'runWon' && state.phase !== 'runLost';
  record.finalState = state;
  return record;
}

export function runMany(config: RunConfig, runs: number, seedStart: number): RunRecord[] {
  const records: RunRecord[] = [];
  for (let i = 0; i < runs; i++) records.push(runOne(seedStart + i, config));
  return records;
}
