// 도트 그림을 이름으로 꺼내 그리는 부품 (04 7절). 그림이 없으면 자리표시(속성 색 상자)로.
import type { NodeType, TamerId } from '../../core/index';
import { getChip, getEnemy, getFormById, getTamer } from '../../data/index';
import { CHIP_ART, ENEMY_ART, FORM_ART, NODE_ART, TAMER_ART } from '../art/index';
import { ATTRIBUTE_BG } from './labels';
import type { PixelArt } from '../art/types';
import { PixelArtView } from './PixelArtView';

function Placeholder({
  name,
  attributeBg,
  className,
}: {
  name: string;
  attributeBg: string;
  className: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${attributeBg} p-1 text-center text-[10px] font-bold text-white ${className}`}
    >
      {name}
    </div>
  );
}

export function FormSprite({
  formId,
  className = 'h-16 w-16',
}: {
  formId: string;
  className?: string;
}) {
  const art = FORM_ART[formId];
  const form = getFormById(formId);
  if (!art)
    return (
      <Placeholder
        name={form.name}
        attributeBg={ATTRIBUTE_BG[form.attribute]}
        className={className}
      />
    );
  return <PixelArtView art={art} className={className} label={form.name} />;
}

export function EnemySprite({
  enemyId,
  className = 'h-16 w-16',
}: {
  enemyId: string;
  className?: string;
}) {
  const art = ENEMY_ART[enemyId];
  const enemy = getEnemy(enemyId);
  if (!art)
    return (
      <Placeholder
        name={enemy.name}
        attributeBg={ATTRIBUTE_BG[enemy.attribute]}
        className={className}
      />
    );
  return <PixelArtView art={art} className={className} label={enemy.name} />;
}

export function TamerFace({
  tamerId,
  className = 'h-8 w-8',
}: {
  tamerId: TamerId;
  className?: string;
}) {
  const art = TAMER_ART[tamerId];
  if (!art) return null;
  return <PixelArtView art={art} className={className} label={getTamer(tamerId).name} />;
}

export function ChipIcon({
  chipId,
  className = 'inline-block h-4 w-4',
}: {
  chipId: string;
  className?: string;
}) {
  const art = CHIP_ART[chipId];
  if (!art) return null;
  return <PixelArtView art={art} className={className} label={getChip(chipId).name} />;
}

export function NodeIcon({ type, className = 'h-6 w-6' }: { type: NodeType; className?: string }) {
  return <PixelArtView art={NODE_ART[type]} className={className} />;
}

/** 바닥 그림자 (24칸 폭, 납작한 타원). 그림 뒤, 발밑에 깔림 */
const GROUND_SHADOW: PixelArt = {
  palette: { s: 'rgba(0, 0, 0, 0.45)' },
  rows: ['.......ssssssssss.......', '....ssssssssssssssss....', '.......ssssssssss.......'],
};

/**
 * 전투용 도트: 발밑 그림자 + 숨쉬기(1칸씩 오르내림, 04 V2).
 * phase로 박자를 어긋나게 해 여럿이 함께 움직이지 않게 합니다.
 */
export function BattleSprite({
  children,
  className,
  phase = 0,
}: {
  children: React.ReactNode;
  className: string;
  phase?: number;
}) {
  return (
    <span className={`relative block ${className}`}>
      <PixelArtView art={GROUND_SHADOW} className="absolute inset-x-0 bottom-0 w-full" />
      <span
        className="spr-idle absolute inset-0 block"
        style={{ animationDelay: `${-phase * 0.37}s` }}
      >
        {children}
      </span>
    </span>
  );
}
