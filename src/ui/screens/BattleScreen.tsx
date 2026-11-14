// 전투 화면 (03 9.2 배치: 적·인텐트 → 파트너·진화 → 메모리 → 손패 → 턴 끝·더미)
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  getLegalActions,
  previewOverdraw,
  type Action,
  type CardInstance,
  type GameState,
} from '../../core/index';
import { CardView } from '../components/CardView';
import { EnemyView } from '../components/EnemyView';
import { Hand } from '../components/Hand';
import { MemoryGauge } from '../components/MemoryGauge';
import { PartnerView } from '../components/PartnerView';
import { Screen } from '../components/Screen';
import { enemyIndexAt, useCardPointer } from '../input/drag';
import { useDisplayState, useGame } from '../store';
import type { PlaybackSpeed } from '../playback';

type PlayAction = Extract<Action, { type: 'playCard' }>;

export interface BattleViewProps {
  state: GameState;
  /** 고른 카드 */
  selectedUid?: number | null;
  /** 낼 수 있는 카드인지 (없으면 모두 보통으로) */
  playable?: (card: CardInstance) => boolean;
  /** 대상으로 고를 수 있는 적 */
  targetable?: Set<number>;
  onEnemySelect?: (index: number) => void;
  onEvolve?: () => void;
  onCardPointerDown?: (card: CardInstance, e: React.PointerEvent) => void;
  /** 적과 파트너 사이 (내기 영역, 경고) */
  middle?: ReactNode;
  /** 맨 아래 오른쪽 (턴 끝 버튼) */
  footer?: ReactNode;
  /** 맨 위 오른쪽 (재생 속도) */
  headerRight?: ReactNode;
  handRef?: React.Ref<HTMLDivElement>;
}

/** 상태를 받아 그리기만 함 (테스트에서 바로 씀) */
export function BattleView({
  state,
  selectedUid = null,
  playable,
  targetable,
  onEnemySelect,
  onEvolve,
  onCardPointerDown,
  middle,
  footer,
  headerRight,
  handRef,
}: BattleViewProps) {
  const battle = state.battle;
  const run = state.run;
  if (!battle || !run) return null;

  return (
    <Screen>
      <div className="flex items-center justify-between px-4 pt-2 text-xs text-slate-400">
        <span>
          {run.act}막 ·{' '}
          {battle.kind === 'boss' ? '보스' : battle.kind === 'elite' ? '강적' : '전투'}
        </span>
        <span className="flex items-center gap-2">
          턴 {battle.turn}
          {headerRight}
        </span>
      </div>

      {/* 적과 인텐트 */}
      <div className="flex justify-center gap-1 px-2 pt-2" data-testid="enemies">
        {battle.enemies.map((_, i) => (
          <EnemyView
            key={i}
            state={state}
            index={i}
            targetable={targetable?.has(i) ?? false}
            onSelect={targetable?.has(i) && onEnemySelect ? () => onEnemySelect(i) : undefined}
          />
        ))}
      </div>

      {/* 가운데 (내기 영역·경고): 자리가 모자라면 적 쪽으로 겹쳐 뜸 */}
      <div className="relative min-h-2 flex-1">
        <div className="pointer-events-none absolute inset-x-4 bottom-2 z-20 flex flex-col items-center [&_button]:pointer-events-auto">
          {middle}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <PartnerView state={state} onEvolve={onEvolve} />
        <MemoryGauge memory={battle.memory} maxMemory={run.maxMemory} />
        <div ref={handRef}>
          <Hand
            state={state}
            cards={battle.hand}
            playable={playable}
            selectedUid={selectedUid}
            onCardPointerDown={onCardPointerDown}
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-4 pb-3 text-xs text-slate-400">
          <span data-testid="piles">
            뽑을 {battle.drawPile.length} · 버림 {battle.discardPile.length}
            {battle.exhaustPile.length > 0 ? ` · 소멸 ${battle.exhaustPile.length}` : ''}
          </span>
          {footer}
        </div>
      </div>
    </Screen>
  );
}

const NEXT_SPEED: Record<PlaybackSpeed, PlaybackSpeed> = {
  normal: 'fast',
  fast: 'off',
  off: 'normal',
};
const SPEED_LABEL: Record<PlaybackSpeed, string> = {
  normal: '연출 ▶',
  fast: '연출 ▶▶',
  off: '연출 끔',
};

/** 이만큼 위로 끌어 놓으면 대상이 필요 없는 카드를 냄 (px, 손패 위쪽 기준) */
const DROP_ABOVE_HAND = 40;

