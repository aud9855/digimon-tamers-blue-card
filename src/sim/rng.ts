// 봇 전용 시드 난수 (03 7.1). 게임의 state.rng와 섞이지 않게 따로 둡니다.
export interface SimRng {
  /** 0 이상 n 미만 정수 */
  int(n: number): number;
}

export function createSimRng(seed: number): SimRng {
  let a = (seed ^ 0x5bd1e995) >>> 0;
  return {
    int(n: number): number {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return Math.floor((((t ^ (t >>> 14)) >>> 0) / 0x100000000) * n);
    },
  };
}
