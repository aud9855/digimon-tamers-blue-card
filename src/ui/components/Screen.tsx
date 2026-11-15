import type { CSSProperties, ReactNode } from 'react';
import { battleBackground } from '../art/stage';

/** 세로 틀: 기준 폭 360px, 안전 영역을 지킴 (03 9.2).
 *  backdrop(막 번호)을 주면 그 막의 배경을 어둡게 깔아 지금 있는 곳이 느껴지게 함 (04 B2) */
export function Screen({
  title,
  children,
  backdrop,
}: {
  title?: string;
  children: ReactNode;
  backdrop?: number;
}) {
  const style: CSSProperties = {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  };
  if (backdrop !== undefined) {
    Object.assign(style, {
      backgroundImage: `linear-gradient(180deg, rgb(11 18 32 / 0.3), rgb(11 18 32 / 0.78) 42%, #0b1220 78%), url(${battleBackground(backdrop)})`,
      backgroundSize: '100% 100%, 100% auto',
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
    } satisfies CSSProperties);
  }
  return (
    <div
      className="mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden"
      style={style}
    >
      {title && <h1 className="px-4 pt-4 pb-2 text-lg font-bold">{title}</h1>}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
