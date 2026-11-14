import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  attributeMultiplier,
  enemyHitDamage,
  hitEnemy,
  hitPlayer,
  playerHitDamage,
} from '../../src/core/battle/damage';
import type { GameEvent } from '../../src/core/types';
import { overrideRegistry } from '../../src/data/index';
import { battleOf, eventsOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

describe('속성 배율 (02 3.8)', () => {
  it('백신 > 바이러스 > 데이터 > 백신, 같거나 none이면 1', () => {
    expect(attributeMultiplier('vaccine', 'vaccine')).toBe(1);
    expect(attributeMultiplier('vaccine', 'data')).toBe(0.75);
    expect(attributeMultiplier('vaccine', 'virus')).toBe(1.5);
    expect(attributeMultiplier('data', 'vaccine')).toBe(1.5);
    expect(attributeMultiplier('data', 'data')).toBe(1);
    expect(attributeMultiplier('data', 'virus')).toBe(0.75);
    expect(attributeMultiplier('virus', 'vaccine')).toBe(0.75);
    expect(attributeMultiplier('virus', 'data')).toBe(1.5);
    expect(attributeMultiplier('virus', 'virus')).toBe(1);
    expect(attributeMultiplier('none', 'virus')).toBe(1);
    expect(attributeMultiplier('vaccine', 'none')).toBe(1);
  });
});

describe('검산 예시 (02 3.8)', () => {
  it('1. 길몬이 타격 6으로 알로몬(데이터) 공격 → 9', () => {
    const state = makeBattle({ enemies: ['allomon'] });
    expect(playerHitDamage(state, 6, 0).damage).toBe(9);
  });

  it('2. 길몬이 타격 6으로 하피몬(백신) 공격 → 4', () => {
    const state = makeBattle({ enemies: ['harpymon'] });
    expect(playerHitDamage(state, 6, 0).damage).toBe(4);
  });

  it('3. 그라우몬(power 1), 힘 2, 연속 공격 4의 hit 하나로 하피몬 공격 → 5', () => {
    const state = makeBattle({
      enemies: ['harpymon'],
      stage: 'champion',
      statuses: { strength: 2 },
    });
    expect(playerHitDamage(state, 4, 0).damage).toBe(5);
  });

  it('4. 길몬이 약화 상태로 강타 14, 취약 걸린 고부리몬(바이러스) 공격 → 15', () => {
    const state = makeBattle({
      enemies: ['goblimon'],
      statuses: { weak: 1 },
      enemyOverrides: [{ statuses: { strength: 0, weak: 0, vulnerable: 1 } }],
    });
    expect(playerHitDamage(state, 14, 0).damage).toBe(15);
  });

  it('5. 고릴라몬(데이터) 공격 15, 가속 2, 길몬(바이러스)이 맞음 → 19', () => {
    const state = makeBattle({ enemies: ['gorillamon'], enemyOverrides: [{ accel: 2 }] });
    // floor(15 × (1 + 0.35 × 2) × 0.75) = floor(19.125)
    expect(enemyHitDamage(state, 15, 0).damage).toBe(19);
  });

  it('6. 고부리몬(바이러스) 공격 6, 힘 2, 취약 걸린 길몬이 맞음 → 12', () => {
    const state = makeBattle({
      enemies: ['goblimon'],
      statuses: { vulnerable: 1 },
      enemyOverrides: [{ statuses: { strength: 2, weak: 0, vulnerable: 0 } }],
    });
    expect(enemyHitDamage(state, 6, 0).damage).toBe(12);
  });
});

describe('피해 적용 순서', () => {
  it('플레이어가 맞으면 실드 → 임시 HP → HP', () => {
    const state = makeBattle({
      enemies: ['test_dummy'],
      hp: 50,
      shield: 3,
      tempHp: 4,
    });
    const events: GameEvent[] = [];
    hitPlayer(state, events, 10, 0);
    expect(battleOf(state).shield).toBe(0);
    expect(battleOf(state).tempHp).toBe(0);
    expect(state.run?.hp).toBe(47);
    expect(eventsOf(events, 'damage')[0]).toMatchObject({
      amount: 10,
      blocked: 3,
      tempHpLost: 4,
      hpLost: 3,
    });
  });

  it('실드가 남으면 임시 HP와 HP는 그대로', () => {
    const state = makeBattle({ hp: 50, shield: 12, tempHp: 4 });
    hitPlayer(state, [], 10, 0);
    expect(battleOf(state).shield).toBe(2);
    expect(battleOf(state).tempHp).toBe(4);
    expect(state.run?.hp).toBe(50);
  });

  it('적은 실드 → HP, HP가 0 이하면 그 자리에서 죽음', () => {
    const state = makeBattle({ enemyOverrides: [{ hp: 5, shield: 2 }] });
    const events: GameEvent[] = [];
    hitEnemy(state, events, 7, 0);
    const enemy = battleOf(state).enemies[0];
    expect(enemy?.shield).toBe(0);
    expect(enemy?.hp).toBe(0);
    expect(enemy?.alive).toBe(false);
    expect(eventsOf(events, 'enemyDied')).toHaveLength(1);
  });

  it('피해는 0 아래로 내려가지 않는다', () => {
    const state = makeBattle({ statuses: { strength: -10 } });
    expect(playerHitDamage(state, 3, 0).damage).toBe(0);
  });
});
