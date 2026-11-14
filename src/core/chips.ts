// 02 5절 디아크 칩
import { getChip } from '../data/index';
import { requireRun } from './helpers';
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
}

function sumModifier(state: GameState, key: keyof NonNullable<ChipDef['modifiers']>): number {
  const run = requireRun(state);
  return run.chips.reduce((sum, id) => sum + (getChip(id).modifiers?.[key] ?? 0), 0);
}

export const evolveCostDelta = (state: GameState) => sumModifier(state, 'evolveCostDelta');
export const battleBitsBonus = (state: GameState) => sumModifier(state, 'battleBitsBonus');
export const handSizeBonus = (state: GameState) => sumModifier(state, 'handSizeBonus');
export const firstCardCostDelta = (state: GameState) => sumModifier(state, 'firstCardCostDelta');

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
