// 도트 그림을 이름으로 꺼내 그리는 부품 (04 7절). 그림이 없으면 자리표시(속성 색 상자)로.
import type { NodeType, TamerId } from '../../core/index';
import { getChip, getEnemy, getFormById, getTamer } from '../../data/index';
import { CHIP_ART, ENEMY_ART, FORM_ART, NODE_ART, TAMER_ART } from '../art/index';
import { ATTRIBUTE_BG } from './labels';
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
