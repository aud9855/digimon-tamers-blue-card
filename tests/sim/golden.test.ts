import { describe, expect, it } from 'vitest';
import { runOne } from '../../src/sim/runner';

// 골든 값: 규칙이나 수치를 일부러 바꿨을 때만, 이유를 커밋 메시지에 적고 갱신합니다 (03 8.1).
// 마지막 갱신: 2026-11-20 확장 1차(02 14절): 적 반응 행동, 이벤트 12개와 새 효과(최대 HP, 카드 지우기·강화)
const GOLDEN_SEED_12345 = {
  won: true,
  battles: 17,
  finalHp: 75,
  deck: [
    'attack_plugin',
    'bite',
    'bite',
    'blue_card',
    'blue_card+',
    'digital_hazard',
    'evo_resonance',
    'fire_ball',
    'guard',
    'guard',
    'guard',
    'guard',
    'heavy_strike',
    'heavy_strike',
    'juri+',
    'rage',
    'rage+',
    'rampage_scar',
    'rock_breaker',
    'rock_breaker',
    'rock_breaker+',
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
