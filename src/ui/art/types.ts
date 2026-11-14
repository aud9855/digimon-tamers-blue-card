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
