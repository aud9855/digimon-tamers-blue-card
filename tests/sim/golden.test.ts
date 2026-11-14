import { describe, expect, it } from 'vitest';
import { runOne } from '../../src/sim/runner';

// 골든 값: 규칙이나 수치를 일부러 바꿨을 때만, 이유를 커밋 메시지에 적고 갱신합니다 (03 8.1).
// 마지막 갱신: T2-5 (시작 칩 고르기, 동료, 형태 특성)
const GOLDEN_SEED_12345 = {
  won: true,
  battles: 14,
  finalHp: 67,
  deck: [
    'bite+',
    'bite+',
    'blue_card+',
    'charge',
    'counter_stance+',
    'defense_plugin',
    'digital_hazard+',
    'evo_resonance',
    'evo_resonance',
    'evo_resonance',
    'evo_resonance',
    'fire_ball',
    'guard',
    'guard',
    'guard',
    'guard',
    'hyper_wing+',
    'rage',
    'rage+',
    'rock_breaker',
    'speed_plugin',
    'speed_plugin',
    'strike',
    'strike',
    'strike',
    'strike',
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
