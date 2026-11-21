// 변이 카드 (02 15.1). 판 시작에 3개 중 하나를 고르거나 건너뜀
import type { MutationDef } from '../core/types';

export const mutations = [
  {
    id: 'weak_wilds',
    name: '흐려진 와일드 원',
    good: [{ op: 'enemyHpPct', pct: -15 }],
    bad: [{ op: 'rewardCards', amount: -1 }],
  },
  {
    id: 'rush_evolve',
    name: '서두르는 진화',
    good: [{ op: 'modifiers', modifiers: { evolveCostDelta: -1 } }],
    bad: [{ op: 'maxHp', amount: -12 }],
  },
  {
    id: 'fat_wallet',
    name: '두둑한 지갑',
    good: [{ op: 'startBits', amount: 150 }],
    bad: [{ op: 'shopPricePct', pct: 30 }],
  },
  {
    id: 'tough_body',
    name: '단단한 몸',
    good: [{ op: 'maxHp', amount: 20 }],
    bad: [{ op: 'enemyDamagePct', pct: 10 }],
  },
  {
    id: 'wide_hand',
    name: '넓은 손',
    good: [{ op: 'modifiers', modifiers: { handSizeBonus: 1 } }],
    bad: [{ op: 'enemyHpPct', pct: 15 }],
  },
  {
    id: 'many_choices',
    name: '많은 선택지',
    good: [{ op: 'rewardCards', amount: 1 }],
    bad: [{ op: 'maxHp', amount: -10 }],
  },
  {
    id: 'bit_hunter',
    name: '비트 사냥꾼',
    good: [{ op: 'modifiers', modifiers: { battleBitsBonus: 15 } }],
    bad: [{ op: 'enemyHpPct', pct: 10 }],
  },
  {
    id: 'quiet_night',
    name: '조용한 밤',
    good: [{ op: 'enemyDamagePct', pct: -12 }],
    bad: [{ op: 'modifiers', modifiers: { handSizeBonus: -1 } }],
  },
] satisfies MutationDef[];
