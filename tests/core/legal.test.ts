import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyAction,
  describeCard,
  describeChip,
  describeIntent,
  getLegalActions,
  IllegalActionError,
  previewEvolveCost,
} from '../../src/core/index';
import { enterEvent, enterTreasure } from '../../src/core/run/event';
import { enterRest } from '../../src/core/run/rest';
import { enterShop } from '../../src/core/run/shop';
import { createInitialState } from '../../src/core/state';
import type { Action, Effect, GameState } from '../../src/core/types';
import { getCards, getChips, overrideRegistry } from '../../src/data/index';
import { battleOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

function mapState(seed = 1): GameState {
  const s = applyAction(createInitialState(seed), { type: 'startRun', tamerId: 'takato' }).state;
  return applyAction(s, { type: 'skipCards' }).state;
}

/** 모든 종류의 행동 견본 (목록 밖 행동 확인용) */
function probeActions(state: GameState): Action[] {
  const uids = [
    ...(state.run?.deck ?? []).map((c) => c.uid),
    ...(state.battle?.hand ?? []).map((c) => c.uid),
    9999,
  ];
  const actions: Action[] = [
    { type: 'startRun', tamerId: 'takato' },
    { type: 'startRun', tamerId: 'rika' },
    { type: 'chooseNode', nodeId: 'nowhere' },
    ...(state.run?.map.nodes ?? []).map((n) => ({ type: 'chooseNode' as const, nodeId: n.id })),
    { type: 'evolve' },
    { type: 'endTurn' },
    { type: 'skipCards' },
    { type: 'restHeal' },
    { type: 'proceed' },
  ];
  for (const i of [-1, 0, 1, 2, 3, 4, 5]) {
    actions.push(
      { type: 'pickCard', index: i },
      { type: 'shopBuyCard', index: i },
      { type: 'shopBuyChip', index: i },
      { type: 'eventChoose', index: i },
    );
  }
  for (const uid of uids) {
    actions.push(
      { type: 'playCard', cardUid: uid },
      { type: 'playCard', cardUid: uid, targetIndex: 0 },
      { type: 'playCard', cardUid: uid, targetIndex: 1 },
      { type: 'shopRemoveCard', cardUid: uid },
      { type: 'restUpgrade', cardUid: uid },
    );
  }
  return actions;
}

function sameAction(a: Action, b: Action): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** 목록에 없는 행동은 모두 예외이고 상태가 안 바뀜 */
function expectOnlyLegal(state: GameState): void {
  const legal = getLegalActions(state);
  const snapshot = structuredClone(state);
  for (const action of probeActions(state)) {
    if (legal.some((l) => sameAction(l, action))) continue;
    expect(() => applyAction(state, action), JSON.stringify(action)).toThrow(IllegalActionError);
    expect(state).toEqual(snapshot);
  }
  for (const action of legal) {
    expect(() => applyAction(state, action), JSON.stringify(action)).not.toThrow();
    expect(state).toEqual(snapshot);
  }
}

describe('국면마다 할 수 있는 행동 (02 2절, 03 5.2)', () => {
  it('title: startRun (테이머마다)', () => {
    const state = createInitialState(1);
    expect(getLegalActions(state)).toEqual([{ type: 'startRun', tamerId: 'takato' }]);
    expectOnlyLegal(state);
  });

  it('reward: 카드마다 pickCard, 그리고 skipCards', () => {
    const state = applyAction(createInitialState(1), {
      type: 'startRun',
      tamerId: 'takato',
    }).state;
    expect(getLegalActions(state)).toEqual([
      { type: 'pickCard', index: 0 },
      { type: 'pickCard', index: 1 },
      { type: 'pickCard', index: 2 },
      { type: 'skipCards' },
    ]);
    expectOnlyLegal(state);
  });

  it('map: 고를 수 있는 칸마다 chooseNode', () => {
    const state = mapState();
    expect(getLegalActions(state).every((a) => a.type === 'chooseNode')).toBe(true);
    expectOnlyLegal(state);
  });

  it('battle: 낼 수 있는 카드마다(대상이 필요하면 살아 있는 적마다), evolve, endTurn', () => {
    const state = makeBattle({
      hand: ['strike', 'guard', 'bug_data'],
      enemies: ['test_dummy', 'test_dummy'],
    });
    const [strike, guard] = battleOf(state).hand;
    expect(getLegalActions(state)).toEqual([
      { type: 'playCard', cardUid: strike?.uid, targetIndex: 0 },
      { type: 'playCard', cardUid: strike?.uid, targetIndex: 1 },
      { type: 'playCard', cardUid: guard?.uid },
      { type: 'evolve' },
      { type: 'endTurn' },
    ]);
    expectOnlyLegal(state);
  });

  it('shop: 살 수 있는 것, 지울 카드마다, proceed', () => {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.bits = 100;
    enterShop(state, []);
    const legal = getLegalActions(state);
    expect(legal.filter((a) => a.type === 'shopRemoveCard')).toHaveLength(state.run.deck.length);
    expect(legal.at(-1)).toEqual({ type: 'proceed' });
    expectOnlyLegal(state);
  });

  it('rest: restHeal과 강화할 수 있는 카드마다 restUpgrade', () => {
    const state = mapState();
    enterRest(state, []);
    const legal = getLegalActions(state);
    expect(legal[0]).toEqual({ type: 'restHeal' });
    expect(legal.filter((a) => a.type === 'restUpgrade')).toHaveLength(10);
    expectOnlyLegal(state);
  });

  it('event: 선택지마다 eventChoose', () => {
    const state = mapState();
    enterEvent(state, [], 'calumon_play');
    expect(getLegalActions(state)).toEqual([
      { type: 'eventChoose', index: 0 },
      { type: 'eventChoose', index: 1 },
    ]);
    expectOnlyLegal(state);
  });

  it('treasure·actClear: proceed', () => {
    const state = mapState();
    enterTreasure(state, []);
    expect(getLegalActions(state)).toEqual([{ type: 'proceed' }]);
    expectOnlyLegal(state);
  });

  it('runWon·runLost: 없음', () => {
    const lost = makeBattle({ hand: ['digital_hazard'], hp: 1 });
    const uid = battleOf(lost).hand[0]?.uid ?? -1;
    const after = applyAction(lost, { type: 'playCard', cardUid: uid, targetIndex: 0 }).state;
    expect(after.phase).toBe('runLost');
    expect(getLegalActions(after)).toEqual([]);
    expectOnlyLegal(after);
  });
});

describe('무작위로 100판 (예외 없음)', () => {
  it('할 수 있는 행동 중 무작위로 골라 끝까지', () => {
    restore();
    restore = () => {};
    let seed = 99;
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % n;
    };
    for (let game = 1; game <= 100; game++) {
      let state = createInitialState(game);
      let steps = 0;
      while (steps < 5000) {
        const legal = getLegalActions(state);
        if (legal.length === 0) break;
        const nonEnd = legal.filter((a) => a.type !== 'endTurn');
        const pool = nonEnd.length > 0 ? nonEnd : legal;
        const action = pool[rand(pool.length)];
        if (!action) break;
        state = applyAction(state, action).state;
        steps++;
      }
      expect(['runWon', 'runLost']).toContain(state.phase);
    }
  });
});

