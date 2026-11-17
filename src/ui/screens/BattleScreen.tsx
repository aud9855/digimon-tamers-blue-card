// 전투 화면 (03 9.2). 위쪽 무대에 막별 배경을 깔고 적은 오른쪽 위, 파트너는 왼쪽 아래에서 마주 봄 (04 B1 배치 B).
// 그 아래 메모리 → 손패 → 턴 끝·더미
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  getLegalActions,
  previewOverdraw,
  type Action,
  type CardInstance,
  type GameState,
} from '../../core/index';
import { getCard } from '../../data/index';
import { CardView } from '../components/CardView';
import { EnemyView } from '../components/EnemyView';
import { Hand } from '../components/Hand';
import { MemoryGauge } from '../components/MemoryGauge';
import { PartnerView } from '../components/PartnerView';
import { Screen } from '../components/Screen';
import { SettingsButton } from '../components/Settings';
import { enemyIndexAt, useCardPointer } from '../input/drag';
import { useDisplayState, useGame } from '../store';
import { battleBackground } from '../art/stage';
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
  onRampage?: () => void;
  onCardPointerDown?: (card: CardInstance, e: React.PointerEvent) => void;
  /** 적과 파트너 사이 (내기 영역, 경고) */
  middle?: ReactNode;
  /** 맨 아래 오른쪽 (턴 끝 버튼) */
  footer?: ReactNode;
  /** 맨 위 오른쪽 (재생 속도) */
  headerRight?: ReactNode;
  headerRightExtra?: ReactNode;
  handRef?: React.Ref<HTMLDivElement>;
}

/** 무대 높이를 아직 모를 때(서버 렌더·첫 그림) 쓰는 값 (360×640 기준) */
const FIELD_DEFAULT_HEIGHT = 320;
/** 적 칸에서 그림 말고 차지하는 높이 (인텐트·이름·HP·상태 줄, px) */
const ENEMY_CHROME = 80;
/** 무대 아래쪽 파트너 줄(진화 버튼) 높이 (px) */
const PARTNER_ROW = 64;
const ENEMY_MIN_SIZE = 56;
/** 왼쪽 적일수록 이만큼씩 아래로 (대각선, px). 글 줄이 겹치지 않을 만큼 */
const ENEMY_STAGGER = 20;

/** 요소 높이를 재서 돌려줌 (크기가 바뀌면 다시 잼) */
function useHeight(initial: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setHeight(el.clientHeight);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);
  return { ref, height };
}

