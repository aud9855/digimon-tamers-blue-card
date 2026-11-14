// 도트 그림 형식 (04 7절): 글자 하나 = 색 하나, '.'은 투명.
// 모두 직접 그린 것입니다. 원작 그림·공식 스프라이트를 따라 그리지 않습니다.

export interface PixelArt {
  /** 글자 → 색 (CSS 색). '.'은 쓰지 않음 (투명) */
  palette: Record<string, string>;
  /** 위에서 아래로 한 줄씩. 모든 줄의 길이가 같아야 함 */
  rows: string[];
}

/** 규격 (04 7절) */
export const ART_SIZE = {
  creature: 24,
  face: 16,
  icon: 12,
} as const;

/** 여러 그림이 함께 쓰는 색 */
export const BASE = {
  K: '#14121c', // 외곽선
  W: '#f8f8f2', // 흰색
  E: '#0b0b10', // 눈동자
} as const;

/** 팔레트에 기본 색을 더함 */
export function art(palette: Record<string, string>, rows: string[]): PixelArt {
  return { palette: { ...BASE, ...palette }, rows };
}

/**
 * size×size 칸에 맞춤: 가장 긴 줄에 맞춰 오른쪽을 채운 뒤 가로 가운데, 세로는 바닥(발)에 붙임.
 * 그릴 때 줄 길이를 일일이 맞추지 않아도 되게 하는 도우미. 크면 오류.
 */
export function fit(size: number, palette: Record<string, string>, rows: string[]): PixelArt {
  const width = Math.max(...rows.map((r) => r.length));
  if (width > size || rows.length > size) {
    throw new Error(`그림이 ${size}칸보다 큼: ${width}×${rows.length}`);
  }
  const left = Math.floor((size - width) / 2);
  const body = rows.map((r) => '.'.repeat(left) + r.padEnd(width, '.').padEnd(size - left, '.'));
  const top = Array.from({ length: size - rows.length }, () => '.'.repeat(size));
  return art(palette, [...top, ...body]);
}
