import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runEffects } from '../../src/core/battle/effects';
import { getLegalActions, IllegalActionError } from '../../src/core/engine';
import type { Effect, GameEvent, GameState } from '../../src/core/types';
import { getCards, overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, handUid, makeBattle, play } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

function run(state: GameState, effects: Effect[], targetIndex?: number): GameEvent[] {
  const events: GameEvent[] = [];
  runEffects(state, events, effects, targetIndex === undefined ? {} : { targetIndex });
  return events;
}

describe('효과 op 하나하나 (02 4.3)', () => {
  it('damage: enemy / allEnemies / randomEnemy, hits마다 따로', () => {
    const state = makeBattle({ enemies: ['test_dummy', 'test_dummy', 'test_dummy'] });
    run(state, [{ op: 'damage', amount: 5, hits: 2, target: 'enemy' }], 1);
    expect(battleOf(state).enemies.map((e) => e.hp)).toEqual([100, 90, 100]);

    run(state, [{ op: 'damage', amount: 3, target: 'allEnemies' }]);
    expect(battleOf(state).enemies.map((e) => e.hp)).toEqual([97, 87, 97]);

    const events = run(state, [{ op: 'damage', amount: 1, hits: 4, target: 'randomEnemy' }]);
    expect(eventsOf(events, 'damage')).toHaveLength(4);
    const total = battleOf(state).enemies.reduce((sum, e) => sum + e.hp, 0);
    expect(total).toBe(97 + 87 + 97 - 4);
  });

  it('shield: 플레이어 실드 +', () => {
    const state = makeBattle({ shield: 2 });
    run(state, [{ op: 'shield', amount: 5 }]);
    expect(battleOf(state).shield).toBe(7);
  });

  it('draw: 카드 뽑기', () => {
    const state = makeBattle({ drawPile: ['strike', 'guard', 'strike'] });
    run(state, [{ op: 'draw', count: 2 }]);
    expect(battleOf(state).hand).toHaveLength(2);
    expect(battleOf(state).drawPile).toHaveLength(1);
  });

  it('gainMemory: 메모리 +', () => {
    const state = makeBattle({ memory: -1 });
    run(state, [{ op: 'gainMemory', amount: 3 }]);
    expect(battleOf(state).memory).toBe(2);
  });

  it('heal: 최대 HP까지', () => {
    const state = makeBattle({ hp: 70, maxHp: 75 });
    const events = run(state, [{ op: 'heal', amount: 9 }]);
    expect(state.run?.hp).toBe(75);
    expect(eventsOf(events, 'healed')[0]?.amount).toBe(5);
  });

  it('loseHp: 실드·임시 HP를 무시하고 HP에서 바로', () => {
    const state = makeBattle({ hp: 30, shield: 10, tempHp: 10 });
    run(state, [{ op: 'loseHp', amount: 4 }]);
    expect(state.run?.hp).toBe(26);
    expect(battleOf(state).shield).toBe(10);
    expect(battleOf(state).tempHp).toBe(10);
  });

  it('applyStatus: self / enemy / allEnemies, 같은 상태는 더함', () => {
    const state = makeBattle({ enemies: ['test_dummy', 'test_dummy'] });
    run(state, [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }]);
    run(state, [{ op: 'applyStatus', status: 'strength', amount: 1, target: 'self' }]);
    run(state, [{ op: 'applyStatus', status: 'vulnerable', amount: 1, target: 'enemy' }], 1);
    run(state, [{ op: 'applyStatus', status: 'weak', amount: 2, target: 'allEnemies' }]);
    const battle = battleOf(state);
    expect(battle.statuses.strength).toBe(3);
    expect(battle.enemies[0]?.statuses).toEqual({ strength: 0, weak: 2, vulnerable: 0 });
    expect(battle.enemies[1]?.statuses).toEqual({ strength: 0, weak: 2, vulnerable: 1 });
  });

  it('freeEvolve: 표시가 켜진다', () => {
    const state = makeBattle();
    run(state, [{ op: 'freeEvolve' }]);
    expect(battleOf(state).freeEvolve).toBe(true);
  });

  it('addCard: 임시 카드를 손패·버림 더미·뽑을 더미에', () => {
    const state = makeBattle({ drawPile: ['strike', 'strike', 'strike'] });
    run(state, [
      { op: 'addCard', cardId: 'bug_data', to: 'hand', count: 1 },
      { op: 'addCard', cardId: 'bug_data', to: 'discard', count: 2 },
      { op: 'addCard', cardId: 'bug_data', to: 'draw', count: 1 },
    ]);
    const battle = battleOf(state);
    expect(battle.hand.map((c) => c.defId)).toEqual(['bug_data']);
    expect(battle.discardPile.filter((c) => c.defId === 'bug_data')).toHaveLength(2);
    expect(battle.drawPile.filter((c) => c.defId === 'bug_data')).toHaveLength(1);
    expect(battle.drawPile).toHaveLength(4);
    for (const c of [...battle.hand, ...battle.discardPile]) expect(c.temp).toBe(true);
  });

  it('ifStage: min 이상이면 then, 아니면 else', () => {
    const effect: Effect = {
      op: 'ifStage',
      min: 'champion',
      then: [{ op: 'shield', amount: 10 }],
      else: [{ op: 'shield', amount: 1 }],
    };
    const rookie = makeBattle({ stage: 'rookie' });
    run(rookie, [effect]);
    expect(battleOf(rookie).shield).toBe(1);
    const champion = makeBattle({ stage: 'champion' });
    run(champion, [effect]);
    expect(battleOf(champion).shield).toBe(10);
  });

  it('ifEvolvedThisTurn: 이번 턴에 진화했으면 then, 아니면 else', () => {
    const effect: Effect = {
      op: 'ifEvolvedThisTurn',
      then: [{ op: 'shield', amount: 10 }],
      else: [{ op: 'shield', amount: 1 }],
    };
    const before = makeBattle();
    run(before, [effect]);
    expect(battleOf(before).shield).toBe(1);
    const after = makeBattle();
    battleOf(after).evolvedThisTurn = true;
    run(after, [effect]);
    expect(battleOf(after).shield).toBe(10);
  });
});

