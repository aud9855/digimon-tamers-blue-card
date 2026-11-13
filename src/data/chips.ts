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
  {
    id: 'bit_pouch',
    name: '비트 주머니',
    modifiers: { battleBitsBonus: 5 },
  },
] satisfies ChipDef[];
