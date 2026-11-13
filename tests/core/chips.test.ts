import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startBattle } from '../../src/core/battle/start';
import { gainChip } from '../../src/core/chips';
import type { GameEvent, GameState } from '../../src/core/types';
import { constants, getChips, overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, makeBattle, play } from '../helpers/battle';
import { baseFixtures, testChips } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry({ ...baseFixtures, chips: testChips });
});
afterEach(() => restore());

const DECK = Array.from({ length: 15 }, () => 'guard');

function freshBattle(chips: string[], extra: Parameters<typeof makeBattle>[0] = {}): GameState {
  const state = makeBattle({ deck: DECK, chips, ...extra });
  state.battle = null;
  state.phase = 'map';
  startBattle(state, [], 'test_dummy_one', 'normal');
  return state;
}

describe('발동 시점 (02 5절)', () => {
  it('onBattleStart: 전투 시작 때 (실드가 첫 턴에 남음)', () => {
    const state = freshBattle(['test_on_battle_start']);
    expect(battleOf(state).shield).toBe(3);
  });

  it('onFirstTurn: 첫 턴에만', () => {
    const state = freshBattle(['test_on_first_turn']);
    expect(battleOf(state).memory).toBe(3 + 2);
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).memory).toBe(3);
  });

  it('onTurnStart: 매 턴 시작 (실드 지운 뒤에 실행)', () => {
    const state = freshBattle(['test_on_turn_start']);
    expect(battleOf(state).shield).toBe(1);
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).shield).toBe(1);
  });

  it('onEvolve: 진화할 때', () => {
    const state = freshBattle(['test_on_evolve']);
    const { state: next, events } = act(state, { type: 'evolve' });
    // 3 - 2 + 1
    expect(battleOf(next).memory).toBe(2);
    expect(eventsOf(events, 'chipTriggered').map((e) => e.chipId)).toEqual(['test_on_evolve']);
  });

  it('onCardPlayed: 카드를 낼 때마다 (카드를 옮긴 뒤)', () => {
    const state = makeBattle({ hand: ['guard', 'guard'], chips: ['test_on_card_played'] });
    const { state: next, events } = play(state, 'guard');
    expect(battleOf(next).enemies[0]?.hp).toBe(99);
    const types = events.map((e) => e.type);
    expect(types.indexOf('cardMoved')).toBeLessThan(types.indexOf('chipTriggered'));
  });

  it('여러 칩은 얻은 순서대로', () => {
    const state = makeBattle({ deck: DECK, chips: ['test_on_turn_start', 'test_on_battle_start'] });
    state.battle = null;
    const events: GameEvent[] = [];
    startBattle(state, events, 'test_dummy_one', 'normal');
    expect(eventsOf(events, 'chipTriggered').map((e) => e.chipId)).toEqual([
      'test_on_battle_start',
      'test_on_turn_start',
    ]);
  });
});

describe('수치 보정 (02 5절)', () => {
  it('evolveCostDelta: 진화 비용에 더함', () => {
    const state = freshBattle(['test_evolve_cost']);
    const next = act(state, { type: 'evolve' }).state;
    expect(battleOf(next).memory).toBe(3 - 1);
  });

  it('battleBitsBonus: 전투 보상 비트에 더함', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const plain = makeBattle({ seed, hand: ['strike'], enemyOverrides: [{ hp: 1 }] });
      const bonus = makeBattle({
        seed,
        hand: ['strike'],
        chips: ['test_bits_bonus'],
        enemyOverrides: [{ hp: 1 }],
      });
      const a = play(plain, 'strike', 0).state.run?.bits ?? 0;
      const b = play(bonus, 'strike', 0).state.run?.bits ?? 0;
      expect(b - a).toBe(7);
    }
  });

  it('handSizeBonus: 턴 시작에 뽑는 장수에 더함', () => {
    const state = freshBattle(['test_hand_size']);
    expect(battleOf(state).hand).toHaveLength(constants.HAND_SIZE + 2);
  });

  it('maxHpBonus: 얻을 때 최대 HP와 지금 HP를 함께 올림', () => {
    const state = makeBattle({ hp: 50, maxHp: 75 });
    gainChip(state, [], 'test_max_hp');
    expect(state.run?.maxHp).toBe(85);
    expect(state.run?.hp).toBe(60);
  });

  it('같은 칩은 한 번만 가질 수 있다', () => {
    const state = makeBattle({ chips: ['cube_shield'] });
    expect(() => gainChip(state, [], 'cube_shield')).toThrow();
  });
});

describe('0단계 칩 6개가 실제 전투에서 동작', () => {
  it('큐브 실드, 용기의 증표, 데이터 조각, 예비 배터리, 진화의 고동, 비트 주머니', () => {
    const realChips = getChips()
      .map((c) => c.id)
      .filter((id) => !id.startsWith('test_'));
    expect(realChips).toHaveLength(6);

    const state = freshBattle(realChips);
    const battle = battleOf(state);
    expect(battle.shield).toBe(6); // 큐브 실드
    expect(battle.statuses.strength).toBe(1); // 용기의 증표
    expect(battle.hand).toHaveLength(constants.HAND_SIZE + 1); // 데이터 조각
    expect(battle.memory).toBe(3 + 1); // 예비 배터리

    const evolved = act(state, { type: 'evolve' }).state;
    expect(battleOf(evolved).shield).toBe(6 + 5); // 진화의 고동

    const killable = makeBattle({
      seed: 3,
      hand: ['strike'],
      chips: ['bit_pouch'],
      enemyOverrides: [{ hp: 1 }],
    });
    const plain = makeBattle({ seed: 3, hand: ['strike'], enemyOverrides: [{ hp: 1 }] });
    const withPouch = play(killable, 'strike', 0).state.run?.bits ?? 0;
    const without = play(plain, 'strike', 0).state.run?.bits ?? 0;
    expect(withPouch - without).toBe(5); // 비트 주머니
  });
});
