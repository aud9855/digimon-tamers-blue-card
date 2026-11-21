// 이재익 카드 풀과 모노드라몬 계열 필살기 (02 15.2)
import type { CardDef, Effect } from '../core/types';

const dmg = (amount: number, hits?: number): Effect =>
  hits === undefined
    ? { op: 'damage', amount, target: 'enemy' }
    : { op: 'damage', amount, hits, target: 'enemy' };
const shield = (amount: number): Effect => ({ op: 'shield', amount });
const draw = (count: number): Effect => ({ op: 'draw', count });
const memory = (amount: number): Effect => ({ op: 'gainMemory', amount });
const strength = (amount: number): Effect => ({
  op: 'applyStatus',
  status: 'strength',
  amount,
  target: 'self',
});

export const ryoCards = [
  // ── 기본 ──
  {
    id: 'beat_knuckle',
    name: '비트 너클',
    type: 'attack',
    rarity: 'basic',
    pool: 'ryo',
    base: { cost: 1, effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(8)], else: [dmg(5)] }] },
    upgraded: { cost: 1, effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(11)], else: [dmg(7)] }] },
  },
  {
    id: 'veteran_read',
    name: '노련한 수읽기',
    type: 'skill',
    rarity: 'basic',
    pool: 'ryo',
    base: { cost: 1, effects: [shield(5), draw(1)] },
    upgraded: { cost: 1, effects: [shield(7), draw(1)] },
  },

  // ── 일반 ──
  {
    id: 'strike_claw',
    name: '스트라이크 클로',
    type: 'attack',
    rarity: 'common',
    pool: 'ryo',
    base: { cost: 1, effects: [dmg(3, 2), draw(1)] },
    upgraded: { cost: 1, effects: [dmg(4, 2), draw(1)] },
  },
  {
    id: 'chain_evolve',
    name: '연속 진화',
    type: 'skill',
    rarity: 'common',
    pool: 'ryo',
    base: {
      cost: 0,
      effects: [{ op: 'ifEvolvedThisTurn', then: [memory(2)], else: [memory(1)] }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 0,
      effects: [{ op: 'ifEvolvedThisTurn', then: [memory(3)], else: [memory(1)] }],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'cyber_nail',
    name: '사이버 네일',
    type: 'attack',
    rarity: 'common',
    pool: 'ryo',
    base: {
      cost: 1,
      effects: [{ op: 'ifStage', min: 'ultimate', then: [dmg(10)], else: [dmg(6)] }],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'ifStage', min: 'ultimate', then: [dmg(13)], else: [dmg(8)] }],
    },
  },
  {
    id: 'wild_rush',
    name: '거친 돌격',
    type: 'attack',
    rarity: 'common',
    pool: 'ryo',
    base: { cost: 1, effects: [dmg(9), { op: 'loseHp', amount: 2 }] },
    upgraded: { cost: 1, effects: [dmg(12), { op: 'loseHp', amount: 2 }] },
  },
  {
    id: 'old_deck',
    name: '손에 익은 덱',
    type: 'skill',
    rarity: 'common',
    pool: 'ryo',
    base: { cost: 1, effects: [draw(2)] },
    upgraded: { cost: 1, effects: [draw(3)] },
  },
  {
    id: 'guard_claw',
    name: '막고 할퀴기',
    type: 'attack',
    rarity: 'common',
    pool: 'ryo',
    base: { cost: 1, effects: [dmg(5), shield(5)] },
    upgraded: { cost: 1, effects: [dmg(7), shield(7)] },
  },
  {
    id: 'tamer_sense',
    name: '테이머의 감',
    type: 'skill',
    rarity: 'common',
    pool: 'ryo',
    base: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' }],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 3, target: 'enemy' }],
    },
  },

  // ── 고급 ──
  {
    id: 'erase_claw',
    name: '이레이즈 클로',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'ryo',
    base: { cost: 2, effects: [{ op: 'damage', amount: 7, target: 'allEnemies' }] },
    upgraded: { cost: 2, effects: [{ op: 'damage', amount: 10, target: 'allEnemies' }] },
  },
  {
    id: 'calm_rage',
    name: '분노 다스리기',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'ryo',
    base: { cost: 1, effects: [strength(2), shield(4)] },
    upgraded: { cost: 1, effects: [strength(3), shield(6)] },
  },
  {
    // 강화하면 비용만 0이 되는 같은 카드
    id: 'evolve_drive',
    name: '진화 드라이브',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'ryo',
    base: { cost: 1, effects: [{ op: 'freeEvolve' }], keywords: ['exhaust'] },
    upgraded: { cost: 0, effects: [{ op: 'freeEvolve' }], keywords: ['exhaust'] },
  },
  {
    id: 'legend_combo',
    name: '전설의 연타',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'ryo',
    base: {
      cost: 2,
      effects: [{ op: 'ifPlayedThisTurn', min: 2, then: [dmg(4, 4)], else: [dmg(4, 2)] }],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'ifPlayedThisTurn', min: 2, then: [dmg(5, 4)], else: [dmg(5, 2)] }],
    },
  },

  // ── 희귀 ──
  {
    id: 'full_matrix',
    name: '풀 매트릭스',
    type: 'skill',
    rarity: 'rare',
    pool: 'ryo',
    base: {
      cost: 1,
      effects: [{ op: 'ifStage', min: 'mega', then: [strength(4), draw(2)], else: [memory(3)] }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'ifStage', min: 'mega', then: [strength(5), draw(2)], else: [memory(4)] }],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'justice_heart',
    name: '정의의 마음',
    type: 'skill',
    rarity: 'rare',
    pool: 'ryo',
    base: { cost: 1, effects: [shield(12), { op: 'ifStage', min: 'mega', then: [strength(2)] }] },
    upgraded: {
      cost: 1,
      effects: [shield(16), { op: 'ifStage', min: 'mega', then: [strength(3)] }],
    },
  },
  {
    id: 'legend_strike',
    name: '전설의 일격',
    type: 'attack',
    rarity: 'rare',
    pool: 'ryo',
    base: { cost: 3, effects: [{ op: 'ifStage', min: 'mega', then: [dmg(30)], else: [dmg(18)] }] },
    upgraded: {
      cost: 3,
      effects: [{ op: 'ifStage', min: 'mega', then: [dmg(38)], else: [dmg(24)] }],
    },
  },

  // ── 필살기 (모노드라몬 계열) ──
  {
    id: 'strike_fang',
    name: '스트라이크 팽',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 1, effects: [dmg(4, 2)], keywords: ['retain'] },
    upgraded: { cost: 1, effects: [dmg(4, 2)], keywords: ['retain'] },
  },
  {
    id: 'desolation_claw',
    name: '디솔레이션 클로',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 2, effects: [dmg(8, 2)], keywords: ['retain'] },
    upgraded: { cost: 2, effects: [dmg(8, 2)], keywords: ['retain'] },
  },
  {
    id: 'justice_kick',
    name: '저스티스 킥',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 2, effects: [dmg(22), shield(8)], keywords: ['retain'] },
    upgraded: { cost: 2, effects: [dmg(22), shield(8)], keywords: ['retain'] },
  },
] satisfies CardDef[];