describe('카드 내기 (02 3.5)', () => {
  it('메모리를 쓰고, 손패에서 빼고, 효과 뒤 버림 더미로', () => {
    const state = makeBattle({ hand: ['strike'], memory: 3 });
    const { state: next } = play(state, 'strike', 0);
    const battle = battleOf(next);
    expect(battle.memory).toBe(2);
    expect(battle.hand).toHaveLength(0);
    expect(battle.discardPile.map((c) => c.defId)).toEqual(['strike']);
    expect(battle.enemies[0]?.hp).toBe(94);
  });

  it('exhaust 카드는 소멸 더미로', () => {
    const state = makeBattle({ hand: ['charge'] });
    const next = play(state, 'charge').state;
    expect(battleOf(next).exhaustPile.map((c) => c.defId)).toEqual(['charge']);
    expect(battleOf(next).discardPile).toHaveLength(0);
  });

  it('대상이 필요한 카드는 살아 있는 적을 지정해야 하고, 필요 없는 카드는 지정하지 않음', () => {
    const state = makeBattle({
      hand: ['strike', 'guard'],
      enemies: ['test_dummy', 'test_dummy'],
      enemyOverrides: [{ alive: false, hp: 0 }],
    });
    const strike = handUid(state, 'strike');
    const guard = handUid(state, 'guard');
    expect(() => act(state, { type: 'playCard', cardUid: strike })).toThrow(IllegalActionError);
    expect(() => act(state, { type: 'playCard', cardUid: strike, targetIndex: 0 })).toThrow(
      IllegalActionError,
    );
    expect(() => act(state, { type: 'playCard', cardUid: guard, targetIndex: 1 })).toThrow(
      IllegalActionError,
    );
    expect(() => act(state, { type: 'playCard', cardUid: strike, targetIndex: 1 })).not.toThrow();
    expect(() => act(state, { type: 'playCard', cardUid: guard })).not.toThrow();
  });

  it('조건 효과 안쪽에 enemy 대상이 있어도 대상이 필요함', () => {
    const state = makeBattle({ hand: ['rock_breaker'] });
    const uid = handUid(state, 'rock_breaker');
    expect(getLegalActions(state)).toContainEqual({
      type: 'playCard',
      cardUid: uid,
      targetIndex: 0,
    });
  });

  it('unplayable 카드는 낼 수 없음', () => {
    const state = makeBattle({ hand: ['bug_data'] });
    const uid = handUid(state, 'bug_data');
    expect(() => act(state, { type: 'playCard', cardUid: uid })).toThrow(IllegalActionError);
  });

  it('대상이 죽으면 남은 hit과 그 대상의 남은 효과를 건너뜀', () => {
    const state = makeBattle({
      hand: ['bite'],
      enemies: ['test_dummy', 'test_dummy'],
      enemyOverrides: [{ hp: 5 }],
    });
    const { state: next, events } = play(state, 'bite', 0);
    expect(battleOf(next).enemies[0]?.alive).toBe(false);
    expect(eventsOf(events, 'statusApplied')).toHaveLength(0);

    const twoHits = makeBattle({
      hand: ['double_strike'],
      enemies: ['test_dummy', 'test_dummy'],
      enemyOverrides: [{ hp: 3 }],
    });
    const result = play(twoHits, 'double_strike', 0);
    expect(eventsOf(result.events, 'damage')).toHaveLength(1);
  });

  it('모든 카드의 두 면을 실제로 내 본다', () => {
    const cards = getCards().filter((c) => !c.base.keywords?.includes('unplayable'));
    for (const card of cards) {
      for (const upgraded of [false, true]) {
        const spec = upgraded ? `${card.id}+` : card.id;
        const state = makeBattle({
          hand: [spec],
          drawPile: ['strike', 'strike', 'strike'],
          enemies: ['test_dummy', 'test_dummy'],
          memory: 3,
        });
        const uid = battleOf(state).hand[0]?.uid ?? -1;
        const legal = getLegalActions(state).find(
          (a) => a.type === 'playCard' && a.cardUid === uid,
        );
        expect(legal, `${spec}를 낼 수 있어야 함`).toBeDefined();
        if (!legal) continue;
        const { state: next, events } = act(state, legal);
        expect(eventsOf(events, 'cardPlayed')).toHaveLength(1);
        expect(battleOf(next).hand.some((c) => c.uid === uid)).toBe(false);
      }
    }
  });
});

