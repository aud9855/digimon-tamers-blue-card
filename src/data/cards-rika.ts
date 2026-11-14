// 은세나 카드 풀과 레나몬 계열 필살기 (02 12.8)
import type { CardDef, Effect } from '../core/types';

const dmg = (amount: number, hits?: number): Effect =>
  hits === undefined
    ? { op: 'damage', amount, target: 'enemy' }
    : { op: 'damage', amount, hits, target: 'enemy' };
const randomDmg = (amount: number, hits: number): Effect => ({
  op: 'damage',
  amount,
  hits,
  target: 'randomEnemy',
});
const allDmg = (amount: number, hits?: number): Effect =>
  hits === undefined
    ? { op: 'damage', amount, target: 'allEnemies' }
    : { op: 'damage', amount, hits, target: 'allEnemies' };

export const rikaCards = [
  // ── 기본 ──
  {
    id: 'diamond_storm',
    name: '다이아몬드 스톰',
    type: 'attack',
    rarity: 'basic',
    pool: 'rika',
    base: { cost: 1, effects: [randomDmg(3, 3)] },
    upgraded: { cost: 1, effects: [randomDmg(4, 3)] },
  },

  // ── 일반 ──
  {
    id: 'card_slash',
    name: '카드 슬래시',
    type: 'attack',
    rarity: 'common',
    pool: 'rika',
    base: { cost: 0, effects: [dmg(4), { op: 'draw', count: 1 }] },
    upgraded: { cost: 0, effects: [dmg(6), { op: 'draw', count: 1 }] },
  },
  {
    id: 'quick_draw',
    name: '빠른 손놀림',
    type: 'skill',
    rarity: 'common',
    pool: 'rika',
    base: { cost: 0, effects: [{ op: 'draw', count: 2 }], keywords: ['exhaust'] },
    upgraded: { cost: 0, effects: [{ op: 'draw', count: 3 }], keywords: ['exhaust'] },
  },
  {
    id: 'roundhouse',
    name: '돌려차기',
    type: 'attack',
    rarity: 'common',
    pool: 'rika',
    base: { cost: 1, effects: [dmg(6), { op: 'ifPlayedThisTurn', min: 2, then: [dmg(6)] }] },
    upgraded: { cost: 1, effects: [dmg(8), { op: 'ifPlayedThisTurn', min: 2, then: [dmg(8)] }] },
  },
  {
    id: 'fox_leaf',
    name: '여우잎 실드',
    type: 'skill',
    rarity: 'common',
    pool: 'rika',
    base: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 4 },
        { op: 'ifPlayedThisTurn', min: 1, then: [{ op: 'shield', amount: 4 }] },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 6 },
        { op: 'ifPlayedThisTurn', min: 1, then: [{ op: 'shield', amount: 6 }] },
      ],
    },
  },
  {
    id: 'feint',
    name: '허초',
    type: 'skill',
    rarity: 'common',
    pool: 'rika',
    base: {
      cost: 0,
      effects: [{ op: 'applyStatus', status: 'weak', amount: 1, target: 'enemy' }],
    },
    upgraded: {
      cost: 0,
      effects: [{ op: 'applyStatus', status: 'weak', amount: 2, target: 'enemy' }],
    },
  },
  {
    id: 'triple_thrust',
    name: '연속 찌르기',
    type: 'attack',
    rarity: 'common',
    pool: 'rika',
    base: { cost: 1, effects: [dmg(2, 3)] },
    upgraded: { cost: 1, effects: [dmg(3, 3)] },
  },

  // ── 고급 ──
  {
    id: 'combo_charge',
    name: '카드 콤보',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'rika',
    base: {
      cost: 1,
      effects: [
        { op: 'gainMemory', amount: 1 },
        { op: 'draw', count: 1 },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'gainMemory', amount: 1 },
        { op: 'draw', count: 2 },
      ],
    },
  },
  {
    id: 'fox_fire',
    name: '여우불',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'rika',
    base: { cost: 2, effects: [allDmg(6, 2)] },
    upgraded: { cost: 2, effects: [allDmg(8, 2)] },
  },
  {
    id: 'focus',
    name: '집중',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'rika',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifPlayedThisTurn',
          min: 3,
          then: [{ op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
          else: [{ op: 'applyStatus', status: 'strength', amount: 1, target: 'self' }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifPlayedThisTurn',
          min: 3,
          then: [{ op: 'applyStatus', status: 'strength', amount: 4, target: 'self' }],
          else: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
        },
      ],
    },
  },
  {
    id: 'mirror_guard',
    name: '거울 막',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'rika',
    base: { cost: 1, effects: [{ op: 'shield', amount: 8 }] },
    upgraded: { cost: 1, effects: [{ op: 'shield', amount: 11 }] },
  },

  // ── 희귀 ──
  {
    id: 'card_storm',
    name: '카드 폭풍',
    type: 'attack',
    rarity: 'rare',
    pool: 'rika',
    base: { cost: 1, effects: [randomDmg(3, 5)] },
    upgraded: { cost: 1, effects: [randomDmg(4, 5)] },
  },
  {
    id: 'perfect_hand',
    name: '완벽한 손패',
    type: 'skill',
    rarity: 'rare',
    pool: 'rika',
    base: {
      cost: 0,
      effects: [
        { op: 'draw', count: 3 },
        { op: 'gainMemory', amount: 1 },
      ],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 0,
      effects: [
        { op: 'draw', count: 4 },
        { op: 'gainMemory', amount: 1 },
      ],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'queens_pride',
    name: '여왕의 자존심',
    type: 'skill',
    rarity: 'rare',
    pool: 'rika',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [
            { op: 'gainMemory', amount: 2 },
            { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
          ],
          else: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
        },
      ],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [
            { op: 'gainMemory', amount: 2 },
            { op: 'applyStatus', status: 'strength', amount: 3, target: 'self' },
          ],
          else: [{ op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
        },
      ],
      keywords: ['exhaust'],
    },
  },

  // ── 필살기 (레나몬 계열) ──
  {
    id: 'fox_tail_inferno',
    name: '호염룡',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 1, effects: [allDmg(8)], keywords: ['retain'] },
    upgraded: { cost: 1, effects: [allDmg(8)], keywords: ['retain'] },
  },
  {
    id: 'talisman_of_light',
    name: '빛의 부적',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 2, effects: [allDmg(6, 2), { op: 'shield', amount: 6 }], keywords: ['retain'] },
    upgraded: {
      cost: 2,
      effects: [allDmg(6, 2), { op: 'shield', amount: 6 }],
      keywords: ['retain'],
    },
  },
  {
    id: 'amethyst_wind',
    name: '자수정 바람',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: { cost: 2, effects: [allDmg(10, 2)], keywords: ['retain'] },
    upgraded: { cost: 2, effects: [allDmg(10, 2)], keywords: ['retain'] },
  },
] satisfies CardDef[];
