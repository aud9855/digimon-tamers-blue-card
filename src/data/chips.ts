// 디아크 칩 (02 9.5)
import type { ChipDef } from '../core/types';

export const chips = [
  {
    id: 'cube_shield',
    name: '큐브 실드',
    trigger: 'onBattleStart',
    effects: [{ op: 'shield', amount: 6 }],
  },
  {
    id: 'courage_badge',
    name: '용기의 증표',
    trigger: 'onBattleStart',
    effects: [{ op: 'applyStatus', status: 'strength', amount: 1, target: 'self' }],
  },
  {
    id: 'data_fragment',
    name: '데이터 조각',
    trigger: 'onFirstTurn',
    effects: [{ op: 'draw', count: 1 }],
  },
  {
    id: 'spare_battery',
    name: '예비 배터리',
    trigger: 'onFirstTurn',
    effects: [{ op: 'gainMemory', amount: 1 }],
  },
  {
    id: 'evo_pulse',
    name: '진화의 고동',
    trigger: 'onEvolve',
    effects: [{ op: 'shield', amount: 5 }],
  },
  // ── 시작 칩 (판 시작에 고름, 02 12.7) ──
  {
    id: 'card_reader',
    name: '카드 리더',
    start: true,
    trigger: 'onFirstTurn',
    effects: [
      { op: 'draw', count: 2 },
      { op: 'gainMemory', amount: 1 },
    ],
  },
  {
    id: 'guard_chip',
    name: '가드 칩',
    start: true,
    trigger: 'onBattleStart',
    effects: [{ op: 'shield', amount: 10 }],
  },
  {
    id: 'bit_scanner',
    name: '비트 스캐너',
    start: true,
    modifiers: { battleBitsBonus: 10, maxHpBonus: 10 },
  },
  // 해금으로 열리는 시작 칩 (02 13.5)
  {
    id: 'memory_booster',
    name: '메모리 부스터',
    start: true,
    trigger: 'onFirstTurn',
    effects: [{ op: 'gainMemory', amount: 2 }],
  },
  {
    id: 'evo_charger',
    name: '진화 충전기',
    start: true,
    modifiers: { evolveWaitBonus: 1 },
  },
  {
    id: 'heal_chip',
    name: '회복 칩',
    start: true,
    modifiers: { maxHpBonus: 10 },
  },
  // ── 테이머 특성 (숨은 칩, 02 12.3) ──
  {
    id: 'trait_card_battler',
    name: '카드 배틀 실력자',
    hidden: true,
    modifiers: { firstCardCostDelta: -1 },
  },
  {
    id: 'trait_two_tamers',
    name: '두 사람의 카드',
    hidden: true,
    modifiers: { handGroups: 2 },
  },
  {
    id: 'trait_calm',
    name: '침착함',
    hidden: true,
    trigger: 'onTurnStart',
    effects: [{ op: 'shield', amount: 1 }],
  },
  {
    id: 'bit_pouch',
    name: '비트 주머니',
    modifiers: { battleBitsBonus: 5 },
  },
  // ── 콘텐츠 2차 보상 칩 (02 9.5). 칩 뽑기가 배열 순서를 따르므로 새 칩은 끝에 더함 ──
  {
    id: 'scope_lens',
    name: '조준 렌즈',
    trigger: 'onBattleStart',
    effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 1, target: 'allEnemies' }],
  },
  {
    id: 'jammer',
    name: '교란 신호',
    trigger: 'onBattleStart',
    effects: [{ op: 'applyStatus', status: 'weak', amount: 1, target: 'allEnemies' }],
  },
  {
    id: 'ignition_core',
    name: '점화 회로',
    trigger: 'onEvolve',
    effects: [{ op: 'damage', amount: 3, target: 'allEnemies' }],
  },
  {
    id: 'data_buffer',
    name: '데이터 버퍼',
    modifiers: { maxHpBonus: 8 },
  },
  {
    id: 'ultimate_core',
    name: '궁극의 핵',
    trigger: 'onTurnStart',
    effects: [{ op: 'ifStage', min: 'ultimate', then: [{ op: 'shield', amount: 2 }] }],
  },
  {
    id: 'first_aid_patch',
    name: '응급 패치',
    trigger: 'onEvolve',
    effects: [{ op: 'heal', amount: 2 }],
  },
  // 이재익 특성 (숨은 칩, 02 15.2)
  {
    id: 'trait_legendary_tamer',
    name: '전설의 테이머',
    hidden: true,
    trigger: 'onEvolve',
    effects: [{ op: 'draw', count: 1 }],
  },
] satisfies ChipDef[];
