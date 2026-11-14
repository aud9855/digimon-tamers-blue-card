// 시드 난수 (03 5.1). mulberry32: 32비트 정수 상태 하나로 도는 공개 도메인 알고리즘.
// 아래 16진수는 알고리즘 자체의 상수이고 게임 규칙 수치가 아닙니다.
import type { GameState, RngStream } from './types';

const STREAM_KEYS: Record<RngStream, number> = { map: 1, battle: 2, reward: 3, event: 4 };
const GOLDEN_RATIO_32 = 0x9e3779b9;
const UINT32_RANGE = 0x100000000;

// 줄기마다 다른 초기값: (seed + k × 0x9E3779B9) >>> 0
export function initialRngState(seed: number): Record<RngStream, number> {
  const init = (k: number) => (seed + k * GOLDEN_RATIO_32) >>> 0;
  return {
    map: init(STREAM_KEYS.map),
    battle: init(STREAM_KEYS.battle),
    reward: init(STREAM_KEYS.reward),
    event: init(STREAM_KEYS.event),
  };
}

// mulberry32 한 걸음: 다음 상태와 [0, 1) 실수를 돌려줌
function step(current: number): { next: number; value: number } {
  const next = (current + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { next: next >>> 0, value: ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE };
}

/** 0 이상 n 미만의 정수. state.rng[stream]을 갱신합니다. */
export function nextInt(state: GameState, stream: RngStream, n: number): number {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError(`nextInt: n은 양의 정수여야 합니다 (받은 값: ${n})`);
  }
  const { next, value } = step(state.rng[stream]);
  state.rng[stream] = next;
  return Math.floor(value * n);
}

/** 섞은 새 배열을 돌려줍니다 (받은 배열은 그대로). Fisher–Yates. */
export function shuffle<T>(state: GameState, stream: RngStream, items: readonly T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = nextInt(state, stream, i + 1);
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

/** 가중치에 비례해 하나를 고릅니다. 가중치 0인 항목은 뽑히지 않습니다. */
export function weightedPick<T>(
  state: GameState,
  stream: RngStream,
  entries: readonly { item: T; weight: number }[],
): T {
  let total = 0;
  for (const e of entries) {
    if (!Number.isInteger(e.weight) || e.weight < 0) {
      throw new RangeError(`weightedPick: 가중치는 0 이상의 정수여야 합니다 (${e.weight})`);
    }
    total += e.weight;
  }
  if (total === 0) throw new RangeError('weightedPick: 가중치 합이 0입니다');
  let roll = nextInt(state, stream, total);
  for (const e of entries) {
    if (roll < e.weight) return e.item;
    roll -= e.weight;
  }
  // 위 반복문에서 반드시 돌려주므로 여기에 오지 않습니다.
  throw new Error('weightedPick: 도달할 수 없는 지점');
}