describe('설명 글 (03 5.3)', () => {
  it('모든 카드·칩의 설명이 빈 글이 아님', () => {
    for (const card of getCards()) {
      expect(describeCard(card.id, false).length).toBeGreaterThan(0);
      expect(describeCard(card.id, true).length).toBeGreaterThan(0);
    }
    for (const chip of getChips()) expect(describeChip(chip.id).length).toBeGreaterThan(0);
  });

  it('효과 op마다 문장 틀이 있다', () => {
    const all: Effect[] = [
      { op: 'damage', amount: 3, target: 'enemy' },
      { op: 'damage', amount: 3, hits: 2, target: 'allEnemies' },
      { op: 'damage', amount: 3, target: 'randomEnemy' },
      { op: 'shield', amount: 1 },
      { op: 'draw', count: 1 },
      { op: 'gainMemory', amount: 1 },
      { op: 'heal', amount: 1 },
      { op: 'loseHp', amount: 1 },
      { op: 'applyStatus', status: 'weak', amount: 1, target: 'self' },
      { op: 'freeEvolve' },
      { op: 'addCard', cardId: 'bug_data', to: 'draw', count: 1 },
      { op: 'ifStage', min: 'champion', then: [{ op: 'draw', count: 1 }] },
      { op: 'ifEvolvedThisTurn', then: [{ op: 'draw', count: 1 }] },
    ];
    const r = overrideRegistry({
      cards: [
        {
          id: 'test_all_ops',
          name: '시험',
          type: 'skill',
          rarity: 'common',
          pool: 'none',
          base: { cost: 0, effects: all },
          upgraded: { cost: 0, effects: all },
        },
      ],
    });
    try {
      const text = describeCard('test_all_ops', false);
      expect(text.split('.').filter((s) => s.trim()).length).toBe(all.length);
      expect(text).not.toContain('undefined');
    } finally {
      r();
    }
  });

  it('ctx를 주면 지금 전투 값(형태 공격력, 힘, 속성)을 반영한 피해', () => {
    const state = makeBattle({
      enemies: ['allomon'],
      stage: 'champion',
      statuses: { strength: 2 },
    });
    // (6 + 1 + 2) × 1.5 = 13
    expect(describeCard('strike', false, { state, targetIndex: 0 })).toBe('피해 13.');
    expect(describeCard('strike', false)).toBe('피해 6.');
  });

  it('describeIntent: 종류·피해량·횟수', () => {
    const state = makeBattle({ enemies: ['harpymon', 'allomon', 'thunderbirdmon', 'icedevimon'] });
    expect(describeIntent(state, 0)).toMatchObject({ kind: 'attack', damage: 4, hits: 3 });
    battleOf(state).enemies[1]!.intentMoveId = 'brace';
    expect(describeIntent(state, 1)).toEqual({ moveId: 'brace', name: '버티기', kind: 'defend' });
    battleOf(state).enemies[2]!.intentMoveId = 'static';
    expect(describeIntent(state, 2).kind).toBe('debuff');
    battleOf(state).enemies[3]!.intentMoveId = 'ice_wall';
    expect(describeIntent(state, 3).kind).toBe('mixed');
    battleOf(state).enemies[3]!.intentMoveId = 'frost_breath';
    expect(describeIntent(state, 3)).toMatchObject({ kind: 'mixed', damage: 6, hits: 1 });
  });

  it('previewEvolveCost: 지금 진화 비용, 못 하면 null', () => {
    expect(previewEvolveCost(makeBattle({ memory: 3 }))).toBe(3);
    expect(previewEvolveCost(makeBattle({ stage: 'champion' }))).toBeNull();
    expect(previewEvolveCost(createInitialState(1))).toBeNull();
  });
});
