import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { GameState } from '../../src/core/types';
import { overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

const DRAW = Array.from({ length: 30 }, () => 'guard');

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

describe('순환 (02 3.10.1)', () => {
  it('처음부터 반복: 고부리몬 공격 → 공격 → 힘 +2 → 공격', () => {
    const state = makeBattle({ enemies: ['goblimon'], hp: 999, maxHp: 999, drawPile: DRAW });
    const { moves } = endTurns(state, 4);
    expect(moves).toEqual(['club', 'club', 'warcry', 'club']);
  });

  it('인텐트 이벤트로 다음 행동을 알린다', () => {
    const state = makeBattle({ enemies: ['allomon'], hp: 999, maxHp: 999, drawPile: DRAW });
    const { events, state: next } = act(state, { type: 'endTurn' });
    expect(eventsOf(events, 'enemyIntent')[0]?.moveId).toBe('brace');
    expect(battleOf(next).enemies[0]?.intentMoveId).toBe('brace');
  });

  it('행동 효과: 이빌몬은 버그 데이터 임시 카드를 버림 더미에 넣는다', () => {
    const state = makeBattle({ enemies: ['vilemon'], hp: 999, maxHp: 999, drawPile: DRAW });
    const next = act(state, { type: 'endTurn' }).state;
    const bug = battleOf(next).discardPile.find((c) => c.defId === 'bug_data');
    expect(bug?.temp).toBe(true);
    expect(next.run?.deck.some((c) => c.defId === 'bug_data')).toBe(false);
  });
});

describe('페이즈 (미히라몬)', () => {
  it('HP 50% 이하면 다음 인텐트를 정할 때 페이즈 2로, 포효를 한 번만, 그다음은 공격 18', () => {
    const state = makeBattle({
      enemies: ['mihiramon'],
      hp: 999,
      maxHp: 999,
      drawPile: DRAW,
      enemyOverrides: [{ hp: 60 }], // 120의 50%
    });
    const r1 = act(state, { type: 'endTurn' });
    // 페이즈 1 첫 행동(덮치기)을 먼저 하고, 다음 인텐트를 정할 때 바뀜
    expect(eventsOf(r1.events, 'enemyMoved')[0]?.moveId).toBe('pounce');
    expect(eventsOf(r1.events, 'enemyPhaseChanged')[0]?.phaseIndex).toBe(1);
    const enemy = battleOf(r1.state).enemies[0];
    expect(enemy?.intentMoveId).toBe('roar');
    expect(enemy?.cycleIndex).toBe(-1);

    const { moves, state: last } = endTurns(r1.state, 3);
    expect(moves).toEqual(['roar', 'rampage', 'fang_flurry']);
    expect(battleOf(last).enemies[0]?.intentMoveId).toBe('rampage');
  });

  it('포효 뒤의 날뛰기는 공격 18 (1 hit)', () => {
    const state = makeBattle({
      enemies: ['mihiramon'],
      hp: 999,
      maxHp: 999,
      drawPile: DRAW,
      enemyOverrides: [{ phaseIndex: 1, cycleIndex: -1, intentMoveId: 'roar' }],
    });
    const afterRoar = act(state, { type: 'endTurn' }).state;
    const hpBefore = afterRoar.run?.hp ?? 0;
    const { events } = act(afterRoar, { type: 'endTurn' });
    const hits = eventsOf(events, 'damage').filter((e) => e.target === 'player');
    expect(hits).toHaveLength(1);
    // 포효의 취약 2가 플레이어에게 남아 있음 → floor(18 × 1.5) = 27
    expect(hits[0]?.amount).toBe(27);
    expect(hpBefore).toBeGreaterThan(0);
  });

  it('HP가 50%보다 크면 페이즈가 바뀌지 않는다', () => {
    const state = makeBattle({
      enemies: ['mihiramon'],
      hp: 999,
      maxHp: 999,
      drawPile: DRAW,
      enemyOverrides: [{ hp: 61 }],
    });
    const { moves, state: next } = endTurns(state, 4);
    expect(moves).toEqual(['pounce', 'claw_flurry', 'crouch', 'pounce']);
    expect(battleOf(next).enemies[0]?.phaseIndex).toBe(0);
  });

  it('플레이어 턴 도중에 HP가 내려가도 이미 보여 준 인텐트를 먼저 실행한다', () => {
    const state = makeBattle({
      enemies: ['mihiramon'],
      hp: 999,
      maxHp: 999,
      hand: ['heavy_strike'],
      drawPile: DRAW,
      enemyOverrides: [{ hp: 70 }],
    });
    // 강타 14 → 56 (50% 이하). 인텐트는 그대로 덮치기
    const hit = act(state, {
      type: 'playCard',
      cardUid: battleOf(state).hand[0]?.uid ?? -1,
      targetIndex: 0,
    });
    expect(battleOf(hit.state).enemies[0]?.intentMoveId).toBe('pounce');
    const { events } = act(hit.state, { type: 'endTurn' });
    expect(eventsOf(events, 'enemyMoved')[0]?.moveId).toBe('pounce');
    expect(eventsOf(events, 'enemyIntent')[0]?.moveId).toBe('roar');
  });
});
