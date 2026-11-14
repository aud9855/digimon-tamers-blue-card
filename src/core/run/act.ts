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
  // 새로 열린 단계의 형태 특성을 고름 (02 12.5)
  state.pending = { kind: 'actClear', traitStage: unlocked };
  setPhase(state, events, 'actClear');
}

/** 형태 특성 고르기 (02 12.5) */
export function chooseFormTrait(state: GameState, events: GameEvent[], index: number): void {
  const run = requireRun(state);
  const pending = state.pending;
  const traitId = constants.FORM_TRAITS[index];
  if (pending?.kind !== 'actClear' || !pending.traitStage || !traitId) {
    throw new Error('형태 특성을 고를 수 없습니다');
  }
  run.formTraits[pending.traitStage] = traitId;
  events.push({ type: 'formTraitChosen', stage: pending.traitStage, traitId });
  pending.traitStage = null;
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
