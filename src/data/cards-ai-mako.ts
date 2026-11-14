// 다영·진 카드 풀과 임프몬 계열 필살기 (02 13.3)
import type { CardDef, Effect } from '../core/types';

const dmg = (amount: number, hits?: number): Effect =>
  hits === undefined
    ? { op: 'damage', amount, target: 'enemy' }
    : { op: 'damage', amount, hits, target: 'enemy' };
const status = (
  s: 'weak' | 'vulnerable' | 'strength',
  amount: number,
  target: 'enemy' | 'self',
): Effect => ({
  op: 'applyStatus',
  status: s,
  amount,
  target,
});

export const aiMakoCards = [
  // ── 기본 ──
  {
    id: 'bada_boom',
    name: '바다붐',
    type: 'attack',
    rarity: 'basic',
    pool: 'ai_mako',
    base: { cost: 1, effects: [dmg(4, 2)] },
    upgraded: { cost: 1, effects: [dmg(5, 2)] },
  },

  // ── 일반 ──
  {
    id: 'night_of_fire',
    name: '나이트 오브 파이어',
    type: 'attack',
    rarity: 'common',
    pool: 'ai_mako',
    base: { cost: 1, effects: [{ op: 'damage', amount: 3, hits: 3, target: 'randomEnemy' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 4, hits: 3, target: 'randomEnemy' }] },
  },
  {
    id: 'two_hands',
    name: '두 사람의 손',
    type: 'skill',
    rarity: 'common',
    pool: 'ai_mako',
    base: {
      cost: 0,
      effects: [
        { op: 'draw', count: 1 },
        { op: 'gainMemory', amount: 1 },
      ],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 0,
      effects: [
        { op: 'draw', count: 2 },
        { op: 'gainMemory', amount: 1 },
      ],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'prank',
    name: '장난',
    type: 'skill',
    rarity: 'common',
    pool: 'ai_mako',
    base: { cost: 1, effects: [status('weak', 1, 'enemy'), status('vulnerable', 1, 'enemy')] },
    upgraded: { cost: 1, effects: [status('weak', 2, 'enemy'), status('vulnerable', 2, 'enemy')] },
  },
  {
    id: 'street_fight',
    name: '골목 싸움',
    type: 'attack',
    rarity: 'common',
    pool: 'ai_mako',
    base: { cost: 1, effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(14)], else: [dmg(7)] }] },
    upgraded: { cost: 1, effects: [{ op: 'ifEvolvedThisTurn', then: [dmg(18)], else: [dmg(9)] }] },
  },
  {
    id: 'hide',
    name: '숨기',
    type: 'skill',
    rarity: 'common',
    pool: 'ai_mako',
    base: { cost: 1, effects: [{ op: 'shield', amount: 6 }] },
    upgraded: { cost: 1, effects: [{ op: 'shield', amount: 9 }] },
  },
  {
    id: 'team_up',
    name: '함께 싸우기',
    type: 'attack',
    rarity: 'common',
    pool: 'ai_mako',
    base: { cost: 1, effects: [dmg(4), { op: 'shield', amount: 4 }] },
    upgraded: { cost: 1, effects: [dmg(6), { op: 'shield', amount: 6 }] },
  },

  // ── 고급 ──
  {
    id: 'darkness_claw',
    name: '다크니스 클로',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'ai_mako',
    base: { cost: 2, effects: [dmg(9, 2)] },
    upgraded: { cost: 2, effects: [dmg(12, 2)] },
  },
  {
    id: 'reckless',
    name: '무모함',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'ai_mako',
    base: { cost: 0, effects: [status('strength', 2, 'self'), { op: 'loseHp', amount: 3 }] },
    upgraded: { cost: 0, effects: [status('strength', 3, 'self'), { op: 'loseHp', amount: 3 }] },
  },
  {
    id: 'store_power',
    name: '힘 모으기',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'ai_mako',
    base: { cost: 1, effects: [{ op: 'gainMemory', amount: 2 }], keywords: ['exhaust'] },
    upgraded: { cost: 1, effects: [{ op: 'gainMemory', amount: 3 }], keywords: ['exhaust'] },
  },
  {
    id: 'shared_dream',
    name: '같은 꿈',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'ai_mako',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'mega',
          then: [
            { op: 'draw', count: 2 },
            { op: 'gainMemory', amount: 1 },
          ],
          else: [{ op: 'draw', count: 1 }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'mega',
          then: [
            { op: 'draw', count: 3 },
            { op: 'gainMemory', amount: 1 },
          ],
          else: [{ op: 'draw', count: 2 }],
        },
      ],
    },
  },

  // ── 희귀 ──
  {
    id: 'double_impact',
    name: '더블 임팩트',
    type: 'attack',
    rarity: 'rare',
    pool: 'ai_mako',
    base: { cost: 2, effects: [dmg(10, 2)] },
    upgraded: { cost: 2, effects: [dmg(13, 2)] },
  },
  {
    id: 'fallen_wings',
    name: '타락한 날개',
    type: 'skill',
    rarity: 'rare',
    pool: 'ai_mako',
    base: {
      cost: 1,
      effects: [{ op: 'freeEvolve' }, { op: 'shield', amount: 8 }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'freeEvolve' }, { op: 'shield', amount: 12 }],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'promise',
    name: '약속',
    type: 'skill',
    rarity: 'rare',
    pool: 'ai_mako',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'mega',
          then: [status('strength', 4, 'self')],
          else: [{ op: 'gainMemory', amount: 2 }],
        },
      ],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'mega',
          then: [status('strength', 5, 'self')],
          else: [{ op: 'gainMemory', amount: 3 }],
        },
      ],
      keywords: ['exhaust'],
    },
  },

  // ── 필살기 (임프몬 계열) ──
  {
    id: 'death_slinger',
    name: '데스 슬링어',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 2,
      effects: [{ op: 'damage', amount: 10, target: 'allEnemies' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'damage', amount: 10, target: 'allEnemies' }],
      keywords: ['retain'],
    },
  },
] satisfies CardDef[];
