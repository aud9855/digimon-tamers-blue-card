// 여러 화면이 함께 쓰는 작은 부품
import type { CSSProperties, ReactNode } from 'react';
import type { CardInstance, Stage, TamerId } from '../../core/index';
import { constants, getForm, getTamer, hasForm } from '../../data/index';
import { CardView } from './CardView';
import { FormSprite } from './Sprites';

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  tone = 'sky',
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'sky' | 'slate' | 'amber';
  testId?: string;
}) {
  const color = { sky: '', slate: 'ui-btn-slate', amber: 'ui-btn-amber' }[tone];
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`ui-btn min-h-12 ${color}`}
    >
      {children}
    </button>
  );
}

/** 덱에서 카드 한 장 고르기 (휴식 강화, 상점 지우기, 이벤트 효과). onClose가 없으면 닫을 수 없음 */
export function DeckPicker({
  title,
  cards,
  onPick,
  onClose,
  preview,
}: {
  title: string;
  cards: CardInstance[];
  onPick: (card: CardInstance) => void;
  onClose?: () => void;
  /** 고르기 전에 보여 줄 모습 (강화면 강화된 면) */
  preview?: (card: CardInstance) => { defId: string; upgraded: boolean };
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950/95" data-testid="deck-picker">
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="ui-title text-lg font-black">
            <span>{title}</span>
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg px-3 text-sm text-slate-300 active:bg-slate-800"
            >
              닫기
            </button>
          )}
        </div>
        <div className="grid flex-1 grid-cols-4 content-start gap-x-2 gap-y-3 overflow-y-auto px-4 pt-2 pb-6">
          {cards.map((card) => {
            const shown = preview ? preview(card) : card;
            return (
              <button
                key={card.uid}
                type="button"
                data-pick-uid={card.uid}
                onClick={() => onPick(card)}
                className="text-left"
              >
                <CardView defId={shown.defId} upgraded={shown.upgraded} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 이번에 얻은 것 (비트, 칩) 한 줄 */
export function GainLine({ children }: { children: ReactNode }) {
  return (
    <div className="ui-panel flex items-center gap-2 px-3 py-2 text-sm text-amber-200">
      <span className="text-amber-300">✦</span>
      {children}
    </div>
  );
}

/** 화면 제목: 작은 머리글 + 비스듬한 제목 띠 (04 B2). accent는 화면마다 다른 강조 색 */
export function ScreenTitle({
  kicker,
  children,
  accent = '#38bdf8',
  center = false,
}: {
  kicker?: ReactNode;
  children: ReactNode;
  accent?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 ${center ? 'items-center text-center' : 'items-start'}`}
      style={{ '--accent': accent } as CSSProperties}
    >
      {kicker && <p className="ui-kicker">{kicker}</p>}
      <h1 className="ui-title text-2xl font-black text-white">
        <span>{children}</span>
      </h1>
    </div>
  );
}

/** 화면 가운데 주인공 그림: 빛줄기 + 발밑 그림자 + 디지몬 도트. ray는 "r g b" */
export function Hero({
  formId,
  size = 128,
  ray = '125 211 252',
  dim = false,
  children,
}: {
  formId?: string;
  size?: number;
  ray?: string;
  /** 패배 화면처럼 흐리게 */
  dim?: boolean;
  /** 디지몬 대신(또는 옆에) 그릴 것 */
  children?: ReactNode;
}) {
  return (
    <div
      className="relative mx-auto flex items-end justify-center"
      style={{ width: size * 1.6, height: size }}
    >
      {!dim && <div className="ui-rays" style={{ '--ray': ray } as CSSProperties} />}
      <span className="absolute bottom-0 left-1/2 h-3 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/45" />
      {formId && (
        <FormSprite
          formId={formId}
          className={`relative h-full w-full ${dim ? '[filter:grayscale(1)_brightness(0.6)]' : '[filter:drop-shadow(0_0_2px_#fff)]'}`}
        />
      )}
      {children}
    </div>
  );
}

/** 직접 그린 도트 모닥불 (휴식 화면). 두 장면이 번갈아 깜빡임 */
const FIRE_A = [
  '....r.....',
  '...rr..r..',
  '...ryr.rr.',
  '..ryyrrry.',
  '..ryyyyyr.',
  '.rryyWyyrr',
  '.ryyWWWyyr',
  '..ryyWyyr.',
  'bb.rrrrr.bb',
  '.bbbbbbbb.',
];
const FIRE_B = [
  '.....r....',
  '..r..rr...',
  '.rr.ryr...',
  '.ryrrryyr.',
  '.ryyyyyr..',
  'rryyWyyrr.',
  'ryyWWWyyr.',
  '.ryyWyyr..',
  'bb.rrrrr.bb',
  '.bbbbbbbb.',
];
const FIRE_COLOR: Record<string, string> = {
  r: '#f97316',
  y: '#fde047',
  W: '#fffbeb',
  b: '#78350f',
};
function fireRects(rows: string[]) {
  return rows.flatMap((row, y) =>
    [...row].map((c, x) =>
      FIRE_COLOR[c] ? (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FIRE_COLOR[c]} />
      ) : null,
    ),
  );
}
export function PixelFire({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <span className={`relative block ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 11 10"
        shapeRendering="crispEdges"
        className="absolute inset-0 h-full w-full"
      >
        {fireRects(FIRE_A)}
      </svg>
      <svg
        viewBox="0 0 11 10"
        shapeRendering="crispEdges"
        className="ui-flicker absolute inset-0 h-full w-full [animation:ui-flicker_0.6s_steps(1)_infinite]"
      >
        {fireRects(FIRE_B)}
      </svg>
    </span>
  );
}

/** 화면에 보여 줄 파트너 형태: 그 단계까지 중 실제 있는 가장 높은 형태 (임프몬 계열처럼 중간이 없는 계열 대비) */
export function displayFormId(tamerId: TamerId, maxStage: Stage): string {
  const line = getTamer(tamerId).line;
  const order = constants.STAGE_ORDER;
  for (let i = order.indexOf(maxStage); i >= 0; i--) {
    const stage = order[i]!;
    if (hasForm(line, stage)) return getForm(line, stage).id;
  }
  return getForm(line, 'rookie').id;
}