/** 상태를 받아 그리기만 함 (테스트에서 바로 씀) */
export function BattleView({
  state,
  selectedUid = null,
  playable,
  targetable,
  onEnemySelect,
  onEvolve,
  onRampage,
  onCardPointerDown,
  middle,
  footer,
  headerRight,
  headerRightExtra,
  handRef,
}: BattleViewProps) {
  const battle = state.battle;
  const run = state.run;
  const { ref: fieldRef, height: fieldHeight } = useHeight(FIELD_DEFAULT_HEIGHT);
  if (!battle || !run) return null;

  const enemyCount = battle.enemies.length;
  // 적이 적을수록 크게. 무대가 낮으면(작은 화면) 파트너 줄(진화 버튼)과 겹치지 않게 줄임
  const baseSize = enemyCount <= 1 ? 104 : enemyCount === 2 ? 92 : 80;
  const stagger = (enemyCount - 1) * ENEMY_STAGGER;
  const enemySize = Math.max(
    ENEMY_MIN_SIZE,
    Math.min(baseSize, fieldHeight - ENEMY_CHROME - PARTNER_ROW - stagger),
  );
  return (
    <Screen>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto [image-rendering:pixelated]"
        style={{
          backgroundImage: `url(${battleBackground(run.act)})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
        }}
        data-testid="stage"
      >
        <div className="flex items-center justify-between px-4 pt-2 text-xs text-slate-300 [text-shadow:0_1px_0_#000]">
          <span>
            {run.act}막 ·{' '}
            {battle.kind === 'boss' ? '보스' : battle.kind === 'elite' ? '강적' : '전투'}
          </span>
          <span className="flex items-center gap-2">
            턴 {battle.turn}
            {headerRight}
            {headerRightExtra}
          </span>
        </div>

        {/* 무대: 적은 오른쪽 위(왼쪽 적일수록 조금 아래로, 대각선), 파트너는 왼쪽 아래 */}
        {/* 무대 높이는 남는 만큼. 낮은 화면(568px 등)에서도 턴 끝 버튼이 화면 안에 있게 최소 높이는 작게 */}
        <div ref={fieldRef} className="relative min-h-[220px] flex-1" data-testid="field">
          <div
            className="absolute top-1 right-1 left-[20%] z-10 flex items-start justify-end gap-1"
            data-testid="enemies"
          >
            {battle.enemies.map((_, i) => (
              <div
                key={i}
                className="max-w-[120px] min-w-0 flex-1"
                style={{ transform: `translateY(${(enemyCount - 1 - i) * ENEMY_STAGGER}px)` }}
              >
                <EnemyView
                  state={state}
                  index={i}
                  size={enemySize}
                  targetable={targetable?.has(i) ?? false}
                  onSelect={
                    targetable?.has(i) && onEnemySelect ? () => onEnemySelect(i) : undefined
                  }
                />
              </div>
            ))}
          </div>
          {/* 파트너 줄의 빈 곳은 누르기가 뒤(적)로 통과함 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 [&_[data-testid=partner]>*]:pointer-events-auto">
            <PartnerView state={state} onEvolve={onEvolve} onRampage={onRampage} />
          </div>
          {/* 내기 영역·경고: 적 HP를 가리지 않게 무대 아래쪽(파트너 줄 위)에 겹쳐 뜸 */}
          <div className="pointer-events-none absolute inset-x-3 bottom-2 z-20 flex flex-col items-center rounded-xl [&:has(*)]:bg-slate-950/80 [&:has(*)]:p-2 [&_button]:pointer-events-auto">
            {middle}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {battle.companions.length > 0 && (
            <div className="flex gap-2 px-4" data-testid="companions">
              {battle.companions.map((c) => (
                <span
                  key={c.uid}
                  className="rounded-full border border-lime-400 bg-lime-950 px-2 py-0.5 text-xs text-lime-200"
                >
                  {getCard(c.defId).name}
                </span>
              ))}
            </div>
          )}
          <MemoryGauge memory={battle.memory} maxMemory={run.maxMemory} />
          {/* 손패 칸은 항상 두 줄 높이: 카드 수가 바뀌어도 무대가 출렁이지 않게 */}
          <div ref={handRef} className="min-h-[224px]">
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
        onRampage={
          legal.some((a) => a.type === 'rampage')
            ? () => {
                reset();
                dispatch({ type: 'rampage' });
              }
            : undefined
        }
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
        headerRightExtra={<SettingsButton />}
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
          <CardView
            defId={drag.card.defId}
            upgraded={drag.card.upgraded}
            state={state}
            cardUid={drag.card.uid}
          />
        </div>
      )}
      {battle.handChoice && (
        // 두 사람의 카드: 두 묶음 중 하나를 고름 (02 13.3)
        <div
          className="fixed inset-0 z-30 flex flex-col justify-center-safe gap-4 overflow-y-auto bg-slate-950/90 px-3 py-4"
          data-testid="hand-choice"
        >
          <p className="text-center text-sm text-sky-200">이번 턴에 쓸 묶음을 고르세요</p>
          {battle.handChoice.map((group, index) => (
            <button
              key={index}
              type="button"
              data-hand-group={index}
              onClick={() => dispatch({ type: 'chooseHandGroup', index })}
              className="rounded-xl border-2 border-slate-700 bg-slate-900 p-2 active:border-sky-400"
            >
              <span className="mb-2 block text-left text-xs text-slate-400">
                {index === 0 ? '다영의 카드' : '진의 카드'} ({group.length}장)
              </span>
              <span className="grid grid-cols-5 gap-1.5">
                {group.map((c) => (
                  <CardView key={c.uid} defId={c.defId} upgraded={c.upgraded} state={state} />
                ))}
              </span>
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <CardView
            defId={zoom.defId}
            upgraded={zoom.upgraded}
            state={state}
            size="large"
            cardUid={zoom.uid}
          />
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
