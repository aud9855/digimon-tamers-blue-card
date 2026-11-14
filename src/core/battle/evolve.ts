// 02 3.7 진화
import { constants, getForm, getTamer } from '../../data/index';
import { nextStage, requireBattle, requireRun, stageIndex } from '../helpers';
import { evolveCostDelta, triggerChips } from '../chips';
import type { GameEvent, GameState, Stage } from '../types';
import { createTempCards } from './piles';

/**
 * 비용 공식만 (02 3.7). 칩 보정과 freeEvolve는 evolveCost가 더합니다.
 * cost = EVOLVE_BASE_COST[next] - (index(maxStage) - index(next))
 */
export function baseEvolveCost(next: Stage, maxStage: Stage): number {
  const base = constants.EVOLVE_BASE_COST[next];
  if (base === undefined) throw new Error(`진화 비용이 없는 단계: ${next}`);
  return base - (stageIndex(maxStage) - stageIndex(next));
}

/** 지금 진화 비용. 진화할 다음 단계가 열려 있지 않으면 null */
export function evolveCost(state: GameState): number | null {
  if (state.phase !== 'battle' || !state.battle) return null;
  const run = requireRun(state);
  const battle = state.battle;
  const next = nextStage(battle.stage);
  if (!next || stageIndex(battle.stage) >= stageIndex(run.maxStage)) return null;
  if (battle.freeEvolve) return 0;
  return Math.max(0, baseEvolveCost(next, run.maxStage) + evolveCostDelta(state));
}

/** 조건: 국면 battle, stage < maxStage, 비용을 낼 수 있음 */
export function canEvolve(state: GameState): boolean {
  const cost = evolveCost(state);
  if (cost === null || !state.battle) return false;
  return state.battle.memory - cost >= -constants.MAX_OVERDRAW;
}

/** 02 3.7 처리 순서 */
export function evolve(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  const run = requireRun(state);
  const cost = evolveCost(state);
  const next = nextStage(battle.stage);
  if (cost === null || !next) throw new Error('진화할 수 없습니다');
  const from = battle.stage;

  // 1.
  battle.memory -= cost;
  battle.freeEvolve = false;
  events.push({ type: 'memoryChanged', memory: battle.memory });
  // 2. 형태가 그 단계의 형태로 바뀜
  battle.stage = next;
  const form = getForm(getTamer(run.tamerId).line, next);
  // 3.
  battle.tempHp += form.tempHp;
  events.push({ type: 'evolved', from, to: next, cost, tempHpGained: form.tempHp });
  // 4. 필살기를 임시 카드로 손패에 (가득이면 버림 더미)
  if (form.signatureCardId) createTempCards(state, events, form.signatureCardId, 'hand', 1);
  // 5.
  battle.evolvedThisTurn = true;
  battle.evolveCount += 1;
  // 6.
  triggerChips(state, events, 'onEvolve');
}
