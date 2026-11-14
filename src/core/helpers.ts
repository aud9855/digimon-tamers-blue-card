// 여러 모듈이 함께 쓰는 작은 도우미
import { constants, getCard, getForm, getRampageForm, getTamer } from '../data/index';
import type {
  BattleState,
  CardFace,
  CardInstance,
  FormDef,
  GameState,
  RunState,
  Stage,
  Statuses,
} from './types';

export function stageIndex(stage: Stage): number {
  const i = constants.STAGE_ORDER.indexOf(stage);
  if (i < 0) throw new Error(`없는 단계: ${stage}`);
  return i;
}

export function nextStage(stage: Stage): Stage | null {
  return constants.STAGE_ORDER[stageIndex(stage) + 1] ?? null;
}

export function emptyStatuses(): Statuses {
  return { strength: 0, weak: 0, vulnerable: 0 };
}

/** 디지털 해저드의 그 규칙이 켜져 있는지 (02 13.6: 단계 N은 1~N 모두) */
export function hazardOn(state: GameState, rule: keyof typeof constants.HAZARD_LEVEL): boolean {
  return (state.run?.hazard ?? 0) >= constants.HAZARD_LEVEL[rule];
}

/** 퍼센트 정수로 곱하고 내림 */
export function pctFloor(value: number, pct: number): number {
  return Math.floor((value * pct) / 100);
}

export function requireRun(state: GameState): RunState {
  if (!state.run) throw new Error('런이 없습니다');
  return state.run;
}

export function requireBattle(state: GameState): BattleState {
  if (!state.battle) throw new Error('전투 중이 아닙니다');
  return state.battle;
}

/** 지금 형태. 전투 밖에서는 성장기입니다 (03 4절). */
export function currentForm(state: GameState): FormDef {
  const run = requireRun(state);
  const stage = state.battle?.stage ?? constants.STAGE_ORDER[0];
  if (!stage) throw new Error('STAGE_ORDER가 비었습니다');
  const line = getTamer(run.tamerId).line;
  if (state.battle?.rampage) {
    const rampageForm = getRampageForm(line);
    if (rampageForm) return rampageForm;
  }
  return getForm(line, stage);
}

/** 매트릭스 에볼루션 중인지: 폭주가 아닌 궁극체 (02 13.1) */
export function isMatrix(state: GameState): boolean {
  const battle = state.battle;
  return battle !== null && battle.stage === 'mega' && !battle.rampage;
}

/** 지금 형태의 공격력 (형태 특성 sharp 포함, 02 12.5) */
export function formPower(state: GameState): number {
  const run = requireRun(state);
  const stage = state.battle?.stage;
  const bonus = stage && run.formTraits[stage] === 'sharp' ? constants.FORM_TRAIT_POWER : 0;
  return currentForm(state).power + bonus;
}

/** 그 단계로 진화할 때 얻는 임시 HP (형태 특성 tough 포함, 02 12.5) */
export function formTempHp(state: GameState, form: FormDef): number {
  const tough = requireRun(state).formTraits[form.stage] === 'tough';
  return form.tempHp + (tough ? constants.FORM_TRAIT_TEMP_HP : 0);
}

/** 카드 인스턴스가 쓰는 면 (기본 / 강화) */
export function cardFace(card: { defId: string; upgraded: boolean }): CardFace {
  const def = getCard(card.defId);
  return card.upgraded ? def.upgraded : def.base;
}

export function hasKeyword(card: CardInstance, keyword: NonNullable<CardFace['keywords']>[number]) {
  return cardFace(card).keywords?.includes(keyword) ?? false;
}

export function newCardInstance(
  state: GameState,
  defId: string,
  upgraded: boolean,
  temp = false,
): CardInstance {
  const card: CardInstance = { uid: state.nextUid, defId, upgraded };
  if (temp) card.temp = true;
  state.nextUid += 1;
  return card;
}

export function livingEnemyIndexes(battle: BattleState): number[] {
  const result: number[] = [];
  battle.enemies.forEach((e, i) => {
    if (e.alive) result.push(i);
  });
  return result;
}

/** 강화할 수 있는 카드 (02 4.1) */
export function isUpgradable(card: CardInstance): boolean {
  const rarity = getCard(card.defId).rarity;
  return !card.upgraded && rarity !== 'special';
}

/** 0 이상 정수로 내림 (02 3.8: 곱셈을 모두 한 뒤 마지막에 한 번만) */
export function floorNonNegative(value: number): number {
  return Math.max(0, Math.floor(value));
}
