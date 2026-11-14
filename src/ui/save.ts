// IndexedDB 저장·불러오기 (03 9.1). 라이브러리 없이 브라우저 기본 API만 씀.
import {
  createProfile,
  defaultUnlocks,
  PROFILE_VERSION,
  SAVE_VERSION,
  type GameState,
  type Profile,
} from '../core/index';
import { getCard, getEnemy, getTamer } from '../data/index';
import type { TamerId } from '../core/index';
import type { PlaybackSpeed } from './playback';

const DB_NAME = 'digimon-blue-card';
const STORE = 'save';
const GAME_KEY = 'game';
const SETTINGS_KEY = 'settings';
const PROFILE_KEY = 'profile';

export interface Settings {
  speed: PlaybackSpeed;
  seenGuide: boolean;
  /** 효과음 (02 13.7) */
  sound: boolean;
}

const SPEEDS: PlaybackSpeed[] = ['normal', 'fast', 'off'];

function available(): boolean {
  return typeof indexedDB !== 'undefined';
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(key: string, value: unknown): Promise<void> {
  if (!available()) return;
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function remove(key: string): Promise<void> {
  if (!available()) return;
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function get(key: string): Promise<unknown> {
  if (!available()) return undefined;
  const db = await open();
  const value = await new Promise<unknown>((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value;
}

/** 국면마다 있어야 하는 대기 정보 (02 2절의 표) */
const PENDING_OF: Partial<Record<GameState['phase'], string>> = {
  startChip: 'startChip',
  reward: 'reward',
  shop: 'shop',
  rest: 'rest',
  event: 'event',
  treasure: 'treasure',
  actClear: 'actClear',
};

/**
 * 국면과 상태가 맞는지 (화면이 그릴 수 있는지).
 * 맞지 않으면 화면이 아무것도 그리지 못해 빈 화면이 되므로, 그런 저장은 이어 하지 않습니다.
 */
export function isConsistentState(state: GameState): boolean {
  if (state.phase === 'title') return true;
  const run = state.run as Partial<NonNullable<GameState['run']>> | null;
  if (!run || !Array.isArray(run.deck) || !Array.isArray(run.chips) || !run.map) return false;
  if (!Array.isArray(run.map.nodes) || !Array.isArray(run.path) || typeof run.hp !== 'number') {
    return false;
  }
  if (state.phase === 'battle') {
    const b = state.battle;
    if (!b) return false;
    const lists = [b.hand, b.enemies, b.drawPile, b.discardPile, b.exhaustPile, b.companions];
    if (!lists.every(Array.isArray)) return false;
  }
  // 지금 데이터에 없는 카드·적이 있으면 그릴 수 없음
  try {
    const cards = [
      ...run.deck,
      ...(state.battle
        ? [
            ...state.battle.hand,
            ...state.battle.drawPile,
            ...state.battle.discardPile,
            ...state.battle.exhaustPile,
            ...state.battle.companions,
          ]
        : []),
    ];
    for (const c of cards) getCard(c.defId);
    for (const e of state.battle?.enemies ?? []) getEnemy(e.defId);
    getTamer(run.tamerId as TamerId);
  } catch {
    return false;
  }
  const kind = PENDING_OF[state.phase];
  if (kind && state.pending?.kind !== kind) return false;
  return true;
}

/**
 * 나중 단계에서 생긴 필드를 기본값으로 채움.
 * 저장 버전 1은 1단계와 2단계에 함께 쓰였고, 1단계 저장에는 2단계의 필드(동료 등)가 없습니다.
 * 기본값은 그 필드가 생기기 전의 규칙과 같은 뜻입니다 (동료 없음, 형태 특성 없음, 해저드 0 등).
 */
export function fillMissingFields(state: GameState): void {
  const run = state.run as (Partial<NonNullable<GameState['run']>> & object) | null;
  if (run) {
    run.formTraits ??= {};
    run.hazard ??= 0;
    run.removalsBought ??= 0;
  }
  const battle = state.battle as (Partial<NonNullable<GameState['battle']>> & object) | null;
  if (battle) {
    battle.companions ??= [];
    battle.cardsPlayedThisTurn ??= 0;
    battle.rampage ??= false;
    battle.handChoice ??= null;
    battle.exhaustPile ??= [];
    battle.evolveCount ??= 0;
  }
  const pending = state.pending as { kind?: string; traitStage?: unknown } | null;
  if (pending?.kind === 'actClear') pending.traitStage ??= null;
}

/** 저장된 값이 이 버전의 게임 상태인지 확인. 아니면 null (깨진 저장, 옛 버전) */
export function parseSavedGame(raw: unknown): GameState | null {
  if (typeof raw !== 'string') return null;
  try {
    const value = JSON.parse(raw) as Partial<GameState>;
    if (typeof value.phase !== 'string') return null;
    if (typeof value.seed !== 'number' || !value.rng) return null;
    // 버전 1 → 2: 해금 정보가 생김 (02 13.5). 1단계·2단계의 판은 처음 해금 상태로 이어 함
    let state: GameState;
    if (value.version === 1) {
      state = { ...value, version: SAVE_VERSION, unlocks: defaultUnlocks() } as GameState;
    } else if (value.version === SAVE_VERSION && value.unlocks) {
      state = value as GameState;
    } else {
      return null;
    }
    fillMissingFields(state);
    return isConsistentState(state) ? state : null;
  } catch {
    return null;
  }
}

export function parseSettings(raw: unknown): Settings {
  const value = (raw ?? {}) as Partial<Settings>;
  return {
    speed: SPEEDS.includes(value.speed as PlaybackSpeed)
      ? (value.speed as PlaybackSpeed)
      : 'normal',
    seenGuide: value.seenGuide === true,
    sound: value.sound !== false,
  };
}

/** 저장된 프로필. 깨졌거나 없으면 새 프로필 (빠진 칸은 새 프로필의 값으로 채움) */
export function parseProfile(raw: unknown): Profile {
  const fresh = createProfile();
  if (typeof raw !== 'string') return fresh;
  try {
    const value = JSON.parse(raw) as Partial<Profile>;
    if (value.version !== PROFILE_VERSION) return fresh;
    const unlocks = { ...fresh.unlocks, ...(value.unlocks ?? {}) };
    const codex = { ...fresh.codex, ...(value.codex ?? {}) };
    if (!Array.isArray(unlocks.tamers) || !Array.isArray(unlocks.startChips)) return fresh;
    if (!Array.isArray(codex.forms) || !Array.isArray(codex.enemies)) return fresh;
    return { version: PROFILE_VERSION, runs: value.runs ?? {}, unlocks, codex };
  } catch {
    return fresh;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await put(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<Profile> {
  try {
    return parseProfile(await get(PROFILE_KEY));
  } catch {
    return createProfile();
  }
}

/** 저장 형식은 JSON 문자열 (03 5절 약속 5: JSON으로 되살릴 수 있어야 함) */
export async function saveGame(state: GameState): Promise<void> {
  await put(GAME_KEY, JSON.stringify(state));
}

/** 진행 중인 판만 지움 (오류 화면의 "저장 지우고 처음으로") */
export async function clearSavedGame(): Promise<void> {
  await remove(GAME_KEY);
}

export async function loadGame(): Promise<GameState | null> {
  try {
    return parseSavedGame(await get(GAME_KEY));
  } catch {
    return null;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await put(SETTINGS_KEY, settings);
}

export async function loadSettings(): Promise<Settings> {
  try {
    return parseSettings(await get(SETTINGS_KEY));
  } catch {
    return parseSettings(undefined);
  }
}

/** 이어 할 판인지 (제목·결과 화면은 이어 하지 않음) */
export function isResumable(state: GameState): boolean {
  return state.phase !== 'title' && state.phase !== 'runWon' && state.phase !== 'runLost';
}
