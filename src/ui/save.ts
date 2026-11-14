// IndexedDB 저장·불러오기 (03 9.1). 라이브러리 없이 브라우저 기본 API만 씀.
import { SAVE_VERSION, type GameState } from '../core/index';
import type { PlaybackSpeed } from './playback';

const DB_NAME = 'digimon-blue-card';
const STORE = 'save';
const GAME_KEY = 'game';
const SETTINGS_KEY = 'settings';

export interface Settings {
  speed: PlaybackSpeed;
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

/** 저장된 값이 이 버전의 게임 상태인지 확인. 아니면 null (깨진 저장, 옛 버전) */
export function parseSavedGame(raw: unknown): GameState | null {
  if (typeof raw !== 'string') return null;
  try {
    const value = JSON.parse(raw) as Partial<GameState>;
    if (value.version !== SAVE_VERSION || typeof value.phase !== 'string') return null;
    if (typeof value.seed !== 'number' || !value.rng) return null;
    return value as GameState;
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
  };
}

/** 저장 형식은 JSON 문자열 (03 5절 약속 5: JSON으로 되살릴 수 있어야 함) */
export async function saveGame(state: GameState): Promise<void> {
  await put(GAME_KEY, JSON.stringify(state));
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
