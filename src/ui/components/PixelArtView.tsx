// 도트 그림을 SVG로 그림 (04 7절). 같은 색이 가로로 이어지면 사각형 하나로 묶습니다.
import { memo } from 'react';
import type { PixelArt } from '../art/types';

interface Run {
  x: number;
  y: number;
  w: number;
  color: string;
}

/** 줄마다 같은 색이 이어진 구간 */
export function pixelRuns(art: PixelArt): Run[] {
  const runs: Run[] = [];
  art.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x] as string;
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const color = art.palette[ch];
      if (ch !== '.' && ch !== ' ' && color) runs.push({ x, y, w: end - x, color });
      x = end;
    }
  });
  return runs;
}

export const PixelArtView = memo(function PixelArtView({
  art,
  className = '',
  label,
}: {
  art: PixelArt;
  className?: string;
  /** 화면 읽기용 이름 */
  label?: string;
}) {
  const w = art.rows[0]?.length ?? 0;
  const h = art.rows.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {pixelRuns(art).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} />
      ))}
    </svg>
  );
});
