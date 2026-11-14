// 02 5절 디아크 칩
import { getChip } from '../data/index';
import { cardFace, isMatrix, requireRun } from './helpers';
import type { CardInstance } from './types';

/** 효과가 살아 있는 동료 (매트릭스 에볼루션 중에는 없음, 02 13.1) */
function activeCompanions(state: GameState): CardInstance[] {
  return isMatrix(state) ? [] : (state.battle?.companions ?? []);
}
import type { ChipDef, ChipTrigger, GameEvent, GameState } from './types';
import { runEffects } from './battle/effects';

/** 가진 칩 중 그 발동 시점의 칩을 얻은 순서대로 실행합니다 */
export function triggerChips(state: GameState, events: GameEvent[], trigger: ChipTrigger): void {
  const run = requireRun(state);
  for (const chipId of run.chips) {
    const chip = getChip(chipId);
    if (chip.trigger !== trigger || !chip.effects) continue;
    if (state.phase !== 'battle') return; // 패배로 전투가 끝났으면 멈춤
    events.push({ type: 'chipTriggered', chipId });
    runEffects(state, events, chip.effects, {});
  }
  // 동료: 칩 다음, 자리 순서대로 (02 12.6). 매트릭스 에볼루션 중에는 꺼짐 (02 13.1)
  for (const card of activeCompanions(state)) {
    const companion = cardFace(card).companion;
    if (companion?.trigger !== trigger || !companion.effects) continue;
    if (state.phase !== 'battle') return;
    events.push({ type: 'companionTriggered', cardUid: card.uid });
    runEffects(state, events, companion.effects, {});
  }
}

function sumModifier(state: GameState, key: keyof NonNullable<ChipDef['modifiers']>): number {
  const run = requireRun(state);
  return run.chips.reduce((sum, id) => sum + (getChip(id).modifiers?.[key] ?? 0), 0);
}

/** 칩과 동료의 진화 비용 보정 합 */
export const evolveCostDelta = (state: GameState) =>
  sumModifier(state, 'evolveCostDelta') +
  activeCompanions(state).reduce(
    (sum, card) => sum + (cardFace(card).companion?.modifiers?.evolveCostDelta ?? 0),
    0,
  );
export const battleBitsBonus = (state: GameState) => sumModifier(state, 'battleBitsBonus');
export const handSizeBonus = (state: GameState) => sumModifier(state, 'handSizeBonus');
export const firstCardCostDelta = (state: GameState) => sumModifier(state, 'firstCardCostDelta');
/** 턴 시작에 뽑는 묶음 수 (기본 1, 02 13.3) */
export const handGroups = (state: GameState) => Math.max(1, sumModifier(state, 'handGroups'));

/** 보상·상점·보물·이벤트로 얻을 수 있는 칩인지 (숨은 칩·시작 칩 제외, 02 12.3, 12.7) */
export function isRandomChip(chip: ChipDef): boolean {
  return !chip.hidden && !chip.start;
}

/** 칩 얻기. 같은 칩은 한 번만. maxHpBonus는 얻을 때 최대 HP와 지금 HP를 함께 올림 */
export function gainChip(state: GameState, events: GameEvent[], chipId: string): void {
  const run = requireRun(state);
  if (run.chips.includes(chipId)) throw new Error(`이미 가진 칩: ${chipId}`);
  const chip = getChip(chipId);
  run.chips.push(chipId);
  events.push({ type: 'chipGained', chipId });
  const bonus = chip.modifiers?.maxHpBonus ?? 0;
  if (bonus !== 0) {
    run.maxHp += bonus;
    run.hp += bonus;
  }
}
