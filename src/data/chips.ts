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
    effects: [{ op: 'draw', count: 2 }],
  },
  {
    id: 'guard_chip',
    name: '가드 칩',
    start: true,
    trigger: 'onBattleStart',
    effects: [{ op: 'shield', amount: 8 }],
  },
  {
    id: 'bit_scanner',
    name: '비트 스캐너',
    start: true,
    modifiers: { battleBitsBonus: 10, maxHpBonus: 5 },
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
    effects: [{ op: 'shield', amount: 2 }],
  },
  {
    id: 'bit_pouch',
    name: '비트 주머니',
    modifiers: { battleBitsBonus: 5 },
  },
] satisfies ChipDef[];
