import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { drawCards } from '../../src/core/battle/piles';
import { startBattle } from '../../src/core/battle/start';
import type { GameEvent } from '../../src/core/types';
import { constants, overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

const TEN_STRIKES = Array.from({ length: 10 }, () => 'strike');

describe('전투 시작 (02 3.2)', () => {
  it('덱을 섞어 뽑을 더미로 두고, 첫 턴을 시작해 5장을 뽑는다', () => {
    const state = makeBattle({ deck: TEN_STRIKES });
    state.battle = null;
    state.phase = 'map';
    const events: GameEvent[] = [];
    startBattle(state, events, 'test_dummy_one', 'normal');
    const battle = battleOf(state);
    expect(state.phase).toBe('battle');
    expect(battle.turn).toBe(1);
    expect(battle.stage).toBe('rookie');
    expect(battle.memory).toBe(state.run?.maxMemory);
    expect(battle.hand).toHaveLength(constants.HAND_SIZE);
    expect(battle.drawPile).toHaveLength(10 - constants.HAND_SIZE);
    expect(battle.hpAtStart).toBe(state.run?.hp);
    expect(battle.enemies[0]?.intentMoveId).toBe('idle');
  });

  it('innate 카드는 섞은 뒤 맨 위로 가서 첫 손패에 들어온다', () => {
    const restoreInnate = overrideRegistry({
      cards: [
        {
          id: 'test_innate',
          name: '시험 선천',
          type: 'skill',
          rarity: 'common',
          pool: 'none',
          base: { cost: 1, effects: [], keywords: ['innate'] },
          upgraded: { cost: 1, effects: [], keywords: ['innate'] },
        },
      ],
    });
    try {
      for (let seed = 1; seed <= 20; seed++) {
        const state = makeBattle({
          seed,
          deck: [...Array.from({ length: 15 }, () => 'strike'), 'test_innate'],
        });
        state.battle = null;
        startBattle(state, [], 'test_dummy_one', 'normal');
        expect(battleOf(state).hand.some((c) => c.defId === 'test_innate')).toBe(true);
      }
    } finally {
      restoreInnate();
    }
  });
});

describe('턴 시작과 실드 (02 3.3)', () => {
  it('실드는 첫 턴에는 남고 2턴째 시작에 사라진다', () => {
    const state = makeBattle({ deck: TEN_STRIKES, chips: ['cube_shield'] });
    state.battle = null;
    startBattle(state, [], 'test_dummy_one', 'normal');
    expect(battleOf(state).turn).toBe(1);
    expect(battleOf(state).shield).toBe(6);

    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).turn).toBe(2);
    expect(battleOf(next).shield).toBe(0);
  });

  it('턴 시작 순서: turn+1, 메모리 채움, 진화 표시 끔, 5장 뽑기', () => {
    const state = makeBattle({
      drawPile: TEN_STRIKES,
      memory: -2,
      turn: 1,
    });
    battleOf(state).evolvedThisTurn = true;
    battleOf(state).freeEvolve = true;
    const { state: next, events } = act(state, { type: 'endTurn' });
    const battle = battleOf(next);
    expect(battle.turn).toBe(2);
    expect(battle.memory).toBe(next.run?.maxMemory);
    expect(battle.evolvedThisTurn).toBe(false);
    expect(battle.freeEvolve).toBe(false);
    expect(battle.hand).toHaveLength(5);
    const types = events.map((e) => e.type);
    expect(types.indexOf('turnStarted')).toBeLessThan(types.indexOf('cardDrawn'));
  });
});

describe('뽑기 (02 3.4)', () => {
  it('뽑을 더미가 비면 버림 더미를 섞어 채운다', () => {
    const state = makeBattle({ drawPile: ['strike'], discardPile: ['guard', 'guard', 'guard'] });
    const events: GameEvent[] = [];
    drawCards(state, events, 3);
    const battle = battleOf(state);
    expect(battle.hand.map((c) => c.defId).sort()).toEqual(['guard', 'guard', 'strike']);
    expect(battle.discardPile).toHaveLength(0);
    expect(battle.drawPile).toHaveLength(1);
    expect(eventsOf(events, 'deckShuffled')).toHaveLength(1);
  });

  it('둘 다 비면 멈춘다', () => {
    const state = makeBattle({ drawPile: ['strike'] });
    drawCards(state, [], 5);
    expect(battleOf(state).hand).toHaveLength(1);
  });

  it('손패가 10장이면 뽑은 카드는 바로 버림 더미로', () => {
    const state = makeBattle({ hand: TEN_STRIKES, drawPile: ['guard', 'guard'] });
    drawCards(state, [], 2);
    const battle = battleOf(state);
    expect(battle.hand).toHaveLength(constants.HAND_LIMIT);
    expect(battle.discardPile.map((c) => c.defId)).toEqual(['guard', 'guard']);
  });
});

describe('턴 끝 (02 3.10)', () => {
  it('보존이 없는 손패는 버리고, 보존 카드는 남긴다', () => {
    // 다음 턴에 버림 더미를 다시 섞지 않도록 뽑을 카드를 넉넉히 둠
    const state = makeBattle({
      hand: ['strike', 'exhaust_flame', 'guard'],
      drawPile: ['fire_ball', 'fire_ball', 'fire_ball', 'fire_ball', 'fire_ball'],
    });
    const next = act(state, { type: 'endTurn' }).state;
    const battle = battleOf(next);
    expect(battle.discardPile.map((c) => c.defId).sort()).toEqual(['guard', 'strike']);
    expect(battle.hand.filter((c) => c.defId !== 'fire_ball').map((c) => c.defId)).toEqual([
      'exhaust_flame',
    ]);
  });

  it('플레이어 약화·취약이 1씩 줄고, 힘은 그대로', () => {
    const state = makeBattle({ statuses: { strength: 2, weak: 2, vulnerable: 1 } });
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).statuses).toEqual({ strength: 2, weak: 1, vulnerable: 0 });
  });

  it('적은 실드를 지우고 인텐트를 실행한 뒤 약화·취약이 줄어든다', () => {
    const state = makeBattle({
      enemies: ['test_attacker'],
      hp: 50,
      enemyOverrides: [{ shield: 9, statuses: { strength: 0, weak: 1, vulnerable: 2 } }],
    });
    const { state: next, events } = act(state, { type: 'endTurn' });
    const enemy = battleOf(next).enemies[0];
    expect(enemy?.shield).toBe(0);
    expect(enemy?.statuses).toEqual({ strength: 0, weak: 0, vulnerable: 1 });
    // 약화 상태의 공격 10 → floor(10 × 0.75) = 7
    expect(next.run?.hp).toBe(43);
    expect(eventsOf(events, 'enemyMoved')[0]?.moveId).toBe('hit');
  });
});
