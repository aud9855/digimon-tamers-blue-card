// 02 13.5 메타 진행: 판 밖의 기록(프로필)과 해금. 모두 순수 함수입니다.
import { getChips, getEncounter, getTamers, meta } from '../data/index';
import type { GameEvent, GameState, Profile, TamerId, Unlocks } from './types';

/** 프로필 저장 형식 버전 */
export const PROFILE_VERSION = 1;

/** 처음 상태의 해금 정보 */
export function defaultUnlocks(): Unlocks {
  return {
    tamers: [...meta.baseTamers],
    startChips: [...meta.baseStartChips],
    hazard: 0,
  };
}

/** 모든 것이 열린 해금 정보 (시뮬레이터) */
export function fullUnlocks(): Unlocks {
  return {
    tamers: getTamers().map((t) => t.id),
    startChips: getChips()
      .filter((c) => c.start)
      .map((c) => c.id),
    hazard: meta.maxHazard,
  };
}

export function createProfile(): Profile {
  return {
    version: PROFILE_VERSION,
    runs: {},
    unlocks: defaultUnlocks(),
    codex: { forms: [], enemies: [] },
  };
}

function addUnique<T>(list: T[], items: readonly T[]): boolean {
  let changed = false;
  for (const item of items) {
    if (list.includes(item)) continue;
    list.push(item);
    changed = true;
  }
  return changed;
}

/** 도감에 적기: 진화해 본 형태, 전투에 나온 적. 바뀐 것이 없으면 같은 프로필을 돌려줌 */
export function recordCodex(profile: Profile, events: readonly GameEvent[]): Profile {
  const forms: string[] = [];
  const enemies: string[] = [];
  for (const e of events) {
    if (e.type === 'evolved') forms.push(e.formId);
    if (e.type === 'battleStarted') enemies.push(...getEncounter(e.encounterId).enemies);
  }
  if (forms.length === 0 && enemies.length === 0) return profile;
  const next = structuredClone(profile);
  const newForms = addUnique(next.codex.forms, forms);
  const newEnemies = addUnique(next.codex.enemies, enemies);
  return newForms || newEnemies ? next : profile;
}

/** 판이 끝났을 때(runWon·runLost) 프로필 갱신. 끝나지 않은 판이면 그대로 (02 13.5) */
export function applyRunResult(
  profile: Profile,
  finalState: GameState,
  events: readonly GameEvent[],
): Profile {
  const next = structuredClone(recordCodex(profile, events));
  const run = finalState.run;
  if (!run || (finalState.phase !== 'runWon' && finalState.phase !== 'runLost')) return next;
  const won = finalState.phase === 'runWon';
  const count = (next.runs[run.tamerId] ??= { played: 0, won: 0 });
  count.played += 1;
  if (!won) return next;
  count.won += 1;
  addUnique<TamerId>(next.unlocks.tamers, meta.firstWinTamers);
  const chip = meta.startChipUnlockOrder.find((id) => !next.unlocks.startChips.includes(id));
  if (chip) next.unlocks.startChips.push(chip);
  return next;
}
