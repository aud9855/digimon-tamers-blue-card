// 곽소룡 카드 풀과 테리어몬 계열 필살기 (02 12.8)
import type { CardDef, Effect } from '../core/types';

const dmg = (amount: number, hits?: number): Effect =>
  hits === undefined
    ? { op: 'damage', amount, target: 'enemy' }
    : { op: 'damage', amount, hits, target: 'enemy' };
const shield = (amount: number): Effect => ({ op: 'shield', amount });

export const henryCards = [
  // ── 기본 ──
  {
    id: 'bunny_blast',
    name: '버니 블래스트',
    type: 'attack',
    rarity: 'basic',
    pool: 'henry',
    base: { cost: 1, effects: [dmg(3, 2)] },
    upgraded: { cost: 1, effects: [dmg(4, 2)] },
  },

  // ── 일반 ──
  {
    id: 'terrier_tornado',
    name: '테리어 토네이도',
    type: 'attack',
    rarity: 'common',
    pool: 'henry',
    base: { cost: 1, effects: [dmg(2, 4)] },
    upgraded: { cost: 1, effects: [dmg(3, 4)] },
  },
  {
    id: 'calm_guard',
    name: '침착한 방어',
    type: 'skill',
    rarity: 'common',
    pool: 'henry',
    base: { cost: 1, effects: [shield(7)] },
    upgraded: { cost: 1, effects: [shield(10)] },
  },
  {
    id: 'analyze',
    name: '분석',
    type: 'skill',
    rarity: 'common',
    pool: 'henry',
    base: {
      cost: 1,
      effects: [
        { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' },
        { op: 'draw', count: 1 },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'applyStatus', status: 'vulnerable', amount: 3, target: 'enemy' },
        { op: 'draw', count: 1 },
      ],
    },
  },
  {
    id: 'burst_fire',
    name: '연사',
    type: 'attack',
    rarity: 'common',
    pool: 'henry',
    base: { cost: 1, effects: [{ op: 'damage', amount: 2, hits: 4, target: 'randomEnemy' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 2, hits: 6, target: 'randomEnemy' }] },
  },
  {
    id: 'shield_rush',
    name: '실드 돌진',
    type: 'attack',
    rarity: 'common',
    pool: 'henry',
    base: { cost: 2, effects: [dmg(9), shield(9)] },
    upgraded: { cost: 2, effects: [dmg(12), shield(12)] },
  },
  {
    id: 'kung_fu',
    name: '쿵푸',
    type: 'attack',
    rarity: 'common',
    pool: 'henry',
    base: {
      cost: 1,
      effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(4, 4)], else: [dmg(4, 2)] }],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(5, 4)], else: [dmg(5, 2)] }],
    },
  },

  // ── 고급 ──
  {
    id: 'gatling',
    name: '개틀링 어택',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'henry',
    base: { cost: 2, effects: [dmg(3, 5)] },
    upgraded: { cost: 2, effects: [dmg(4, 5)] },
  },
  {
    id: 'fortify',
    name: '진지 구축',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'henry',
    base: { cost: 2, effects: [shield(15)] },
    upgraded: { cost: 2, effects: [shield(20)] },
  },
  {
    id: 'counter_fire',
    name: '반격 사격',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'henry',
    base: { cost: 1, effects: [shield(6), { op: 'damage', amount: 3, target: 'allEnemies' }] },
    upgraded: { cost: 1, effects: [shield(8), { op: 'damage', amount: 4, target: 'allEnemies' }] },
  },
  {
    id: 'data_scan',
    name: '데이터 분석',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'henry',
    base: {
      cost: 0,
      effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 1, target: 'allEnemies' }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 0,
      effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'allEnemies' }],
      keywords: ['exhaust'],
    },
  },

  // ── 희귀 ──
  {
    id: 'miracle_missile',
    name: '미라클 미사일',
    type: 'attack',
    rarity: 'rare',
    pool: 'henry',
    base: { cost: 3, effects: [dmg(6, 4)] },
    upgraded: { cost: 3, effects: [dmg(8, 4)] },
  },
  {
    id: 'unshaken',
    name: '흔들림 없는 마음',
    type: 'skill',
    rarity: 'rare',
    pool: 'henry',
    base: {
      cost: 1,
      effects: [shield(10), { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 1,
      effects: [shield(14), { op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'partner_bond',
    name: '파트너의 유대',
    type: 'skill',
    rarity: 'rare',
    pool: 'henry',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [shield(8), { op: 'draw', count: 2 }],
          else: [{ op: 'draw', count: 2 }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [shield(12), { op: 'draw', count: 3 }],
          else: [{ op: 'draw', count: 3 }],
        },
      ],
    },
  },

  // ── 필살기 (테리어몬 계열) ──
  {
    id: 'gargo_laser',
    name: '가고 레이저',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 1, effects: [dmg(3, 4)], keywords: ['retain'] },
    upgraded: { cost: 1, effects: [dmg(3, 4)], keywords: ['retain'] },
  },
  {
    id: 'rapid_fire',
    name: '래피드 파이어',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 2,
      effects: [{ op: 'damage', amount: 5, hits: 5, target: 'randomEnemy' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'damage', amount: 5, hits: 5, target: 'randomEnemy' }],
      keywords: ['retain'],
    },
  },
  {
    id: 'mega_barrage',
    name: '메가 바라지',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 3, effects: [dmg(15, 2), shield(10)], keywords: ['retain'] },
    upgraded: { cost: 3, effects: [dmg(15, 2), shield(10)], keywords: ['retain'] },
  },
] satisfies CardDef[];