export function BattleScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [zoom, setZoom] = useState<CardInstance | null>(null);
  const [drag, setDrag] = useState<{ card: CardInstance; x: number; y: number } | null>(null);
  const [evolveArmed, setEvolveArmed] = useState(false);
  const handRef = useRef<HTMLDivElement>(null);

  const legal = useMemo(() => getLegalActions(state), [state]);
  const playsOf = (uid: number): PlayAction[] =>
    legal.filter((a): a is PlayAction => a.type === 'playCard' && a.cardUid === uid);
  const playable = (card: CardInstance) => playsOf(card.uid).length > 0;
  const needsTarget = (uid: number) => playsOf(uid)[0]?.targetIndex !== undefined;

  const reset = () => {
    setSelectedUid(null);
    setEvolveArmed(false);
  };

  const play = (uid: number, targetIndex?: number) => {
    const action = playsOf(uid).find((a) => a.targetIndex === targetIndex);
    if (!action) return false;
    reset();
    dispatch(action);
    return true;
  };

  const onCardPointerDown = useCardPointer({
    onTap: (card) => {
      setEvolveArmed(false);
      if (!playable(card)) return;
      setSelectedUid((cur) => (cur === card.uid ? null : card.uid));
    },
    onLongPressStart: (card) => setZoom(card),
    onLongPressEnd: () => setZoom(null),
    canDrag: (card) => playable(card),
    onDragMove: (card, x, y) => {
      setSelectedUid(card.uid);
      setDrag({ card, x, y });
    },
    onDrop: (card, x, y) => {
      setDrag(null);
      if (needsTarget(card.uid)) {
        const target = enemyIndexAt(x, y);
        if (target !== null && play(card.uid, target)) return;
      } else {
        const handTop = handRef.current?.getBoundingClientRect().top ?? Infinity;
        if (y < handTop - DROP_ABOVE_HAND && play(card.uid)) return;
      }
      setSelectedUid(null);
    },
    onDragCancel: () => {
      setDrag(null);
      setSelectedUid(null);
    },
  });

  const battle = state.battle;
  if (!battle) return null;

  const selected = battle.hand.find((c) => c.uid === selectedUid) ?? null;
  const targetable = new Set(
    selected ? playsOf(selected.uid).flatMap((a) => a.targetIndex ?? []) : [],
  );
  const canEvolve = legal.some((a) => a.type === 'evolve');
  const evolveAccel = canEvolve ? previewOverdraw(state, 'evolve') : 0;
  const selectedAccel = selected ? previewOverdraw(state, { cardUid: selected.uid }) : 0;

  const onEvolve = canEvolve
    ? () => {
        // 당겨써야 하는 진화는 한 번 더 눌러야 함 (경고를 먼저 보여 줌)
        if (evolveAccel > 0 && !evolveArmed) {
          setSelectedUid(null);
          setEvolveArmed(true);
          return;
        }
        reset();
        dispatch({ type: 'evolve' });
      }
    : undefined;

  let middle: ReactNode = null;
  if (evolveArmed) {
    middle = <OverdrawWarning accel={evolveAccel} label="진화 버튼을 한 번 더 누르면 진화" />;
  } else if (selected && !drag) {
    middle = (
      <div className="flex w-full flex-col items-center gap-2">
        {selectedAccel > 0 && <OverdrawWarning accel={selectedAccel} />}
        {needsTarget(selected.uid) ? (
          <p className="text-sm text-sky-300">대상으로 삼을 적을 누르세요</p>
        ) : (
          <button
            type="button"
            data-testid="play-zone"
            onClick={() => play(selected.uid)}
            className="min-h-14 w-full max-w-xs rounded-xl border-2 border-dashed border-sky-400 text-sm font-bold text-sky-200 active:bg-sky-900"
          >
            여기를 눌러 내기
          </button>
        )}
      </div>
    );
  } else if (drag) {
    middle = (
      <div className="flex flex-col items-center gap-2">
        {previewOverdraw(state, { cardUid: drag.card.uid }) > 0 && (
          <OverdrawWarning accel={previewOverdraw(state, { cardUid: drag.card.uid })} />
        )}
        <p className="text-sm text-sky-300">
          {needsTarget(drag.card.uid) ? '적 위에 놓으세요' : '위로 올려 놓으면 냄'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full"
      onPointerDown={(e) => {
        // 빈 곳을 누르면 고르기 취소
        if ((e.target as HTMLElement).closest('[data-card-uid],[data-enemy-index],button')) return;
        reset();
      }}
    >
      <BattleView
        state={state}
        selectedUid={selectedUid}
        playable={playable}
        targetable={targetable}
        onEnemySelect={(i) => selected && play(selected.uid, i)}
        onEvolve={onEvolve}
        onCardPointerDown={onCardPointerDown}
        handRef={handRef}
        middle={middle}
        headerRight={
          <button
            type="button"
            data-testid="speed"
            onClick={() => setSpeed(NEXT_SPEED[speed])}
            className="-my-3 min-h-11 min-w-11 rounded-lg px-2 text-slate-300 active:bg-slate-800"
          >
            {SPEED_LABEL[speed]}
          </button>
        }
        footer={
          <button
            type="button"
            data-testid="end-turn"
            onClick={() => {
              reset();
              dispatch({ type: 'endTurn' });
            }}
            className="min-h-11 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white active:bg-amber-500"
          >
            턴 끝
          </button>
        }
      />
      {drag && (
        <div
          className="pointer-events-none fixed z-30 w-16 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <CardView defId={drag.card.defId} upgraded={drag.card.upgraded} state={state} />
        </div>
      )}
      {zoom && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <CardView defId={zoom.defId} upgraded={zoom.upgraded} state={state} size="large" />
        </div>
      )}
    </div>
  );
}

function OverdrawWarning({ accel, label }: { accel: number; label?: string }) {
  return (
    <div className="rounded-lg bg-rose-950 px-3 py-2 text-center text-sm text-rose-200">
      <b>당겨쓰기!</b> 턴을 끝내면 적 가속 +{accel}
      {label && <div className="mt-1 text-xs text-rose-300">{label}</div>}
    </div>
  );
}
