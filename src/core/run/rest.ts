// 02 7.3 휴식
import { constants } from '../../data/index';
import { heal } from '../battle/damage';
import { setPhase } from '../phase';
import { isUpgradable, requireRun } from '../helpers';
import type { GameEvent, GameState } from '../types';

export function enterRest(state: GameState, events: GameEvent[]): void {
  state.pending = { kind: 'rest' };
  setPhase(state, events, 'rest');
}

function leaveRest(state: GameState, events: GameEvent[]): void {
  state.pending = null;
  setPhase(state, events, 'map');
}

export function restHeal(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  heal(state, events, Math.floor(run.maxHp * constants.REST_HEAL_PCT));
  leaveRest(state, events);
}

export function restUpgrade(state: GameState, events: GameEvent[], cardUid: number): void {
  const card = requireRun(state).deck.find((c) => c.uid === cardUid);
  if (!card || !isUpgradable(card)) throw new Error(`강화할 수 없는 카드: ${cardUid}`);
  card.upgraded = true;
  events.push({ type: 'cardUpgraded', cardUid });
  leaveRest(state, events);
}
