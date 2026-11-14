// 02 7.6 막 보스 뒤
import { constants } from '../../data/index';
import { setPhase } from '../phase';
import { heal } from '../battle/damage';
import { nextStage, requireRun } from '../helpers';
import type { GameEvent, GameState } from '../types';
import { generateMap } from './map';

/** 카드 고르기가 끝나면 actClear 국면이 되고, 이때 한꺼번에 적용 */
export function enterActClear(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  heal(state, events, Math.floor(run.maxHp * constants.ACT_CLEAR_HEAL_PCT));
  const unlocked = nextStage(run.maxStage);
  if (unlocked) {
    run.maxStage = unlocked;
    events.push({ type: 'stageUnlocked', stage: unlocked });
  }
  run.maxMemory += constants.ACT_CLEAR_MAX_MEMORY_GAIN;
  state.pending = { kind: 'actClear' };
  setPhase(state, events, 'actClear');
}

/** proceed: 다음 막 지도를 만들고 map으로 */
export function startNextAct(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  run.act += 1;
  run.map = generateMap(state, run.act);
  run.nodeId = null;
  run.path = [];
  state.pending = null;
  setPhase(state, events, 'map');
}
