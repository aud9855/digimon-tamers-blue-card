// 규칙 상수 (03 6절). 밸런스 조정은 이 파일과 다른 data 파일만 고칩니다.
import type { FormTraitId, NodeType, Rarity, Stage } from '../core/types';

export type RarityWeights = Partial<Record<Rarity, number>>;
export type EncounterTierForMap = 'easy' | 'normal';

export interface MapRowRule {
  /** 칸 종류 가중치 (02 6절 3번) */
  weights: Partial<Record<NodeType, number>>;
  /** 앞 칸부터 차례로 정해 둔 종류. 이 칸들 뒤의 칸은 weights로 정합니다 (4행) */
  fixed?: NodeType[];
  /** 전투 칸의 조우 난이도 */
  encounterTier?: EncounterTierForMap;
}

export const constants = {
  // ── 단계 (02 1절) ──
  STAGE_ORDER: ['rookie', 'champion', 'ultimate', 'mega'] as Stage[],

  // ── 전투 (02 3절) ──
  HAND_SIZE: 5,
  HAND_LIMIT: 10,
  MAX_OVERDRAW: 3,
  ACCEL_PER_POINT: 0.35,
  ATTR_STRONG: 1.5,
  ATTR_WEAK: 0.75,
  WEAK_MULT: 0.75,
  VULNERABLE_MULT: 1.5,
  EVOLVE_BASE_COST: { champion: 3, ultimate: 3, mega: 4 } as Partial<Record<Stage, number>>,

  // ── 동료·형태 특성 (02 12.5, 12.6) ──
  COMPANION_SLOTS: 2,
  FORM_TRAITS: ['tough', 'sharp'] as FormTraitId[],
  FORM_TRAIT_TEMP_HP: 6,
  FORM_TRAIT_POWER: 1,

  // ── 매트릭스 에볼루션 (02 13.1) ──
  MATRIX_HAND_BONUS: 2,
  MATRIX_MEMORY_BONUS: 1,

  // ── 막 (02 2절, 7.6) ──
  ACT_COUNT: 3,
  ACT_CLEAR_HEAL_PCT: 0.5,
  ACT_CLEAR_MAX_MEMORY_GAIN: 1,

  // ── 보상 (02 7.1) ──
  CARD_OFFER_SIZE: 3,
  REWARD_WEIGHTS_NORMAL: { common: 60, uncommon: 33, rare: 7 } as RarityWeights,
  REWARD_WEIGHTS_ELITE: { common: 45, uncommon: 45, rare: 10 } as RarityWeights,
  REWARD_WEIGHTS_BOSS: { rare: 100 } as RarityWeights,
  /** 전투 보상 카드가 강화되어 나올 확률 (퍼센트, 막별, 02 12.2) */
  UPGRADE_CHANCE: { 1: 0, 2: 15, 3: 30 } as Record<number, number>,
  BITS_NORMAL: { min: 12, max: 18 },
  BITS_ELITE: { min: 28, max: 35 },
  BITS_BOSS: { min: 60, max: 60 },
  /** 받을 칩이 없을 때 대신 받는 비트 */
  NO_CHIP_BITS: 50,

  // ── 상점 (02 7.2) ──
  SHOP_CARD_COUNT: 5,
  SHOP_CHIP_COUNT: 2,
  SHOP_WEIGHTS: { common: 55, uncommon: 35, rare: 10 } as RarityWeights,
  SHOP_CARD_PRICE: { common: 45, uncommon: 70, rare: 130 } as RarityWeights,
  SHOP_CHIP_PRICE: 140,
  SHOP_REMOVE_BASE: 60,
  SHOP_REMOVE_STEP: 20,

  // ── 휴식 (02 7.3) ──
  REST_HEAL_PCT: 0.3,

  // ── 지도 (02 6절) ──
  MAP_ROWS: 7,
  MAP_COLS: 3,
  /** 한 행의 칸 수와 가중치 (2칸 또는 3칸, 반반) */
  MAP_ROW_SIZE_WEIGHTS: [
    { size: 2, weight: 1 },
    { size: 3, weight: 1 },
  ],
  /** 1행부터 7행까지 */
  MAP_ROW_RULES: [
    { weights: { battle: 100 }, encounterTier: 'easy' },
    { weights: { battle: 60, event: 40 }, encounterTier: 'easy' },
    { weights: { battle: 45, elite: 30, event: 25 }, encounterTier: 'normal' },
    { weights: { treasure: 50, shop: 50 }, fixed: ['treasure', 'shop'] },
    { weights: { battle: 45, event: 30, elite: 25 }, encounterTier: 'normal' },
    { weights: { battle: 50, event: 30, shop: 20 }, encounterTier: 'normal' },
    { weights: { rest: 100 } },
  ] as MapRowRule[],
  BOSS_ROW: 8,
  BOSS_COL: 1,
};

export type Constants = typeof constants;
