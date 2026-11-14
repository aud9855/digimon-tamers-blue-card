// 테스트 전용 정의 (03 8.1). 0단계 데이터만으로 확인할 수 없는 규칙을 확인할 때 씁니다.
import type { ChipDef, EncounterDef, EnemyDef } from '../../src/core/types';
import type { RegistryOverride } from '../../src/data/index';

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
  enemies: testEnemies,
  encounters: testEncounters,
};
