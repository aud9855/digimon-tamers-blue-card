import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, IllegalActionError } from '../../src/core/index';
import type { Action, GameState } from '../../src/core/index';

function roundTrip(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

describe('createInitialState', () => {
  it('국면이 title이고 런·전투·대기 중인 일이 없다', () => {
    const state = createInitialState(1);
    expect(state.phase).toBe('title');
    expect(state.seed).toBe(1);
    expect(state.run).toBeNull();
    expect(state.battle).toBeNull();
    expect(state.pending).toBeNull();
  });

  it('JSON으로 저장했다 되살려도 같다 (03 5절 약속 5)', () => {
    const state = createInitialState(1);
    expect(roundTrip(state)).toEqual(state);
  });

  it('같은 시드면 같은 상태', () => {
    expect(createInitialState(123)).toEqual(createInitialState(123));
  });

  it('정수가 아닌 시드는 예외', () => {
    expect(() => createInitialState(1.5)).toThrow(RangeError);
    expect(() => createInitialState(Number.NaN)).toThrow(RangeError);
  });
});

describe('applyAction 순수성 (03 5절 약속 1·3)', () => {
  it('할 수 없는 행동은 IllegalActionError이고 넣은 상태는 그대로', () => {
    const state = createInitialState(1);
    const snapshot = structuredClone(state);
    const actions: Action[] = [
      { type: 'endTurn' },
      { type: 'proceed' },
      { type: 'playCard', cardUid: 1 },
    ];
    for (const action of actions) {
      expect(() => applyAction(state, action)).toThrow(IllegalActionError);
      expect(state).toEqual(snapshot);
    }
  });
});
