// 테스트 전용 정의 (03 8.1). 0단계 데이터만으로 확인할 수 없는 규칙을 확인할 때 씁니다.
import type { CardDef, ChipDef, EncounterDef, EnemyDef, FormDef } from '../../src/core/types';
import type { RegistryOverride } from '../../src/data/index';

// ── 완전체·궁극체 시험용 형태와 필살기 ──
export const testSignatureCards: CardDef[] = [
  {
    id: 'test_sig_ultimate',
    name: '시험 필살기(완전체)',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 2,
      effects: [{ op: 'damage', amount: 20, target: 'enemy' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 2,
      effects: [{ op: 'damage', amount: 20, target: 'enemy' }],
      keywords: ['retain'],
    },
  },
  {
    id: 'test_sig_mega',
    name: '시험 필살기(궁극체)',
    type: 'signature',
    rarity: 'special',
    pool: 'none',
    base: {
      cost: 3,
      effects: [{ op: 'damage', amount: 30, target: 'enemy' }],
      keywords: ['retain'],
    },
    upgraded: {
      cost: 3,
      effects: [{ op: 'damage', amount: 30, target: 'enemy' }],
      keywords: ['retain'],
    },
  },
];

export const testForms: FormDef[] = [
  {
    id: 'test_ultimate',
    name: '시험 완전체',
    line: 'guilmon',
    stage: 'ultimate',
    attribute: 'virus',
    tempHp: 12,
    power: 2,
    signatureCardId: 'test_sig_ultimate',
  },
  {
    id: 'test_mega',
    name: '시험 궁극체',
    line: 'guilmon',
    stage: 'mega',
    attribute: 'virus',
    tempHp: 18,
    power: 4,
    signatureCardId: 'test_sig_mega',
  },
];

// ── 아무것도 안 하는 적 (속성별) ──
function dummy(id: string, attribute: EnemyDef['attribute'], maxHp = 100): EnemyDef {
  return {
    id,
    name: `시험 적 ${id}`,
    tier: 'normal',
    attribute,
    maxHp,
    moves: [{ id: 'idle', name: '가만히 있기', effects: [] }],
    phases: [{ cycle: ['idle'] }],
  };
}

export const testEnemies: EnemyDef[] = [
  dummy('test_dummy', 'none'),
  dummy('test_dummy_vaccine', 'vaccine'),
  dummy('test_dummy_data', 'data'),
  dummy('test_dummy_virus', 'virus'),
  {
    id: 'test_attacker',
    name: '시험 공격수',
    tier: 'normal',
    attribute: 'none',
    maxHp: 100,
    moves: [
      { id: 'hit', name: '때리기', effects: [{ op: 'attack', amount: 10 }] },
      { id: 'guard', name: '막기', effects: [{ op: 'shield', amount: 5 }] },
    ],
    phases: [{ cycle: ['hit', 'guard'] }],
  },
];

export const testEncounters: EncounterDef[] = [
  { id: 'test_dummy_one', act: 99, tier: 'normal', enemies: ['test_dummy'] },
  { id: 'test_dummy_two', act: 99, tier: 'normal', enemies: ['test_dummy', 'test_dummy'] },
  // 2막 시험용 조우 (1막 적을 다시 씀)
  { id: 'test_a2_easy', act: 2, tier: 'easy', enemies: ['goblimon'] },
  { id: 'test_a2_normal', act: 2, tier: 'normal', enemies: ['allomon'] },
  { id: 'test_a2_elite', act: 2, tier: 'elite', enemies: ['musyamon'] },
  { id: 'test_a2_boss', act: 2, tier: 'boss', enemies: ['mihiramon'] },
];

// ── 발동 시점·수치 보정마다 시험용 칩 ──
export const testChips: ChipDef[] = [
  {
    id: 'test_on_battle_start',
    name: '시험 전투 시작',
    trigger: 'onBattleStart',
    effects: [{ op: 'shield', amount: 3 }],
  },
  {
    id: 'test_on_first_turn',
    name: '시험 첫 턴',
    trigger: 'onFirstTurn',
    effects: [{ op: 'gainMemory', amount: 2 }],
  },
  {
    id: 'test_on_turn_start',
    name: '시험 턴 시작',
    trigger: 'onTurnStart',
    effects: [{ op: 'shield', amount: 1 }],
  },
  {
    id: 'test_on_evolve',
    name: '시험 진화',
    trigger: 'onEvolve',
    effects: [{ op: 'gainMemory', amount: 1 }],
  },
  {
    id: 'test_on_card_played',
    name: '시험 카드 냄',
    trigger: 'onCardPlayed',
    effects: [{ op: 'damage', amount: 1, target: 'allEnemies' }],
  },
  { id: 'test_evolve_cost', name: '시험 진화 비용', modifiers: { evolveCostDelta: -1 } },
  { id: 'test_bits_bonus', name: '시험 비트', modifiers: { battleBitsBonus: 7 } },
  { id: 'test_hand_size', name: '시험 손패', modifiers: { handSizeBonus: 2 } },
  { id: 'test_max_hp', name: '시험 최대 HP', modifiers: { maxHpBonus: 10 } },
];

/** 모든 시험용 정의 (칩은 넣지 않음: 무작위 칩 보상에 끼면 안 되므로 필요한 테스트에서 따로 넣음) */
export const baseFixtures: RegistryOverride = {
  cards: testSignatureCards,
  forms: testForms,
  enemies: testEnemies,
  encounters: testEncounters,
};
