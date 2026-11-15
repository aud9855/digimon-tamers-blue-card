// library.js의 타입 (pixelfx는 JS라 쓰는 부분만 적음)

export interface FxFrame {
  w: number;
  h: number;
  ox: number;
  oy: number;
  color: Uint32Array;
  light: Uint32Array;
}

export interface FxMeta {
  name: string;
  size: [number, number];
  origin: [number, number];
  duration?: number;
  loop?: boolean;
}

export interface FxModule {
  meta: FxMeta;
}

export interface FxOptions {
  x?: number;
  y?: number;
  flip?: boolean;
  angle?: number;
  seed?: number;
  palette?: string[];
  light?: number;
  height?: number;
  [key: string]: unknown;
}

export interface FxInstance {
  meta: FxMeta;
  update(dt: number): void;
  draw(frame: FxFrame, layer?: 'back' | 'front'): void;
  stop(): void;
  done(): boolean;
}

export type FxKey =
  | 'hitSpark'
  | 'critHit'
  | 'bluntHit'
  | 'parry'
  | 'holyPillar'
  | 'collectBurst'
  | 'poof'
  | 'darkExplosion';

export const FX_MODULES: Record<FxKey, FxModule>;
export function createFrame(w: number, h: number, ox?: number, oy?: number): FxFrame;
export function clearFrame(frame: FxFrame): FxFrame;
export function createFx(mod: FxModule, o?: FxOptions): FxInstance;
export function composite(
  frame: FxFrame,
  out: Uint8ClampedArray,
  bg?: number | null,
  lightK?: number,
): Uint8ClampedArray;
export const PAL: Record<string, string[]>;
