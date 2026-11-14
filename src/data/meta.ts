// 메타 진행: 처음부터 열린 것과 해금 순서 (02 13.5)
import type { TamerId } from '../core/types';

export interface MetaDef {
  /** 처음부터 고를 수 있는 테이머 */
  baseTamers: TamerId[];
  /** 처음 이기면 열리는 테이머 */
  firstWinTamers: TamerId[];
  /** 처음부터 열린 시작 칩 (02 12.7) */
  baseStartChips: string[];
  /** 이길 때마다 하나씩 열리는 시작 칩, 이 순서대로 */
  startChipUnlockOrder: string[];
  /** 디지털 해저드 최고 단계 (13.6) */
  maxHazard: number;
}

export const meta: MetaDef = {
  baseTamers: ['takato', 'rika', 'henry'],
  firstWinTamers: ['ai_mako'],
  baseStartChips: ['card_reader', 'guard_chip', 'bit_scanner'],
  startChipUnlockOrder: ['memory_booster', 'evo_charger', 'heal_chip'],
  maxHazard: 10,
};
