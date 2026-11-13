import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLegalActions, IllegalActionError } from '../../src/core/engine';
import { overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, handUid, makeBattle, play } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

const DRAW = Array.from({ length: 30 }, () => 'guard');

describe('당겨쓰기 (02 3.6)', () => {
  it('메모리는 -3까지 내려갈 수 있고, 그보다 아래로 가는 카드는 낼 수 없다', () => {
    const state = makeBattle({ hand: ['heavy_strike', 'strike'], memory: -1 });
    // 강타(2): -1 - 2 = -3 → 가능
    const next = play(state, 'heavy_strike', 0).state;
    expect(battleOf(next).memory).toBe(-3);
    // 타격(1): -3 - 1 = -4 → 불가
    const uid = handUid(next, 'strike');
    expect(() => act(next, { type: 'playCard', cardUid: uid, targetIndex: 0 })).toThrow(
      IllegalActionError,
    );
    expect(getLegalActions(next).filter((a) => a.type === 'playCard')).toHaveLength(0);
  });

  it('턴을 끝낼 때 memory < 0이면 살아 있는 모든 적이 가속 N을 얻는다', () => {
    const state = makeBattle({
      enemies: ['test_dummy', 'test_dummy', 'test_dummy'],
      enemyOverrides: [{}, { alive: false, hp: 0 }, {}],
      memory: -2,
      drawPile: DRAW,
    });
    const { state: next, events } = act(state, { type: 'endTurn' });
    expect(battleOf(next).enemies.map((e) => e.accel)).toEqual([2, 0, 2]);
    expect(eventsOf(events, 'turnEnded')[0]?.memory).toBe(-2);
  });

  it('도중에 음수였어도 gainMemory로 0 이상이면 가속이 없다', () => {
    const state = makeBattle({ hand: ['heavy_strike', 'charge'], memory: 1, drawPile: DRAW });
    const s1 = play(state, 'heavy_strike', 0).state;
    expect(battleOf(s1).memory).toBe(-1);
    const s2 = play(s1, 'charge').state;
    expect(battleOf(s2).memory).toBe(1);
    const s3 = act(s2, { type: 'endTurn' }).state;
    expect(battleOf(s3).enemies[0]?.accel).toBe(0);
  });
});

describe('가속 (02 3.8, 3.9)', () => {
  it('가속은 공격 피해를 1점당 +35% 올리고, 공격한 뒤 0이 된다', () => {
    const state = makeBattle({
      enemies: ['test_attacker'],
      hp: 50,
      memory: -2,
      drawPile: DRAW,
    });
    const { state: next, events } = act(state, { type: 'endTurn' });
    // 공격 10 × 1.7 = 17
    expect(next.run?.hp).toBe(33);
    expect(battleOf(next).enemies[0]?.accel).toBe(0);
    const accelEvents = eventsOf(events, 'accelChanged');
    expect(accelEvents.map((e) => e.accel)).toEqual([2, 0]);
  });

  it('방어 행동에서는 가속이 유지된다', () => {
    const state = makeBattle({
      enemies: ['test_attacker'],
      hp: 50,
      memory: -1,
      drawPile: DRAW,
      enemyOverrides: [{ intentMoveId: 'guard', cycleIndex: 1 }],
    });
    const after = act(state, { type: 'endTurn' }).state;
    expect(battleOf(after).enemies[0]?.accel).toBe(1);
    // 다음 턴: 공격 10 × 1.35 = 13, 그 뒤 0
    const after2 = act(after, { type: 'endTurn' }).state;
    expect(after2.run?.hp).toBe(37);
    expect(battleOf(after2).enemies[0]?.accel).toBe(0);
  });
});
