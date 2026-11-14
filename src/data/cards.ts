// 카드 (02 9.2, 12.8). 공용(neutral)과 테이머별 풀, 필살기, 저주.
import type { CardDef } from '../core/types';

export const cards = [
  // ── 기본 ──
  {
    id: 'strike',
    name: '타격',
    type: 'attack',
    rarity: 'basic',
    pool: 'neutral',
    base: { cost: 1, effects: [{ op: 'damage', amount: 6, target: 'enemy' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 9, target: 'enemy' }] },
  },
  {
    id: 'guard',
    name: '방어',
    type: 'skill',
    rarity: 'basic',
    pool: 'neutral',
    base: { cost: 1, effects: [{ op: 'shield', amount: 5 }] },
    upgraded: { cost: 1, effects: [{ op: 'shield', amount: 8 }] },
  },
  {
    id: 'fire_ball',
    name: '파이어 볼',
    type: 'attack',
    rarity: 'basic',
    pool: 'takato',
    base: { cost: 1, effects: [{ op: 'damage', amount: 8, target: 'enemy' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 11, target: 'enemy' }] },
  },

  // ── 일반 ──
  {
    id: 'rock_breaker',
    name: '록 브레이커',
    type: 'attack',
    rarity: 'common',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [{ op: 'damage', amount: 10, target: 'enemy' }],
          else: [{ op: 'damage', amount: 6, target: 'enemy' }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [{ op: 'damage', amount: 13, target: 'enemy' }],
          else: [{ op: 'damage', amount: 8, target: 'enemy' }],
        },
      ],
    },
  },
  {
    id: 'attack_plugin',
    name: '공격 플러그인',
    type: 'skill',
    rarity: 'common',
    pool: 'neutral',
    base: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
    },
  },
  {
    id: 'defense_plugin',
    name: '방어 플러그인',
    type: 'skill',
    rarity: 'common',
    pool: 'neutral',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [{ op: 'shield', amount: 11 }],
          else: [{ op: 'shield', amount: 7 }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [{ op: 'shield', amount: 14 }],
          else: [{ op: 'shield', amount: 9 }],
        },
      ],
    },
  },
  {
    id: 'speed_plugin',
    name: '고속 플러그인',
    type: 'skill',
    rarity: 'common',
    pool: 'neutral',
    base: { cost: 1, effects: [{ op: 'draw', count: 2 }] },
    upgraded: { cost: 1, effects: [{ op: 'draw', count: 3 }] },
  },
  {
    id: 'double_strike',
    name: '연속 공격',
    type: 'attack',
    rarity: 'common',
    pool: 'takato',
    base: { cost: 1, effects: [{ op: 'damage', amount: 4, hits: 2, target: 'enemy' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 5, hits: 2, target: 'enemy' }] },
  },
  {
    id: 'heavy_strike',
    name: '강타',
    type: 'attack',
    rarity: 'common',
    pool: 'takato',
    base: { cost: 2, effects: [{ op: 'damage', amount: 14, target: 'enemy' }] },
    upgraded: { cost: 2, effects: [{ op: 'damage', amount: 18, target: 'enemy' }] },
  },
  {
    id: 'bite',
    name: '물어뜯기',
    type: 'attack',
    rarity: 'common',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        { op: 'damage', amount: 7, target: 'enemy' },
        { op: 'applyStatus', status: 'vulnerable', amount: 1, target: 'enemy' },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'damage', amount: 8, target: 'enemy' },
        { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' },
      ],
    },
  },
  {
    id: 'intimidate',
    name: '위협',
    type: 'skill',
    rarity: 'common',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'weak', amount: 1, target: 'allEnemies' }],
    },
    upgraded: {
      cost: 1,
      effects: [{ op: 'applyStatus', status: 'weak', amount: 2, target: 'allEnemies' }],
    },
  },
  {
    id: 'tackle',
    name: '몸통박치기',
    type: 'attack',
    rarity: 'common',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        { op: 'damage', amount: 5, target: 'enemy' },
        { op: 'shield', amount: 5 },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'damage', amount: 7, target: 'enemy' },
        { op: 'shield', amount: 7 },
      ],
    },
  },

  // ── 고급 ──
  {
    id: 'hyper_wing',
    name: '하이퍼 윙',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 6 },
        { op: 'draw', count: 1 },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 9 },
        { op: 'draw', count: 1 },
      ],
    },
  },
  {
    id: 'charge',
    name: '기 모으기',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'neutral',
    base: { cost: 0, effects: [{ op: 'gainMemory', amount: 2 }], keywords: ['exhaust'] },
    upgraded: { cost: 0, effects: [{ op: 'gainMemory', amount: 3 }], keywords: ['exhaust'] },
  },
  {
    id: 'recovery_floppy',
    name: '회복 플로피',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'neutral',
    base: { cost: 1, effects: [{ op: 'heal', amount: 6 }], keywords: ['exhaust'] },
    upgraded: { cost: 1, effects: [{ op: 'heal', amount: 9 }], keywords: ['exhaust'] },
  },
  {
    id: 'rage',
    name: '분노',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifEvolvedThisTurn',
          then: [{ op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
          else: [{ op: 'applyStatus', status: 'strength', amount: 1, target: 'self' }],
        },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        {
          op: 'ifEvolvedThisTurn',
          then: [{ op: 'applyStatus', status: 'strength', amount: 4, target: 'self' }],
          else: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
        },
      ],
    },
  },
  {
    id: 'sweep',
    name: '휩쓸기',
    type: 'attack',
    rarity: 'uncommon',
    pool: 'takato',
    base: { cost: 1, effects: [{ op: 'damage', amount: 5, target: 'allEnemies' }] },
    upgraded: { cost: 1, effects: [{ op: 'damage', amount: 8, target: 'allEnemies' }] },
  },
  {
    id: 'counter_stance',
    name: '받아치기',
    type: 'skill',
    rarity: 'uncommon',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 7 },
        { op: 'applyStatus', status: 'weak', amount: 1, target: 'enemy' },
      ],
    },
    upgraded: {
      cost: 1,
      effects: [
        { op: 'shield', amount: 9 },
        { op: 'applyStatus', status: 'weak', amount: 2, target: 'enemy' },
      ],
    },
  },

  // ── 희귀 ──
  {
    id: 'blue_card',
    name: '블루 카드',
    type: 'skill',
    rarity: 'rare',
    pool: 'takato',
    base: {
      cost: 0,
      effects: [{ op: 'freeEvolve' }, { op: 'draw', count: 1 }],
      keywords: ['exhaust'],
    },
    upgraded: {
      cost: 0,
      effects: [{ op: 'freeEvolve' }, { op: 'draw', count: 2 }],
      keywords: ['exhaust'],
    },
  },
  {
    id: 'digital_hazard',
    name: '디지털 해저드',
    type: 'attack',
    rarity: 'rare',
    pool: 'takato',
    base: {
      cost: 2,
      effects: [
        { op: 'damage', amount: 20, target: 'enemy' },
        { op: 'loseHp', amount: 4 },
      ],
    },
    upgraded: {
      cost: 2,
      effects: [
        { op: 'damage', amount: 26, target: 'enemy' },
        { op: 'loseHp', amount: 4 },
      ],
    },
  },
  {
    id: 'evo_resonance',
    name: '진화의 공명',
    type: 'skill',
    rarity: 'rare',
    pool: 'takato',
    base: {
      cost: 1,
      effects: [
        {
          op: 'ifStage',
          min: 'champion',
          then: [
            { op: 'gainMemory', amount: 2 },
            { op: 'draw', count: 1 },
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
          min: 'champion',
          then: [
            { op: 'gainMemory', amount: 2 },
            { op: 'draw', count: 2 },
          ],
          else: [{ op: 'draw', count: 2 }],
        },
      ],
    },
  },

  // ── 동료 (공용, 02 12.6) ──
  {
    id: 'juri',
    name: '황주연',
    type: 'companion',
    rarity: 'uncommon',
    pool: 'neutral',
    base: {
      cost: 1,
      effects: [],
      companion: { trigger: 'onTurnStart', effects: [{ op: 'heal', amount: 2 }] },
    },
    upgraded: {
      cost: 1,
      effects: [],
      companion: { trigger: 'onTurnStart', effects: [{ op: 'heal', amount: 3 }] },
    },
  },
  {
    id: 'kazu',
    name: '강재호',
    type: 'companion',
    rarity: 'uncommon',
    pool: 'neutral',
    base: {
      cost: 1,
      effects: [],
      companion: {
        trigger: 'onTurnStart',
        effects: [{ op: 'damage', amount: 3, target: 'randomEnemy' }],
      },
    },
    upgraded: {
      cost: 1,
      effects: [],
      companion: {
        trigger: 'onTurnStart',
        effects: [{ op: 'damage', amount: 5, target: 'randomEnemy' }],
      },
    },
  },
  {
    id: 'kenta',
    name: '이성우',
    type: 'companion',
    rarity: 'uncommon',
    pool: 'neutral',
    base: {
      cost: 1,
      effects: [],
      companion: { trigger: 'onTurnStart', effects: [{ op: 'shield', amount: 3 }] },
    },
    upgraded: {
      cost: 1,
      effects: [],
      companion: { trigger: 'onTurnStart', effects: [{ op: 'shield', amount: 5 }] },
    },
  },
  {
    id: 'calumon',
    name: '동글몬',
    type: 'companion',
    rarity: 'rare',
    pool: 'neutral',
    base: { cost: 1, effects: [], companion: { modifiers: { evolveCostDelta: -1 } } },
    upgraded: { cost: 0, effects: [], companion: { modifiers: { evolveCostDelta: -1 } } },
  },

  // ── 특수 ──
  {
    // 필살기: 0단계에서는 강화가 없으므로 두 면이 같습니다 (02 4.2)
    id: 'exhaust_flame',
    name: '엑조스트 플레임',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 2,
      effects: [{ op: 'damage', amount: 16, target: 'enemy' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'damage', amount: 16, target: 'enemy' }],
      keywords: ['retain'],
    },
  },
  {
    id: 'atomic_blaster',
    name: '아토믹 블래스터',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 2,
      effects: [{ op: 'damage', amount: 24, target: 'enemy' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'damage', amount: 24, target: 'enemy' }],
      keywords: ['retain'],
    },
  },
  {
    id: 'royal_saber',
    name: '로열 세이버',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 3,
      effects: [
        { op: 'damage', amount: 32, target: 'enemy' },
        { op: 'shield', amount: 10 },
      ],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 3,
      effects: [
        { op: 'damage', amount: 32, target: 'enemy' },
        { op: 'shield', amount: 10 },
      ],
      keywords: ['retain'],
    },
  },
  {
    // 저주: 비용 0은 형식상 값
    id: 'bug_data',
    name: '버그 데이터',
    type: 'curse',
    rarity: 'special',
    pool: 'none',
    base: { cost: 0, effects: [], keywords: ['unplayable'] },
    upgraded: { cost: 0, effects: [], keywords: ['unplayable'] },
  },
] satisfies CardDef[];
