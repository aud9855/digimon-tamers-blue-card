// 02 15.1 변이 카드: 고른 변이의 효과를 읽는 도우미. 규칙을 거는 곳은 각 모듈입니다.
import { getMutation } from '../data/index';
import { pctChangeFloor, pctChangeMult } from './helpers';
import type { GameState, MutationDef, MutationEffect, MutationModifiers } from './types';

type MutationOp = MutationEffect['op'];
type EffectOf<K extends MutationOp> = Extract<MutationEffect, { op: K }>;

/** 변이의 효과 전부 (좋은 점 → 나쁜 점 순서) */
export function mutationEffectList(def: MutationDef): MutationEffect[] {
  return [...def.good, ...def.bad];
}

/** 지금 판의 변이에서 그 종류의 효과만 (변이가 없으면 빈 목록) */
export function mutationEffects<K extends MutationOp>(state: GameState, op: K): EffectOf<K>[] {
  const id = state.run?.mutation ?? null;
  if (id === null) return [];
  return mutationEffectList(getMutation(id)).filter((e): e is EffectOf<K> => e.op === op);
}

/** 퍼센트 효과를 차례로 걸고 내림: floor(값 × (100 + pct) / 100) */
export function applyMutationPct(
  state: GameState,
  op: 'enemyHpPct' | 'shopPricePct',
  value: number,
): number {
  return mutationEffects(state, op).reduce((v, e) => pctChangeFloor(v, e.pct), value);
}

/** 적의 공격 피해 배율: (100 + pct) / 100 들의 곱 (3.8 mult에 곱함, 내림은 마지막에 한 번) */
export function mutationEnemyDamageMult(state: GameState): number {
  return mutationEffects(state, 'enemyDamagePct').reduce((m, e) => m * pctChangeMult(e.pct), 1);
}

/** 수량 효과의 합 (maxHp, startBits, rewardCards) */
export function mutationAmount(
  state: GameState,
  op: 'maxHp' | 'startBits' | 'rewardCards',
): number {
  return mutationEffects(state, op).reduce((sum, e) => sum + e.amount, 0);
}

/** 변이를 숨은 칩처럼 더해 세는 수치 보정 (02 15.1: 세 가지만) */
export function mutationModifier(state: GameState, key: keyof MutationModifiers): number {
  return mutationEffects(state, 'modifiers').reduce((sum, e) => sum + (e.modifiers[key] ?? 0), 0);
}
