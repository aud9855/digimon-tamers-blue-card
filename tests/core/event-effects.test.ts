// 이벤트의 새 런 효과 (02 14.2)
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLegalActions } from '../../src/core/engine';
import { enterEvent } from '../../src/core/run/event';
import type { EventDef, GameState, RunEffect } from '../../src/core/types';
import { overrideRegistry } from '../../src/data/index';
import { act, eventsOf, startedRun } from '../helpers/battle';

const event = (id: string, effects: RunEffect[]): EventDef => ({
  id,
  acts: [99],
  title: id,
  text: id,
  choices: [{ label: '고른다', effects }],
});

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry({
    events: [
      event('t_max_up', [{ op: 'changeMaxHp', amount: 6 }]),
      event('t_max_down', [{ op: 'changeMaxHp', amount: -30 }]),
      event('t_max_floor', [{ op: 'changeMaxHp', amount: -999 }]),
      event('t_remove', [{ op: 'removeCard' }]),
      event('t_upgrade', [{ op: 'loseHp', amount: 3 }, { op: 'upgradeCard' }]),
      event('t_lose_then_pick', [{ op: 'loseHp', amount: 999 }, { op: 'removeCard' }]),
    ],
  });
});
afterEach(() => restore());

/** 지도 국면에서 이벤트에 들어간 상태 */
function inEvent(id: string, seed = 1): GameState {
  let state = startedRun(seed, 'rika');
  if (state.phase !== 'map') throw new Error(`지도가 아님: ${state.phase}`);
  state = structuredClone(state);
  enterEvent(state, [], id);
  return state;
}

describe('changeMaxHp (02 14.2)', () => {
  it('늘면 HP도 같은 만큼 늘어남', () => {
    const state = inEvent('t_max_up');
    const { maxHp = 0, hp = 0 } = state.run ?? {};
    const { state: next, events } = act(state, { type: 'eventChoose', index: 0 });
    expect(next.run?.maxHp).toBe(maxHp + 6);
    expect(next.run?.hp).toBe(hp + 6);
    expect(eventsOf(events, 'maxHpChanged')).toHaveLength(1);
    expect(next.phase).toBe('map');
  });

  it('줄면 HP가 새 최대를 넘지 않게 깎이고, 1 아래로는 안 감 (패배 없음)', () => {
    const down = act(inEvent('t_max_down'), { type: 'eventChoose', index: 0 }).state;
    expect(down.run?.hp).toBe(down.run?.maxHp);
    const floor = act(inEvent('t_max_floor'), { type: 'eventChoose', index: 0 }).state;
    expect(floor.run?.maxHp).toBe(1);
    expect(floor.run?.hp).toBe(1);
    expect(floor.phase).toBe('map');
  });
});

describe('removeCard·upgradeCard (02 14.2)', () => {
  it('지우기: 고르기 국면 → 고른 카드가 덱에서 빠지고 지도로', () => {
    const state = inEvent('t_remove');
    const deckSize = state.run?.deck.length ?? 0;
    const picking = act(state, { type: 'eventChoose', index: 0 }).state;
    expect(picking.phase).toBe('event');
    expect(picking.pending).toEqual({ kind: 'eventCard', mode: 'remove' });
    const legal = getLegalActions(picking);
    expect(legal).toHaveLength(deckSize);
    expect(legal.every((a) => a.type === 'eventPickCard')).toBe(true);
    const target = picking.run?.deck[0]?.uid ?? -1;
    const done = act(picking, { type: 'eventPickCard', cardUid: target }).state;
    expect(done.run?.deck).toHaveLength(deckSize - 1);
    expect(done.run?.deck.some((c) => c.uid === target)).toBe(false);
    // 상점의 지우기 횟수에는 들어가지 않음
    expect(done.run?.removalsBought).toBe(0);
    expect(done.phase).toBe('map');
    expect(done.pending).toBeNull();
  });

  it('강화: 앞의 효과를 먼저 처리하고, 강화할 수 있는 카드만 고름', () => {
    const state = inEvent('t_upgrade');
    const hp = state.run?.hp ?? 0;
    const picking = act(state, { type: 'eventChoose', index: 0 }).state;
    expect(picking.run?.hp).toBe(hp - 3);
    const legal = getLegalActions(picking);
    const first = legal[0];
    if (first?.type !== 'eventPickCard') throw new Error('고르기 행동이 아님');
    const done = act(picking, first).state;
    expect(done.run?.deck.find((c) => c.uid === first.cardUid)?.upgraded).toBe(true);
    expect(done.phase).toBe('map');
  });

  it('강화할 카드가 없으면 아무 일 없이 지도로', () => {
    const state = inEvent('t_upgrade');
    for (const c of state.run?.deck ?? []) c.upgraded = true;
    const next = act(state, { type: 'eventChoose', index: 0 }).state;
    expect(next.phase).toBe('map');
    expect(next.pending).toBeNull();
  });

  it('앞의 효과로 패배하면 고르기 국면이 되지 않음', () => {
    const next = act(inEvent('t_lose_then_pick'), { type: 'eventChoose', index: 0 }).state;
    expect(next.phase).toBe('runLost');
  });

  it('고르기 중에는 다른 행동이 목록 밖 (예외)', () => {
    const picking = act(inEvent('t_remove'), { type: 'eventChoose', index: 0 }).state;
    expect(() => act(picking, { type: 'eventChoose', index: 0 })).toThrow();
    expect(() => act(picking, { type: 'eventPickCard', cardUid: 99999 })).toThrow();
  });
});
