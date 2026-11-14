// 02 3.11 승패
import { requireBattle, requireRun } from '../helpers';
import { constants } from '../../data/index';
import { addCardToDeck, enterBattleReward } from '../run/reward';
import { setPhase } from '../phase';
import type { GameEvent, GameState } from '../types';

/** 플레이어 hp <= 0이면 패배. 남은 처리를 모두 멈추고 국면은 runLost (전투 밖에서도 씀) */
export function checkDefeat(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  if (run.hp > 0 || state.phase === 'runLost') return;
  if (state.battle) {
    const battle = state.battle;
    events.push({
      type: 'battleEnded',
      won: false,
      kind: battle.kind,
      encounterId: battle.encounterId,
      turns: battle.turn,
      hpBefore: battle.hpAtStart,
      hpAfter: run.hp,
      evolveCount: battle.evolveCount,
    });
    state.battle = null;
  }
  state.pending = null;
  setPhase(state, events, 'runLost');
  events.push({ type: 'runEnded', won: false });
}

/** 전투 처리를 멈춰야 하는지 (패배로 전투가 끝났음) */
export function battleStopped(state: GameState): boolean {
  return state.phase !== 'battle' || state.battle === null;
}

export function allEnemiesDead(state: GameState): boolean {
  return requireBattle(state).enemies.every((e) => !e.alive);
}

/**
 * 승리: 전투 상태를 지우고 보상으로 갑니다.
 * stage, tempHp, shield, 상태 효과, 임시 카드는 battle과 함께 사라지고 hp만 런에 남습니다 (02 3.7).
 */
export function winBattle(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  const run = requireRun(state);
  events.push({
    type: 'battleEnded',
    won: true,
    kind: battle.kind,
    encounterId: battle.encounterId,
    turns: battle.turn,
    hpBefore: battle.hpAtStart,
    hpAfter: run.hp,
    evolveCount: battle.evolveCount,
  });
  state.battle = null;
  // 폭주의 대가: 저주 카드 (보상보다 먼저, 02 13.2)
  if (battle.rampage) addCardToDeck(state, events, constants.RAMPAGE_CURSE_ID, false);
  enterBattleReward(state, events, battle.kind);
}
