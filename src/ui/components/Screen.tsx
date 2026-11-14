import type { ReactNode } from 'react';

/** 세로 틀: 기준 폭 360px, 안전 영역을 지킴 (03 9.2) */
export function Screen({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div
      className="mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {title && <h1 className="px-4 pt-4 pb-2 text-lg font-bold">{title}</h1>}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
