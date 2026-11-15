// 2판 도트 조립기 (04 7절 2판): 부품(타원·캡슐·다각형)을 놓으면 명암·안쪽 선·외곽선을 자동으로 칠합니다.
// 빛은 왼쪽 위 앞에서 옵니다. 눈·무늬·발톱 같은 작은 부분은 글자 격자(stamp)로 직접 찍습니다.
// 모두 직접 만든 그림입니다. 원작 그림을 따라 그리지 않습니다.
import { BASE, outlineOf, type PixelArt } from './types';

/** 재질: 밝은 색 → 기본 → 그림자 (3톤). 4개면 맨 앞이 반짝임 */
export type Ramp = readonly string[];

interface PartBase {
  ramp: Ramp;
  /** 뒤 부품과 닿는 가장자리에 안쪽 선 (기본: 재질이 다를 때만) */
  line?: boolean;
  /** 명암 없이 기본 색만 */
  flat?: boolean;
}
export type Part =
  | (PartBase & { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot?: number })
  | (PartBase & {
      kind: 'capsule';
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      r0: number;
      r1?: number;
    })
  | (PartBase & { kind: 'poly'; pts: readonly (readonly [number, number])[] });

export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ramp: Ramp,
  opt: Partial<PartBase> & { rot?: number } = {},
): Part => ({ kind: 'ellipse', cx, cy, rx, ry, ramp, ...opt });

export const capsule = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r0: number,
  ramp: Ramp,
  opt: Partial<PartBase> & { r1?: number } = {},
): Part => ({ kind: 'capsule', x0, y0, x1, y1, r0, ramp, ...opt });

export const poly = (
  pts: readonly (readonly [number, number])[],
  ramp: Ramp,
  opt: Partial<PartBase> = {},
): Part => ({ kind: 'poly', pts, ramp, ...opt });

/** 직접 찍는 작은 그림: 왼쪽 위 (x, y)부터, '.'은 건너뜀 */
export interface Stamp {
  x: number;
  y: number;
  rows: readonly string[];
  palette: Record<string, string>;
}
export const stamp = (
  x: number,
  y: number,
  palette: Record<string, string>,
  rows: readonly string[],
): Stamp => ({ x, y, rows, palette });

const LIGHT = (() => {
  const v = [-0.5, -0.62, 0.6];
  const n = Math.hypot(...v);
  return v.map((c) => c / n) as [number, number, number];
})();

/** 부품 안이면 법선(nx, ny, nz), 밖이면 null */
function sample(p: Part, x: number, y: number): [number, number, number] | null {
  if (p.kind === 'ellipse') {
    let dx = x - p.cx;
    let dy = y - p.cy;
    if (p.rot) {
      const c = Math.cos(-p.rot);
      const s = Math.sin(-p.rot);
      [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
    }
    const u = dx / p.rx;
    const v = dy / p.ry;
    const d = u * u + v * v;
    if (d > 1) return null;
    let nx = u;
    let ny = v;
    if (p.rot) {
      const c = Math.cos(p.rot);
      const s = Math.sin(p.rot);
      [nx, ny] = [nx * c - ny * s, nx * s + ny * c];
    }
    return [nx, ny, Math.sqrt(Math.max(0, 1 - d))];
  }
  if (p.kind === 'capsule') {
    const vx = p.x1 - p.x0;
    const vy = p.y1 - p.y0;
    const len2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((x - p.x0) * vx + (y - p.y0) * vy) / len2));
    const r = p.r0 + ((p.r1 ?? p.r0) - p.r0) * t;
    const ox = x - (p.x0 + vx * t);
    const oy = y - (p.y0 + vy * t);
    const d = Math.hypot(ox, oy);
    if (d > r) return null;
    const k = d / r;
    return [ox / r, oy / r, Math.sqrt(Math.max(0, 1 - k * k))];
  }
  // 다각형: 짝홀 규칙, 법선은 앞쪽(평면)
  let inside = false;
  const pts = p.pts;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i] as readonly [number, number];
    const [xj, yj] = pts[j] as readonly [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside ? [0, 0, 1] : null;
}

