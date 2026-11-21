import type { CSSProperties, ReactNode } from 'react';
import { battleBackground } from '../art/stage';
import { useGame } from '../store';

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
    <div className="relative h-full w-full">
      <SideBackdrop />
      <div
        className="relative mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-[#0b1220] min-[481px]:shadow-[0_0_24px_#000]"
        style={style}
      >
        {title && <h1 className="px-4 pt-4 pb-2 text-lg font-bold">{title}</h1>}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

/** 넓은 화면(가로 화면 웹 등)에서 세로 판 양옆을 지금 막 배경으로 흐리게 채움 */
function SideBackdrop() {
  // 막 번호만 구독 (재생 단계마다 다시 그리지 않게)
  const act = useGame((s) => (s.view ?? s.state).run?.act ?? 1);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden bg-cover bg-center blur-[2px] brightness-[0.35] min-[481px]:block"
      style={{ backgroundImage: `url(${battleBackground(act)})` }}
    />
  );
}
