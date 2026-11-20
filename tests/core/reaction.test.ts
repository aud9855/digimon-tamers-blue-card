// 적의 반응 행동 (02 14.1)
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { EnemyDef, GameState } from '../../src/core/types';
import { describeIntent } from '../../src/core/describe';
import { overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

const DRAW = Array.from({ length: 30 }, () => 'guard');

const move = (id: string) => ({ id, name: id, effects: [] });
/** 순환 a → b → c, 반응 목록은 테스트마다 */
function reactor(
  id: string,
  reactions: EnemyDef['reactions'],
  phases?: EnemyDef['phases'],
): EnemyDef {
  return {
    id,
    name: id,
    tier: 'elite',
    attribute: 'none',
    maxHp: 100,
    moves: [move('a'), move('b'), move('c'), move('rage'), move('finish'), move('enter')],
    phases: phases ?? [{ cycle: ['a', 'b', 'c'] }],
    reactions,
  };
}

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry({
    ...baseFixtures,
    enemies: [
      ...(baseFixtures.enemies ?? []),
      reactor('r_stage', [{ when: { partnerStageAtLeast: 'champion' }, move: 'rage' }]),
      reactor('r_alone', [{ when: { alone: true }, move: 'rage' }]),
      reactor('r_hp', [{ when: { playerHpAtMostPct: 0.5 }, move: 'finish' }]),
      reactor('r_two', [
        { when: { playerHpAtMostPct: 0.5 }, move: 'finish' },
        { when: { partnerStageAtLeast: 'champion' }, move: 'rage' },
      ]),
      reactor(
        'r_phase',
        [{ when: { playerHpAtMostPct: 0.99 }, move: 'finish' }],
        [
          { untilHpPct: 0.5, cycle: ['a', 'b'] },
          { onEnter: 'enter', cycle: ['c'] },
        ],
      ),
    ],
  });
});
afterEach(() => restore());

function endTurns(state: GameState, n: number): { state: GameState; moves: string[] } {
  let s = state;
  const moves: string[] = [];
  for (let i = 0; i < n; i++) {
    const result = act(s, { type: 'endTurn' });
    s = result.state;
    moves.push(...eventsOf(result.events, 'enemyMoved').map((e) => e.moveId));
  }
  return { state: s, moves };
}

describe('반응 행동 (02 14.1)', () => {
  it('조건이 맞으면 끼어들고, 순환은 멈췄다가 원래 차례로 이어짐. 전투당 한 번', () => {
    const state = makeBattle({ enemies: ['r_stage'], stage: 'champion', drawPile: DRAW });
    // 첫 인텐트는 반응을 보지 않음 (3.2)
    expect(battleOf(state).enemies[0]?.intentMoveId).toBe('a');
    const { moves, state: last } = endTurns(state, 5);
    expect(moves).toEqual(['a', 'rage', 'b', 'c', 'a']);
    expect(battleOf(last).enemies[0]?.usedReactions).toEqual([0]);
  });

  it('조건이 맞지 않으면 순환 그대로', () => {
    const state = makeBattle({ enemies: ['r_stage'], stage: 'rookie', drawPile: DRAW });
    expect(endTurns(state, 4).moves).toEqual(['a', 'b', 'c', 'a']);
  });

  it('혼자 남으면: 다른 적이 살아 있으면 안 됨', () => {
    const two = makeBattle({ enemies: ['r_alone', 'test_dummy'], drawPile: DRAW });
    expect(endTurns(two, 3).moves.filter((m) => m !== 'idle')).toEqual(['a', 'b', 'c']);
    const alone = makeBattle({
      enemies: ['r_alone', 'test_dummy'],
      enemyOverrides: [{}, { alive: false, hp: 0 }],
      drawPile: DRAW,
    });
    expect(endTurns(alone, 3).moves).toEqual(['a', 'rage', 'b']);
  });

  it('플레이어 HP 비율 이하', () => {
    const high = makeBattle({ enemies: ['r_hp'], hp: 51, maxHp: 100, drawPile: DRAW });
    expect(endTurns(high, 2).moves).toEqual(['a', 'b']);
    const low = makeBattle({ enemies: ['r_hp'], hp: 50, maxHp: 100, drawPile: DRAW });
    expect(endTurns(low, 3).moves).toEqual(['a', 'finish', 'b']);
  });

  it('여러 반응은 적힌 순서대로, 쓴 것은 건너뜀', () => {
    const state = makeBattle({
      enemies: ['r_two'],
      hp: 40,
      maxHp: 100,
      stage: 'champion',
      drawPile: DRAW,
    });
    expect(endTurns(state, 5).moves).toEqual(['a', 'finish', 'rage', 'b', 'c']);
  });

  it('페이즈가 바뀐 때는 반응을 보지 않음', () => {
    const state = makeBattle({
      enemies: ['r_phase'],
      hp: 50,
      maxHp: 100,
      enemyOverrides: [{ hp: 40 }],
      drawPile: DRAW,
    });
    // 첫 행동 뒤 페이즈 전환 → onEnter, 그다음에 반응
    expect(endTurns(state, 4).moves).toEqual(['a', 'enter', 'finish', 'c']);
  });

  it('반응 인텐트는 화면에 반응이라고 알려 줌', () => {
    const state = makeBattle({ enemies: ['r_stage'], stage: 'champion', drawPile: DRAW });
    expect(describeIntent(state, 0).reaction).toBeUndefined();
    const next = act(state, { type: 'endTurn' }).state;
    expect(describeIntent(next, 0).reaction).toBe(true);
    const after = act(next, { type: 'endTurn' }).state;
    expect(describeIntent(after, 0).reaction).toBeUndefined();
  });
});
