import { initialRngState } from './rng';
import type { GameState } from './types';

/** 저장 형식 버전. GameState의 모양이 바뀌면 올립니다. */
export const SAVE_VERSION = 1;

/** 새 게임 상태 (국면 'title'). */
export function createInitialState(seed: number): GameState {
  if (!Number.isSafeInteger(seed)) {
    throw new RangeError(`createInitialState: 시드는 정수여야 합니다 (받은 값: ${seed})`);
  }
  return {
    version: SAVE_VERSION,
    seed,
    rng: initialRngState(seed),
    phase: 'title',
    run: null,
    battle: null,
    pending: null,
    nextUid: 1,
  };
}
