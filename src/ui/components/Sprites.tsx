// 도트 그림을 이름으로 꺼내 그리는 부품 (04 7절). 그림이 없으면 자리표시(속성 색 상자)로.
import type { NodeType, TamerId } from '../../core/index';
import { getChip, getEnemy, getFormById, getTamer } from '../../data/index';
import { CHIP_ART, ENEMY_ART, FORM_ART, NODE_ART, TAMER_ART } from '../art/index';
import { ATTRIBUTE_BG } from './labels';
import type { PixelArt } from '../art/types';
import { PixelArtView } from './PixelArtView';
import { useSpritePack } from '../spritePack';
import { OFFICIAL_SPRITE } from '../art/official';
import { spriteHeightFrac } from '../art/spriteScale';

/** 그림 파일 도트 (도트 팩·원작 도트): 칸에 맞추되 비율 유지, 바닥에 붙임, 도트가 흐려지지 않게.
 *  heightFrac < 1 이면 칸 높이의 그만큼만 쓰고 바닥 가운데에 세움 (디지몬별 크기) */
function SpriteImage({
  url,
  className,
  label,
  heightFrac = 1,
}: {
  url: string;
  className: string;
  label: string;
  heightFrac?: number;
}) {
  const img = (
    <img
      src={url}
      alt={label}
      draggable={false}
      className={`object-contain object-bottom [image-rendering:pixelated] ${heightFrac < 1 ? 'w-full' : className}`}
      style={heightFrac < 1 ? { height: `${heightFrac * 100}%` } : undefined}
    />
  );
  if (heightFrac >= 1) return img;
  return <div className={`flex items-end justify-center ${className}`}>{img}</div>;
}

/** 내 기기 도트 팩이 있으면 그것(칸을 채움), 없으면 원작 도트. scaled면 디지몬별 크기(전투·진화 화면) */
function useSpriteSource(id: string, scaled: boolean): { url: string; heightFrac: number } | null {
  const packUrl = useSpritePack((s) => s.urls[id]);
  if (packUrl) return { url: packUrl, heightFrac: 1 };
  const official = OFFICIAL_SPRITE[id];
  return official ? { url: official, heightFrac: scaled ? spriteHeightFrac(id) : 1 } : null;
}

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
  scaled = false,
  decorative = false,
}: {
  formId: string;
  className?: string;
  /** 장식 그림(카드 그림 창 등): 화면 읽기 프로그램이 이름을 읽지 않게 */
  decorative?: boolean;
  /** 디지몬별 크기로 그림 (전투·진화 화면). 도감·아이콘은 칸을 채움 */
  scaled?: boolean;
}) {
  const art = FORM_ART[formId];
  const form = getFormById(formId);
  const src = useSpriteSource(formId, scaled);
  const label = decorative ? '' : form.name;
  if (src) return <SpriteImage {...src} className={className} label={label} />;
  if (!art)
    return (
      <Placeholder
        name={form.name}
        attributeBg={ATTRIBUTE_BG[form.attribute]}
        className={className}
      />
    );
  return <PixelArtView art={art} className={className} label={label} />;
}

export function EnemySprite({
  enemyId,
  className = 'h-16 w-16',
  scaled = false,
}: {
  enemyId: string;
  className?: string;
  /** 디지몬별 크기로 그림 (전투 화면). 도감은 칸을 채움 */
  scaled?: boolean;
}) {
  const art = ENEMY_ART[enemyId];
  const enemy = getEnemy(enemyId);
  const src = useSpriteSource(enemyId, scaled);
  if (src) return <SpriteImage {...src} className={className} label={enemy.name} />;
  if (!art)
    return (
      <Placeholder
        name={enemy.name}
        attributeBg={ATTRIBUTE_BG[enemy.attribute]}
        className={className}
      />
    );
  if (scaled) {
    // 직접 그린 도트(원작 그림이 없는 디 리퍼 요원)도 디지몬별 크기로
    const frac = spriteHeightFrac(enemyId);
    return (
      <div className={`flex items-end justify-center ${className}`}>
        <div className="w-full" style={{ height: `${frac * 100}%` }}>
          <PixelArtView art={art} className="h-full w-full" label={enemy.name} />
        </div>
      </div>
    );
  }
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
