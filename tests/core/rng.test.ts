import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../src/core/state';
import { initialRngState, nextInt, shuffle, weightedPick } from '../../src/core/rng';
import type { RngStream } from '../../src/core/types';

const STREAMS: RngStream[] = ['map', 'battle', 'reward', 'event'];

function sequence(seed: number, stream: RngStream, count: number, n = 1000): number[] {
  const state = createInitialState(seed);
  return Array.from({ length: count }, () => nextInt(state, stream, n));
}

describe('rng 초기값 (03 5.1)', () => {
  it('(seed + k × 0x9E3779B9) >>> 0, k는 map 1 · battle 2 · reward 3 · event 4', () => {
    const rng = initialRngState(7);
    expect(rng.map).toBe((7 + 1 * 0x9e3779b9) >>> 0);
    expect(rng.battle).toBe((7 + 2 * 0x9e3779b9) >>> 0);
    expect(rng.reward).toBe((7 + 3 * 0x9e3779b9) >>> 0);
    expect(rng.event).toBe((7 + 4 * 0x9e3779b9) >>> 0);
  });

  it('줄기 4개의 초기값이 서로 다르다', () => {
    const rng = initialRngState(1);
    expect(new Set(Object.values(rng)).size).toBe(4);
  });
});

describe('nextInt', () => {
  it('같은 시드면 같은 수열', () => {
    for (const stream of STREAMS) {
      expect(sequence(42, stream, 50)).toEqual(sequence(42, stream, 50));
    }
  });

  it('다른 시드면 다른 수열', () => {
    expect(sequence(1, 'map', 20)).not.toEqual(sequence(2, 'map', 20));
  });

  it('한 줄기를 써도 다른 줄기 값이 바뀌지 않는다', () => {
    const state = createInitialState(99);
    const before = { ...state.rng };
    for (let i = 0; i < 100; i++) nextInt(state, 'battle', 10);
    expect(state.rng.battle).not.toBe(before.battle);
    expect(state.rng.map).toBe(before.map);
    expect(state.rng.reward).toBe(before.reward);
    expect(state.rng.event).toBe(before.event);

    // 다른 줄기를 쓴 뒤에도 map 수열은 처음부터 쓴 것과 같다
    const fromMap = Array.from({ length: 20 }, () => nextInt(state, 'map', 1000));
    expect(fromMap).toEqual(sequence(99, 'map', 20));
  });

  it('0 이상 n 미만의 정수이고 모든 값이 나온다', () => {
    const state = createInitialState(3);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = nextInt(state, 'reward', 7);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
      seen.add(v);
    }
    expect(seen.size).toBe(7);
  });

  it('n이 양의 정수가 아니면 예외', () => {
    const state = createInitialState(1);
    expect(() => nextInt(state, 'map', 0)).toThrow(RangeError);
    expect(() => nextInt(state, 'map', -1)).toThrow(RangeError);
    expect(() => nextInt(state, 'map', 1.5)).toThrow(RangeError);
  });

  it('상태는 JSON으로 저장했다 되살려도 이어지는 수열이 같다', () => {
    const state = createInitialState(5);
    nextInt(state, 'event', 10);
    const restored = JSON.parse(JSON.stringify(state)) as typeof state;
    const a = Array.from({ length: 10 }, () => nextInt(state, 'event', 100));
    const b = Array.from({ length: 10 }, () => nextInt(restored, 'event', 100));
    expect(a).toEqual(b);
  });
});

describe('shuffle', () => {
  const items = Array.from({ length: 20 }, (_, i) => i);

  it('같은 원소를 모두 담은 새 배열이고 받은 배열은 그대로', () => {
    const state = createInitialState(1);
    const copy = items.slice();
    const result = shuffle(state, 'battle', items);
    expect(result).not.toBe(items);
    expect(items).toEqual(copy);
    expect(result.slice().sort((a, b) => a - b)).toEqual(items);
  });

  it('같은 시드면 같은 순서, 다른 시드면 다른 순서', () => {
    const a = shuffle(createInitialState(10), 'battle', items);
    const b = shuffle(createInitialState(10), 'battle', items);
    const c = shuffle(createInitialState(11), 'battle', items);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('지정한 줄기만 갱신한다', () => {
    const state = createInitialState(1);
    const before = { ...state.rng };
    shuffle(state, 'battle', items);
    expect(state.rng.battle).not.toBe(before.battle);
    expect({ ...state.rng, battle: before.battle }).toEqual(before);
  });

  it('빈 배열과 한 칸 배열', () => {
    const state = createInitialState(1);
    expect(shuffle(state, 'battle', [])).toEqual([]);
    expect(shuffle(state, 'battle', ['a'])).toEqual(['a']);
  });
});

describe('weightedPick', () => {
  it('가중치 0인 항목은 뽑히지 않는다', () => {
    const state = createInitialState(1);
    const entries = [
      { item: 'a', weight: 0 },
      { item: 'b', weight: 3 },
      { item: 'c', weight: 0 },
      { item: 'd', weight: 1 },
    ];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    for (let i = 0; i < 4000; i++) {
      const picked = weightedPick(state, 'reward', entries);
      counts[picked] = (counts[picked] ?? 0) + 1;
    }
    expect(counts.a).toBe(0);
    expect(counts.c).toBe(0);
    // 3:1 비율에 가깝다 (넉넉한 범위)
    expect(counts.b).toBeGreaterThan(2700);
    expect(counts.b).toBeLessThan(3300);
  });

  it('같은 시드면 같은 결과', () => {
    const entries = [
      { item: 1, weight: 1 },
      { item: 2, weight: 1 },
      { item: 3, weight: 1 },
    ];
    const pick = (seed: number) => {
      const s = createInitialState(seed);
      return Array.from({ length: 20 }, () => weightedPick(s, 'reward', entries));
    };
    expect(pick(8)).toEqual(pick(8));
  });

  it('가중치 합이 0이거나 음수·소수 가중치면 예외', () => {
    const state = createInitialState(1);
    expect(() => weightedPick(state, 'reward', [{ item: 'a', weight: 0 }])).toThrow(RangeError);
    expect(() => weightedPick(state, 'reward', [])).toThrow(RangeError);
    expect(() => weightedPick(state, 'reward', [{ item: 'a', weight: -1 }])).toThrow(RangeError);
    expect(() => weightedPick(state, 'reward', [{ item: 'a', weight: 0.5 }])).toThrow(RangeError);
  });
});
