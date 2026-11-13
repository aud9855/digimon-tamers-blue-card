// 테이머 (02 8절)
import type { TamerDef } from '../core/types';

export const tamers = [
  {
    id: 'takato',
    name: '오유민',
    line: 'guilmon',
    maxHp: 75,
    startBits: 0,
    startMaxStage: 'champion',
    startMaxMemory: 3,
    startDeck: [
      'strike',
      'strike',
      'strike',
      'strike',
      'guard',
      'guard',
      'guard',
      'guard',
      'fire_ball',
      'rock_breaker',
    ],
    // 특성 "직접 그린 카드": 강화된 일반 카드 3장 고르기
    startEffects: [{ op: 'offerCards', count: 3, upgraded: true, rarity: 'common' }],
    startChips: [],
  },
] satisfies TamerDef[];
