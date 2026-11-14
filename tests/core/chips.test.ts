import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { playerHitDamage } from '../../src/core/battle/damage';
import { startBattle } from '../../src/core/battle/start';
import { applyAction, getLegalActions } from '../../src/core/engine';
import { previewEvolveCost } from '../../src/core/describe';
import { createInitialState } from '../../src/core/state';
import { gainChip } from '../../src/core/chips';
import type { GameEvent, GameState } from '../../src/core/types';
import { constants, getChips, getTamer, overrideRegistry } from '../../src/data/index';
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
    // 3 - 3 + 1
    expect(battleOf(next).memory).toBe(1);
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
    expect(battleOf(next).memory).toBe(3 - (3 - 1));
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
      .filter((id) => {
        const chip = getChips().find((c) => c.id === id);
        return !id.startsWith('test_') && !chip?.hidden && !chip?.start;
      });
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

describe('곽소룡 특성 침착함 (02 12.3)', () => {
  it('매 턴 시작에 실드 +2 (실드를 지운 뒤)', () => {
    const state = makeBattle({ deck: DECK, chips: ['trait_calm'] });
    state.battle = null;
    startBattle(state, [], 'test_dummy_one', 'normal');
    expect(battleOf(state).shield).toBe(2);
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).shield).toBe(2);
  });
});

describe('동료 카드 (02 12.6)', () => {
  it('내면 동료 자리에 놓이고 버림 더미로 가지 않음', () => {
    const state = makeBattle({ hand: ['kenta'] });
    const next = play(state, 'kenta').state;
    expect(battleOf(next).companions.map((c) => c.defId)).toEqual(['kenta']);
    expect(battleOf(next).discardPile).toHaveLength(0);
  });

  it('동료 자리가 2개 차면 동료 카드를 낼 수 없음', () => {
    const state = makeBattle({ hand: ['juri'], companions: ['kenta', 'kazu'] });
    const uid = battleOf(state).hand[0]?.uid ?? -1;
    expect(getLegalActions(state).some((a) => a.type === 'playCard' && a.cardUid === uid)).toBe(
      false,
    );
  });

  it('턴 시작에 칩 다음으로 동료가 발동', () => {
    const state = makeBattle({
      deck: DECK,
      chips: ['test_on_turn_start'],
      companions: ['kenta', 'juri'],
      hp: 50,
    });
    const { state: next, events } = act(state, { type: 'endTurn' });
    expect(battleOf(next).shield).toBe(1 + 3);
    expect(next.run?.hp).toBe(52);
    const order = events
      .filter((e) => e.type === 'chipTriggered' || e.type === 'companionTriggered')
      .map((e) => e.type);
    expect(order).toEqual(['chipTriggered', 'companionTriggered', 'companionTriggered']);
  });

  it('낸 순간에는 발동하지 않음', () => {
    const state = makeBattle({ hand: ['kenta'] });
    const { events } = play(state, 'kenta');
    expect(events.some((e) => e.type === 'companionTriggered')).toBe(false);
  });

  it('동글몬: 동료 자리에 있는 동안 진화 비용 -1', () => {
    const state = makeBattle({ hand: ['calumon'], memory: 3 });
    expect(previewEvolveCost(state)).toBe(3);
    const next = play(state, 'calumon').state;
    expect(previewEvolveCost(next)).toBe(2 - 0);
  });

  it('강재호: 턴 시작에 무작위 적에게 피해', () => {
    const state = makeBattle({ deck: DECK, companions: ['kazu'] });
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).enemies[0]?.hp).toBe(97);
  });

  it('전투가 끝나면 동료 자리는 사라지고 카드는 덱에 그대로', () => {
    const state = makeBattle({
      hand: ['kenta', 'strike'],
      deck: ['kenta', 'strike'],
      enemyOverrides: [{ hp: 1 }],
    });
    const s1 = play(state, 'kenta').state;
    const s2 = play(s1, 'strike', 0).state;
    expect(s2.battle).toBeNull();
    expect(s2.run?.deck.map((c) => c.defId)).toEqual(['kenta', 'strike']);
  });
});

describe('형태 특성 (02 12.5)', () => {
  it('단단한 몸: 그 단계로 진화할 때 임시 HP +6', () => {
    const state = makeBattle({ formTraits: { champion: 'tough' } });
    const next = act(state, { type: 'evolve' }).state;
    expect(battleOf(next).tempHp).toBe(5 + 6);
  });

  it('날카로운 이빨: 그 단계 형태의 공격력 +1', () => {
    const plain = makeBattle({ stage: 'champion' });
    const sharp = makeBattle({ stage: 'champion', formTraits: { champion: 'sharp' } });
    expect(playerHitDamage(sharp, 6, 0).damage - playerHitDamage(plain, 6, 0).damage).toBe(1);
    // 다른 단계에는 적용 안 됨
    const rookie = makeBattle({ formTraits: { champion: 'sharp' } });
    expect(playerHitDamage(rookie, 6, 0).damage).toBe(6);
  });
});

describe('시작 디아크 (02 12.7)', () => {
  it('startRun 뒤 시작 칩 3개 중 하나를 고르고, 그다음 테이머 특성', () => {
    const s0 = applyAction(createInitialState(1), { type: 'startRun', tamerId: 'takato' }).state;
    expect(s0.phase).toBe('startChip');
    expect(getLegalActions(s0)).toEqual(
      [0, 1, 2].map((index) => ({ type: 'chooseStartChip', index })),
    );
    const s1 = applyAction(s0, { type: 'chooseStartChip', index: 2 }).state;
    expect(s1.run?.chips).toContain('bit_scanner');
    expect(s1.run?.maxHp).toBe(getTamer('takato').maxHp + 5);
    expect(s1.phase).toBe('reward');
  });

  it('특성 카드 고르기가 없는 테이머는 바로 지도', () => {
    const s0 = applyAction(createInitialState(1), { type: 'startRun', tamerId: 'henry' }).state;
    const s1 = applyAction(s0, { type: 'chooseStartChip', index: 0 }).state;
    expect(s1.phase).toBe('map');
    expect(s1.run?.chips).toEqual(['trait_calm', 'card_reader']);
  });
});
