import { describe, expect, it } from 'vitest';
import { runOne } from '../../src/sim/runner';

// 골든 값: 규칙이나 수치를 일부러 바꿨을 때만, 이유를 커밋 메시지에 적고 갱신합니다 (03 8.1).
// 마지막 갱신: T2-2 (막 3개, 2·3막 콘텐츠)
const GOLDEN_SEED_12345 = {
  won: false,
  battles: 8,
  finalHp: -11,
  deck: [
    'bite',
    'bite+',
    'blue_card',
    'charge',
    'digital_hazard',
    'fire_ball',
    'guard',
    'guard',
    'guard',
    'guard',
    'hyper_wing',
    'rock_breaker',
    'speed_plugin',
    'strike',
    'strike',
    'strike',
    'strike',
    'sweep',
    'sweep',
    'sweep+',
  ],
};

describe('골든 (03 8절)', () => {
  it('시드 12345 greedy 판의 요약이 저장된 값과 같다', () => {
    const record = runOne(12345, { policy: 'greedy', tamerId: 'takato', evolve: 'asap' });
    const run = record.finalState.run;
    expect({
      won: record.won,
      battles: record.battles.length,
      finalHp: run?.hp,
      deck: run?.deck.map((c) => (c.upgraded ? `${c.defId}+` : c.defId)).sort(),
    }).toEqual(GOLDEN_SEED_12345);
  });
});
