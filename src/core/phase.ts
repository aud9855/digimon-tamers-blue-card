// 국면 바꾸기 (02 2절)
import type { GameEvent, GameState } from './types';

export function setPhase(state: GameState, events: GameEvent[], phase: GameState['phase']): void {
  state.phase = phase;
  events.push({ type: 'phaseChanged', phase });
}

/** 칸 처리가 끝나 지도로 돌아감 */
export function returnToMap(state: GameState, events: GameEvent[]): void {
  state.pending = null;
  setPhase(state, events, 'map');
}