describe('승리와 패배 (02 3.11)', () => {
  it('loseHp로 HP가 0이 되면 패배하고 국면은 runLost', () => {
    const state = makeBattle({ hand: ['digital_hazard'], hp: 4 });
    const { state: next, events } = play(state, 'digital_hazard', 0);
    expect(next.phase).toBe('runLost');
    expect(next.battle).toBeNull();
    expect(eventsOf(events, 'battleEnded')[0]?.won).toBe(false);
    expect(eventsOf(events, 'runEnded')[0]?.won).toBe(false);
  });

  it('마지막 적을 잡으면 그 카드의 남은 효과(HP 4 잃음)는 실행되지 않고 승리', () => {
    const state = makeBattle({
      hand: ['digital_hazard'],
      hp: 4,
      enemyOverrides: [{ hp: 10 }],
    });
    const { state: next, events } = play(state, 'digital_hazard', 0);
    expect(next.run?.hp).toBe(4);
    expect(eventsOf(events, 'hpLost')).toHaveLength(0);
    expect(eventsOf(events, 'battleEnded')[0]).toMatchObject({ won: true, kind: 'normal' });
    expect(next.battle).toBeNull();
    expect(next.phase).toBe('reward');
  });

  it('카드는 승리 전에 버림 더미로 옮겨진다 (4번까지 처리)', () => {
    const state = makeBattle({ hand: ['strike'], enemyOverrides: [{ hp: 1 }] });
    const { events } = play(state, 'strike', 0);
    const types = events.map((e) => e.type);
    expect(types.indexOf('cardMoved')).toBeLessThan(types.indexOf('battleEnded'));
  });

  it('적의 공격으로 HP가 0 이하가 되면 즉시 패배하고 다음 적은 행동하지 않음', () => {
    const state = makeBattle({ enemies: ['test_attacker', 'test_attacker'], hp: 10 });
    const { state: next, events } = act(state, { type: 'endTurn' });
    expect(next.phase).toBe('runLost');
    expect(eventsOf(events, 'enemyMoved')).toHaveLength(1);
  });
});
