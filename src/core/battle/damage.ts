// 02 3.8 피해 계산·적용
import { constants, getEnemy } from '../../data/index';
import { currentForm, floorNonNegative, requireBattle, requireRun } from '../helpers';
import type { Attribute, GameEvent, GameState } from '../types';
import { checkDefeat } from './outcome';

/** 속성 배율 attr(공격, 방어): 백신 > 바이러스 > 데이터 > 백신 */
export function attributeMultiplier(attacker: Attribute, defender: Attribute): number {
  if (attacker === 'none' || defender === 'none' || attacker === defender) return 1;
  const beats: Record<Exclude<Attribute, 'none'>, Attribute> = {
    vaccine: 'virus',
    virus: 'data',
    data: 'vaccine',
  };
  return beats[attacker] === defender ? constants.ATTR_STRONG : constants.ATTR_WEAK;
}

export interface DamageCalc {
  damage: number;
  attrMult: number;
}

/** 플레이어 → 적 hit 하나의 피해 */
export function playerHitDamage(state: GameState, amount: number, enemyIndex: number): DamageCalc {
  const battle = requireBattle(state);
  const enemy = battle.enemies[enemyIndex];
  if (!enemy) throw new Error(`없는 적 위치: ${enemyIndex}`);
  const form = currentForm(state);
  const attrMult = attributeMultiplier(form.attribute, getEnemy(enemy.defId).attribute);
  const raw = amount + form.power + battle.statuses.strength;
  const mult =
    attrMult *
    (battle.statuses.weak > 0 ? constants.WEAK_MULT : 1) *
    (enemy.statuses.vulnerable > 0 ? constants.VULNERABLE_MULT : 1);
  return { damage: floorNonNegative(raw * mult), attrMult };
}

/** 적 → 플레이어 hit 하나의 피해 */
export function enemyHitDamage(state: GameState, amount: number, enemyIndex: number): DamageCalc {
  const battle = requireBattle(state);
  const enemy = battle.enemies[enemyIndex];
  if (!enemy) throw new Error(`없는 적 위치: ${enemyIndex}`);
  const form = currentForm(state);
  const attrMult = attributeMultiplier(getEnemy(enemy.defId).attribute, form.attribute);
  const raw = amount + enemy.statuses.strength;
  const mult =
    (1 + constants.ACCEL_PER_POINT * enemy.accel) *
    attrMult *
    (enemy.statuses.weak > 0 ? constants.WEAK_MULT : 1) *
    (battle.statuses.vulnerable > 0 ? constants.VULNERABLE_MULT : 1);
  return { damage: floorNonNegative(raw * mult), attrMult };
}

/** 플레이어가 적에게 hit 하나. 피해 적용 순서: 실드 → HP. HP가 0 이하면 그 자리에서 죽음 */
export function hitEnemy(
  state: GameState,
  events: GameEvent[],
  amount: number,
  enemyIndex: number,
): void {
  const battle = requireBattle(state);
  const enemy = battle.enemies[enemyIndex];
  if (!enemy || !enemy.alive) return;
  const { damage, attrMult } = playerHitDamage(state, amount, enemyIndex);
  const blocked = Math.min(enemy.shield, damage);
  enemy.shield -= blocked;
  const hpLost = damage - blocked;
  enemy.hp -= hpLost;
  events.push({
    type: 'damage',
    source: 'player',
    target: enemyIndex,
    amount: damage,
    blocked,
    tempHpLost: 0,
    hpLost,
    attrMult,
  });
  if (enemy.hp <= 0) {
    enemy.alive = false;
    events.push({ type: 'enemyDied', enemyIndex });
  }
}

/** 적이 플레이어에게 hit 하나. 실드 → 임시 HP → HP. 패배를 확인합니다 */
export function hitPlayer(
  state: GameState,
  events: GameEvent[],
  amount: number,
  enemyIndex: number,
): void {
  const battle = requireBattle(state);
  const run = requireRun(state);
  const { damage, attrMult } = enemyHitDamage(state, amount, enemyIndex);
  const blocked = Math.min(battle.shield, damage);
  battle.shield -= blocked;
  const tempHpLost = Math.min(battle.tempHp, damage - blocked);
  battle.tempHp -= tempHpLost;
  const hpLost = damage - blocked - tempHpLost;
  run.hp -= hpLost;
  events.push({
    type: 'damage',
    source: enemyIndex,
    target: 'player',
    amount: damage,
    blocked,
    tempHpLost,
    hpLost,
    attrMult,
  });
  checkDefeat(state, events);
}

/** loseHp: 계산 없이 HP에서 바로 뺌 (실드·임시 HP 무시) */
export function loseHp(state: GameState, events: GameEvent[], amount: number): void {
  const run = requireRun(state);
  run.hp -= amount;
  events.push({ type: 'hpLost', amount });
  checkDefeat(state, events);
}

/** 회복 (최대 HP까지) */
export function heal(state: GameState, events: GameEvent[], amount: number): void {
  const run = requireRun(state);
  const healed = Math.max(0, Math.min(amount, run.maxHp - run.hp));
  run.hp += healed;
  events.push({ type: 'healed', amount: healed });
}
