// 재생 중인 일 하나를 연출 (04 T1-4). 재생 중에는 화면 전체를 덮어 입력을 막고, 누르면 건너뜀.
import { useLayoutEffect, useState, type CSSProperties } from 'react';
import type { GameState, Who } from '../../core/index';
import { getCard, getChip, getEnemy, getForm, getFormById, getTamer } from '../../data/index';
import { eventDuration } from '../playback';
import { useGame, type PlaybackItem } from '../store';
import { CardView } from './CardView';
import { ATTRIBUTE_BG, STAGE_LABEL, STATUS_LABEL } from './labels';

function targetSelector(who: Who): string {
  return who === 'player' ? '[data-testid="partner"]' : `[data-enemy-index="${who}"]`;
}

/** 대상 요소의 가운데 좌표 */
function usePosition(selector: string | null, seqKey: number) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    if (!selector) return setPos(null);
    const el = document.querySelector(selector);
    if (!el) return setPos(null);
    const r = el.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top + r.height / 3 });
  }, [selector, seqKey]);
  return pos;
}

function Floating({
  who,
  text,
  className,
  item,
  ms,
}: {
  who: Who;
  text: string;
  className: string;
  item: PlaybackItem;
  ms: number;
}) {
  const pos = usePosition(targetSelector(who), item.seq);
  if (!pos) return null;
  return (
    <div
      key={item.seq}
      className={`fx-float pointer-events-none fixed text-2xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] ${className}`}
      style={{ left: pos.x, top: pos.y, '--fx-ms': `${ms}ms` } as CSSProperties}
    >
      {text}
    </div>
  );
}

function Center({
  item,
  ms,
  children,
}: {
  item: PlaybackItem;
  ms: number;
  children: React.ReactNode;
}) {
  return (
    <div
      key={item.seq}
      className="fx-pop pointer-events-none fixed top-[38%] left-1/2"
      style={{ '--fx-ms': `${ms}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function Effect({ item, view, ms }: { item: PlaybackItem; view: GameState; ms: number }) {
  const e = item.event;
  switch (e.type) {
    case 'damage': {
      const lost = e.hpLost + e.tempHpLost;
      const text = lost > 0 ? `-${lost}` : e.blocked > 0 ? '막음' : '0';
      const color =
        e.target === 'player' ? 'text-rose-400' : e.attrMult > 1 ? 'text-amber-300' : 'text-white';
      return <Floating who={e.target} text={text} className={color} item={item} ms={ms} />;
    }
    case 'hpLost':
      return (
        <Floating
          who="player"
          text={`-${e.amount}`}
          className="text-fuchsia-400"
          item={item}
          ms={ms}
        />
      );
    case 'healed':
      return (
        <Floating
          who="player"
          text={`+${e.amount}`}
          className="text-lime-300"
          item={item}
          ms={ms}
        />
      );
    case 'shieldGained':
      return (
        <Floating
          who={e.target}
          text={`🛡+${e.amount}`}
          className="text-slate-200"
          item={item}
          ms={ms}
        />
      );
    case 'statusApplied':
      return (
        <Floating
          who={e.target}
          text={`${STATUS_LABEL[e.status]} ${e.amount > 0 ? '+' : ''}${e.amount}`}
          className="text-base text-amber-200"
          item={item}
          ms={ms}
        />
      );
    case 'accelChanged':
      return e.accel > 0 ? (
        <Floating
          who={e.enemyIndex}
          text={`가속 ${e.accel}`}
          className="text-base text-rose-300"
          item={item}
          ms={ms}
        />
      ) : null;
    case 'enemyDied':
      return (
        <Floating
          who={e.enemyIndex}
          text="쓰러짐"
          className="text-base text-slate-300"
          item={item}
          ms={ms}
        />
      );
    case 'cardPlayed':
      // 카드 슬래시: 낸 카드가 화면 가운데로 올라오며 빛줄기가 지나감
      return item.card ? (
        <div key={item.seq} className="pointer-events-none fixed inset-0">
          <div
            className="fx-slash fixed top-1/2 left-1/2 w-28"
            style={{ '--fx-ms': `${ms}ms` } as CSSProperties}
          >
            <CardView defId={item.card.defId} upgraded={item.card.upgraded} />
          </div>
          <div
            className="fx-streak fixed top-1/2 left-1/2 h-2 w-[140vw] max-w-[700px] origin-left rounded-full bg-gradient-to-r from-transparent via-sky-200 to-transparent"
            style={{ '--fx-ms': `${ms}ms` } as CSSProperties}
          />
        </div>
      ) : null;
    case 'evolved': {
      const run = view.run;
      if (!run) return null;
      const line = getTamer(run.tamerId).line;
      const from = getForm(line, e.from);
      const to = getFormById(e.formId);
      return (
        <div key={item.seq} className="pointer-events-none fixed inset-x-0 top-1/3 overflow-hidden">
          <div
            className={`fx-cutin ${ATTRIBUTE_BG[to.attribute]} py-5 text-center text-white shadow-2xl`}
            style={{ '--fx-ms': `${ms}ms` } as CSSProperties}
          >
            <div className="text-xs tracking-[0.4em] opacity-80">DIGIVOLUTION</div>
            <div className="mt-1 text-2xl font-black">
              {from.name} 진화! {to.name}
            </div>
            <div className="text-xs opacity-80">{STAGE_LABEL[e.to]}</div>
          </div>
        </div>
      );
    }
    case 'enemyMoved': {
      const enemy = view.battle?.enemies[e.enemyIndex];
      const move = enemy ? getEnemy(enemy.defId).moves.find((m) => m.id === e.moveId) : undefined;
      return (
        <Floating
          who={e.enemyIndex}
          text={move?.name ?? ''}
          className="rounded bg-slate-900/80 px-2 text-base text-white"
          item={item}
          ms={ms}
        />
      );
    }
    case 'turnStarted':
      return (
        <Center item={item} ms={ms}>
          <div className="rounded-xl bg-slate-900/90 px-6 py-3 text-xl font-black">턴 {e.turn}</div>
        </Center>
      );
    case 'chipTriggered':
      return (
        <Floating
          who="player"
          text={getChip(e.chipId).name}
          className="rounded bg-sky-900/80 px-2 text-sm text-sky-100"
          item={item}
          ms={ms}
        />
      );
    case 'companionTriggered': {
      const card = view.battle?.companions.find((c) => c.uid === e.cardUid);
      return card ? (
        <Floating
          who="player"
          text={getCard(card.defId).name}
          className="rounded bg-lime-900/80 px-2 text-sm text-lime-100"
          item={item}
          ms={ms}
        />
      ) : null;
    }
    case 'battleEnded':
      return (
        <Center item={item} ms={ms}>
          <div
            className={`rounded-2xl px-8 py-4 text-3xl font-black ${
              e.won ? 'bg-amber-500 text-slate-900' : 'bg-rose-800 text-white'
            }`}
          >
            {e.won ? '승리!' : '패배'}
          </div>
        </Center>
      );
    default:
      return null;
  }
}

export function PlaybackOverlay() {
  const view = useGame((s) => s.view);
  const current = useGame((s) => s.current);
  const speed = useGame((s) => s.speed);
  const skip = useGame((s) => s.skipPlayback);
  if (!view) return null;
  return (
    <div
      className="fixed inset-0 z-50"
      data-testid="playback"
      onPointerDown={(e) => {
        e.preventDefault();
        skip();
      }}
    >
      {current && (
        <Effect item={current} view={view} ms={Math.max(1, eventDuration(current.event, speed))} />
      )}
    </div>
  );
}
