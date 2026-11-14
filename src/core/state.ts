import { defaultUnlocks } from './meta';
import { initialRngState } from './rng';
import type { GameState, Unlocks } from './types';

/** 저장 형식 버전. GameState의 모양이 바뀌면 올립니다. */
export const SAVE_VERSION = 2;

/** 새 게임 상태 (국면 'title'). 해금 정보를 주지 않으면 처음 상태 (02 13.5) */
export function createInitialState(seed: number, unlocks: Unlocks = defaultUnlocks()): GameState {
  if (!Number.isSafeInteger(seed)) {
    throw new RangeError(`createInitialState: 시드는 정수여야 합니다 (받은 값: ${seed})`);
  }
  return {
    version: SAVE_VERSION,
    seed,
    unlocks: structuredClone(unlocks),
    rng: initialRngState(seed),
    phase: 'title',
    run: null,
    battle: null,
    pending: null,
    nextUid: 1,
  };
}
