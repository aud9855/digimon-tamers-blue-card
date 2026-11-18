// 엔딩 장면(02 13.10)과 판 전체 칸 수
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { describeEnding, totalNodesVisited } from '../../src/core/index';
import { startNextAct } from '../../src/core/run/act';
import type { GameEvent } from '../../src/core/types';
import { constants, getTamers, overrideRegistry } from '../../src/data/index';
import { makeBattle } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry({ ...baseFixtures });
});
afterEach(() => restore());

describe('엔딩 장면 (02 13.10)', () => {
  it('이긴 판에서만, 테이머마다 2~3줄', () => {
    for (const tamer of getTamers()) {
      const state = makeBattle({});
      state.run!.tamerId = tamer.id;
      expect(describeEnding(state)).toBeNull();
      state.phase = 'runWon';
      const lines = describeEnding(state);
      expect(lines?.length).toBeGreaterThanOrEqual(2);
      expect(lines?.length).toBeLessThanOrEqual(3);
      state.phase = 'runLost';
      expect(describeEnding(state)).toBeNull();
    }
  });
});

describe('판 전체 칸 수', () => {
  it('막을 넘어가도 지난 막 칸 수가 쌓임', () => {
    const state = makeBattle({});
    const run = state.run!;
    run.path = Array.from({ length: constants.MAP_ROWS + 1 }, (_, i) => `n${i}`);
    expect(totalNodesVisited(state)).toBe(8);
    const events: GameEvent[] = [];
    startNextAct(state, events);
    expect(run.path).toEqual([]);
    run.path = ['a', 'b'];
    expect(totalNodesVisited(state)).toBe(10);
  });
});
