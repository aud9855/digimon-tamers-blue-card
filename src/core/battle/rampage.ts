// 02 13.2 폭주 진화 (오유민 전용: 계열에 폭주 형태가 있을 때)
import { constants, getRampageForm, getTamer } from '../../data/index';
import { triggerChips } from '../chips';
import { formTempHp, requireBattle, requireRun } from '../helpers';
import { winIfCleared } from './outcome';
import type { GameEvent, GameState } from '../types';
import { createTempCards } from './piles';

/** 조건: 전투 중, 계열에 폭주 형태가 있음, 성숙기 또는 완전체, HP 25% 이하, 아직 폭주 안 함 */
export function canRampage(state: GameState): boolean {
  if (state.phase !== 'battle' || !state.battle) return false;
  const run = requireRun(state);
  const battle = state.battle;
  if (battle.rampage) return false;
  if (battle.stage !== 'champion' && battle.stage !== 'ultimate') return false;
  if (!getRampageForm(getTamer(run.tamerId).line)) return false;
  return run.hp <= Math.floor(run.maxHp * constants.RAMPAGE_HP_PCT);
}

/** 02 13.2 처리 순서 */
export function rampage(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  const run = requireRun(state);
  const form = getRampageForm(getTamer(run.tamerId).line);
  if (!form) throw new Error('폭주 형태가 없습니다');
  const from = battle.stage;

  // 1. 메기드라몬 (단계 조건에서는 궁극체로 셈)
  battle.stage = form.stage;
  battle.rampage = true;
  // 2.
  const tempHp = formTempHp(state, form);
  battle.tempHp += tempHp;
  events.push({
    type: 'evolved',
    from,
    to: form.stage,
    cost: 0,
    tempHpGained: tempHp,
    formId: form.id,
  });
  // 3. 필살기를 임시 카드로 손패에
  if (form.signatureCardId) createTempCards(state, events, form.signatureCardId, 'hand', 1);
  // 4.
  battle.evolvedThisTurn = true;
  battle.evolveCount += 1;
  triggerChips(state, events, 'onEvolve');
  winIfCleared(state, events);
}
