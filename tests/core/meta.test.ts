// 02 13.5 메타 진행: 해금, 시작 칩 후보, 프로필 갱신, 도감
import { describe, expect, it } from 'vitest';
import {
  applyAction,
  applyRunResult,
  createInitialState,
  createProfile,
  defaultUnlocks,
  fullUnlocks,
  recordCodex,
  type GameEvent,
  type GameState,
} from '../../src/core/index';
import { meta } from '../../src/data/index';
import { act, battleOf, makeBattle } from '../helpers/battle';

function started(state: GameState): GameState {
  return applyAction(state, { type: 'startRun', tamerId: 'takato' }).state;
}

function ended(won: boolean): GameState {
  const s = started(createInitialState(1));
  return { ...s, phase: won ? 'runWon' : 'runLost', pending: null };
}

describe('해금 정보로 판 시작 (02 13.5)', () => {
  it('처음에는 테이머 3명, 시작 칩 3개, 해저드 0', () => {
    expect(defaultUnlocks()).toEqual({
      tamers: ['takato', 'rika', 'henry'],
      startChips: ['card_reader', 'guard_chip', 'bit_scanner'],
      hazard: 0,
    });
    expect(createInitialState(1).unlocks).toEqual(defaultUnlocks());
  });

  it('열리지 않은 테이머로는 시작할 수 없다', () => {
    expect(() =>
      applyAction(createInitialState(1), { type: 'startRun', tamerId: 'ai_mako' }),
    ).toThrow();
  });

  it('시작 칩이 3개면 그대로, 무작위 수를 쓰지 않음', () => {
    const s0 = createInitialState(7);
    const s1 = started(s0);
    expect(s1.pending).toEqual({ kind: 'startChip', chipIds: meta.baseStartChips });
    expect(s1.rng.reward).toBe(s0.rng.reward);
  });

  it('시작 칩이 3개보다 많으면 reward 흐름으로 무작위 3개', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const s0 = createInitialState(seed, fullUnlocks());
      const s1 = started(s0);
      if (s1.pending?.kind !== 'startChip') throw new Error('startChip이 아님');
      expect(s1.pending.chipIds).toHaveLength(3);
      expect(new Set(s1.pending.chipIds).size).toBe(3);
      expect(s1.rng.reward).not.toBe(s0.rng.reward);
      // 같은 시드면 같은 후보
      expect(started(createInitialState(seed, fullUnlocks())).pending).toEqual(s1.pending);
      for (const id of s1.pending.chipIds) seen.add(id);
    }
    expect(seen.size).toBe(6);
  });

  it('createInitialState는 받은 해금 정보를 복사해 둠', () => {
    const unlocks = defaultUnlocks();
    const s = createInitialState(1, unlocks);
    unlocks.tamers.push('ai_mako');
    expect(s.unlocks.tamers).not.toContain('ai_mako');
  });
});

describe('프로필 갱신 applyRunResult (02 13.5)', () => {
  it('지면 판 수만 오르고 해금 없음', () => {
    const p = applyRunResult(createProfile(), ended(false), []);
    expect(p.runs.takato).toEqual({ played: 1, won: 0 });
    expect(p.unlocks).toEqual(defaultUnlocks());
  });

  it('처음 이기면 다영·진과 메모리 부스터, 이길 때마다 다음 시작 칩', () => {
    const p1 = applyRunResult(createProfile(), ended(true), []);
    expect(p1.runs.takato).toEqual({ played: 1, won: 1 });
    expect(p1.unlocks.tamers).toContain('ai_mako');
    expect(p1.unlocks.startChips).toEqual([...meta.baseStartChips, 'memory_booster']);
    const p2 = applyRunResult(p1, ended(true), []);
    expect(p2.unlocks.startChips.at(-1)).toBe('evo_charger');
    expect(p2.unlocks.tamers.filter((t) => t === 'ai_mako')).toHaveLength(1);
    const p3 = applyRunResult(p2, ended(true), []);
    const p4 = applyRunResult(p3, ended(true), []);
    expect(p4.unlocks.startChips).toEqual([...meta.baseStartChips, ...meta.startChipUnlockOrder]);
    expect(p4.runs.takato).toEqual({ played: 4, won: 4 });
  });

  it('끝나지 않은 판은 기록하지 않음, 받은 프로필은 바꾸지 않음', () => {
    const p0 = createProfile();
    const p = applyRunResult(p0, started(createInitialState(1)), []);
    expect(p.runs).toEqual({});
    applyRunResult(p0, ended(true), []);
    expect(p0).toEqual(createProfile());
  });

  it('해금된 프로필로 새 판을 시작하면 다영·진을 고를 수 있음', () => {
    const p = applyRunResult(createProfile(), ended(true), []);
    const s = applyAction(createInitialState(1, p.unlocks), {
      type: 'startRun',
      tamerId: 'ai_mako',
    }).state;
    expect(s.run?.tamerId).toBe('ai_mako');
    if (s.pending?.kind !== 'startChip') throw new Error('startChip이 아님');
    expect(s.pending.chipIds).toHaveLength(3);
  });
});

describe('도감 recordCodex (02 13.5)', () => {
  it('진화한 형태와 전투에 나온 적을 한 번씩 모음', () => {
    const events: GameEvent[] = [
      { type: 'battleStarted', encounterId: 'a1_easy_goblimon' },
      {
        type: 'evolved',
        from: 'rookie',
        to: 'champion',
        cost: 3,
        tempHpGained: 8,
        formId: 'growlmon',
      },
      {
        type: 'evolved',
        from: 'rookie',
        to: 'champion',
        cost: 3,
        tempHpGained: 8,
        formId: 'growlmon',
      },
    ];
    const p = recordCodex(createProfile(), events);
    expect(p.codex.forms).toEqual(['growlmon']);
    expect(p.codex.enemies.length).toBeGreaterThan(0);
    expect(new Set(p.codex.enemies).size).toBe(p.codex.enemies.length);
  });

  it('새로 본 것이 없으면 같은 프로필', () => {
    const p = createProfile();
    expect(recordCodex(p, [{ type: 'turnStarted', turn: 1 }])).toBe(p);
    const p1 = recordCodex(p, [
      {
        type: 'evolved',
        from: 'rookie',
        to: 'champion',
        cost: 3,
        tempHpGained: 8,
        formId: 'growlmon',
      },
    ]);
    expect(
      recordCodex(p1, [
        {
          type: 'evolved',
          from: 'rookie',
          to: 'champion',
          cost: 3,
          tempHpGained: 8,
          formId: 'growlmon',
        },
      ]),
    ).toBe(p1);
  });
});

describe('해금 시작 칩 (02 13.5)', () => {
  it('메모리 부스터: 첫 턴 메모리 +2', () => {
    const state = makeBattle({ chips: ['memory_booster'], enemies: ['goblimon'] });
    battleOf(state).turn = 0;
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).turn).toBe(1);
    expect(battleOf(next).memory).toBe((next.run?.maxMemory ?? 0) + 2);
  });

  it('진화 충전기: 첫 턴의 다음 진화 비용 0', () => {
    const state = makeBattle({ chips: ['evo_charger'], memory: 0, enemies: ['goblimon'] });
    battleOf(state).turn = 0;
    const next = act(state, { type: 'endTurn' }).state;
    expect(battleOf(next).freeEvolve).toBe(true);
  });
});
