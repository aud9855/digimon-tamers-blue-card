// 파트너 형태 (02 9.1)
import type { FormDef } from '../core/types';

export const forms = [
  {
    id: 'guilmon',
    name: '길몬',
    line: 'guilmon',
    stage: 'rookie',
    attribute: 'virus',
    tempHp: 0,
    power: 0,
  },
  {
    id: 'growlmon',
    name: '그라우몬',
    line: 'guilmon',
    stage: 'champion',
    attribute: 'virus',
    tempHp: 5,
    power: 1,
    signatureCardId: 'exhaust_flame',
  },
  {
    id: 'wargrowlmon',
    name: '메가로그라우몬',
    line: 'guilmon',
    stage: 'ultimate',
    attribute: 'virus',
    tempHp: 12,
    power: 2,
    signatureCardId: 'atomic_blaster',
  },
  {
    id: 'gallantmon',
    name: '듀크몬',
    line: 'guilmon',
    stage: 'mega',
    attribute: 'virus',
    tempHp: 18,
    power: 4,
    signatureCardId: 'royal_saber',
  },
] satisfies FormDef[];
