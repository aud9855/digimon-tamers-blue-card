// 도트 팩 (04 P1): 플레이어가 자기 기기에서 고른 그림 파일로 디지몬 도트를 바꿔 그립니다.
// 그림은 이 기기의 IndexedDB에만 저장되고 저장소·배포본에는 들어가지 않습니다 (CLAUDE.md 저작권).
// 파일 이름이 디지몬 id(예: guilmon.png)이면 그 디지몬에 쓰고, 팩에 없는 디지몬은 기본 도트로 그립니다.
import { create } from 'zustand';
import { getEnemies, getForms } from '../data/index';
import { clearSpritePack, loadSpritePack, saveSpritePack } from './save';

/** 한 파일 최대 크기 (도트라 작음) */
export const PACK_FILE_MAX_BYTES = 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/gif', 'image/webp'];

/** 팩으로 바꿀 수 있는 그림 id (파트너 형태 + 적) */
export function packableIds(): string[] {
  return [...getForms().map((f) => f.id), ...getEnemies().map((e) => e.id)];
}

const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');

/** 파일 이름 → id. 확장자·대소문자·'_'·'-'·공백은 무시. 맞는 id가 없으면 null */
export function packIdFromFileName(fileName: string, ids: readonly string[]): string | null {
  // 경로가 붙어 와도 파일 이름만 씀 (\ 또는 /)
  const base = fileName
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, '');
  const key = norm(base);
  return ids.find((id) => norm(id) === key) ?? null;
}

interface PackStore {
  /** id → 화면에 쓸 주소 (object URL) */
  urls: Record<string, string>;
  setBlobs: (blobs: Record<string, Blob>) => void;
}

export const useSpritePack = create<PackStore>((set, get) => ({
  urls: {},
  setBlobs: (blobs) => {
    for (const url of Object.values(get().urls)) URL.revokeObjectURL(url);
    const urls: Record<string, string> = {};
    for (const [id, blob] of Object.entries(blobs)) urls[id] = URL.createObjectURL(blob);
    set({ urls });
  },
}));

/** 시작할 때: 저장된 팩을 불러옴 */
export async function restoreSpritePack(): Promise<void> {
  const blobs = await loadSpritePack();
  if (Object.keys(blobs).length > 0) useSpritePack.getState().setBlobs(blobs);
}

export interface ImportResult {
  added: string[];
  ignored: string[];
}

/** 고른 파일들을 팩에 더함 (같은 id는 새 파일로 바꿈) */
export async function importSpritePack(files: readonly File[]): Promise<ImportResult> {
  const ids = packableIds();
  const current = await loadSpritePack();
  const added: string[] = [];
  const ignored: string[] = [];
  for (const file of files) {
    const id = packIdFromFileName(file.name, ids);
    if (!id || !IMAGE_TYPES.includes(file.type) || file.size > PACK_FILE_MAX_BYTES) {
      ignored.push(file.name);
      continue;
    }
    current[id] = file;
    added.push(id);
  }
  await saveSpritePack(current);
  useSpritePack.getState().setBlobs(current);
  return { added, ignored };
}

export async function removeSpritePack(): Promise<void> {
  await clearSpritePack();
  useSpritePack.getState().setBlobs({});
}
