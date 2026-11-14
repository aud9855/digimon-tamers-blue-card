// 화면 상태 (03 9.1). GameState를 보관하고 dispatch로만 바꿉니다.
import { create } from 'zustand';
import {
  applyAction,
  createInitialState,
  type Action,
  type GameEvent,
  type GameState,
} from '../core/index';

export interface GameStore {
  state: GameState;
  /** 마지막 행동에서 일어난 일 (연출 재생은 T1-4) */
  lastEvents: GameEvent[];
  dispatch: (action: Action) => void;
  /** 새 시드로 처음부터 */
  newGame: (seed?: number) => void;
}

/** 화면 쪽 시드. core가 아니므로 무작위 API를 써도 됩니다. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

export const useGame = create<GameStore>((set, get) => ({
  state: createInitialState(randomSeed()),
  lastEvents: [],
  dispatch: (action) => {
    const result = applyAction(get().state, action);
    set({ state: result.state, lastEvents: result.events });
  },
  newGame: (seed) => {
    set({ state: createInitialState(seed ?? randomSeed()), lastEvents: [] });
  },
}));