function tone(ramp: Ramp, n: [number, number, number], flat: boolean): string {
  const base = ramp.length >= 4 ? 1 : 0; // 4톤이면 0번은 반짝임
  if (flat) return ramp[base + 1] as string;
  const l = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
  if (ramp.length >= 4 && l > 0.93) return ramp[0] as string;
  if (l > 0.62) return ramp[base] as string;
  if (l > 0.12) return ramp[base + 1] as string;
  return ramp[base + 2] as string;
}

const KEYS =
  'ABCDEFGHIJLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()+=-_~:;<>?/|[]{}';

/**
 * 부품과 찍기로 size×size 도트를 만듦.
 * 순서: 부품(뒤→앞) 칠하기 → 안쪽 선 → 찍기 → 바깥 외곽선(selout).
 * 다각형은 법선이 없으므로 가장자리 규칙(왼쪽 위 밝게, 오른쪽 아래 그림자)으로 명암을 줍니다.
 */
export function build(
  size: number,
  parts: readonly Part[],
  stamps: readonly Stamp[] = [],
): PixelArt {
  const owner: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));
  const color: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  parts.forEach((p, i) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = sample(p, x + 0.5, y + 0.5);
        if (!n) continue;
        owner[y]![x] = i;
        color[y]![x] = tone(p.ramp, n, !!p.flat);
      }
    }
  });

  // 다각형 가장자리 명암, 앞 부품의 안쪽 선
  const final = color.map((r) => r.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = owner[y]![x]!;
      if (i < 0) continue;
      const p = parts[i]!;
      const at = (dx: number, dy: number) => owner[y + dy]?.[x + dx] ?? -1;
      const base = p.ramp.length >= 4 ? 1 : 0;
      if (p.kind === 'poly' && !p.flat) {
        if (at(1, 0) !== i || at(0, 1) !== i) final[y]![x] = p.ramp[base + 2] as string;
        else if (at(-1, 0) !== i || at(0, -1) !== i) final[y]![x] = p.ramp[base] as string;
      }
      // 뒤에 있는 다른 재질 부품과 닿으면 안쪽 선
      const behind = [at(1, 0), at(-1, 0), at(0, 1), at(0, -1)].filter(
        (j) => j >= 0 && j < i && (p.line ?? parts[j]!.ramp !== p.ramp),
      );
      if (behind.length > 0 && p.line !== false) {
        final[y]![x] = outlineOf(p.ramp[base + 2] as string, 0.45);
      }
    }
  }

  for (const s of stamps) {
    s.rows.forEach((row, dy) => {
      [...row].forEach((ch, dx) => {
        if (ch === '.' || ch === ' ') return;
        const c = s.palette[ch] ?? (BASE as Record<string, string>)[ch];
        const yy = s.y + dy;
        const xx = s.x + dx;
        if (!c || yy < 0 || yy >= size || xx < 0 || xx >= size) return;
        final[yy]![xx] = c;
        if (owner[yy]![xx]! < 0) owner[yy]![xx] = parts.length; // 찍기만 있는 칸도 몸으로 침
      });
    });
  }

  // 바깥 외곽선: 빈 칸 중 몸과 맞닿은 칸 = 가장 어두운 이웃 색의 외곽선 톤
  const lum = (c: string) => {
    const n = parseInt(c.slice(1), 16);
    return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11;
  };
  const withLine = final.map((r) => r.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (final[y]![x]) continue;
      const around = [
        final[y - 1]?.[x],
        final[y + 1]?.[x],
        final[y]?.[x - 1],
        final[y]?.[x + 1],
      ].filter((c): c is string => !!c && c.startsWith('#') && c.length === 7);
      if (around.length === 0) continue;
      const darkest = around.reduce((a, b) => (lum(b) < lum(a) ? b : a));
      withLine[y]![x] = outlineOf(darkest);
    }
  }

  // 색 → 글자
  const keyOf = new Map<string, string>();
  const palette: Record<string, string> = {};
  const rows = withLine.map((r) =>
    r
      .map((c) => {
        if (!c) return '.';
        let k = keyOf.get(c);
        if (!k) {
          k = KEYS[keyOf.size];
          if (!k) throw new Error('색이 너무 많음');
          keyOf.set(c, k);
          palette[k] = c;
        }
        return k;
      })
      .join(''),
  );
  return { palette, rows };
}
