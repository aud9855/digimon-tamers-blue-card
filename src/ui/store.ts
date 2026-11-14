// 화면 상태 (03 9.1). GameState를 보관하고 dispatch로만 바꿉니다.
// 행동의 결과(일어난 일)는 재생 줄에 넣어 차례로 보여 주고, 재생 중에는 입력을 막습니다.
import { create } from 'zustand';
import {
  applyAction,
  applyRunResult,
  createInitialState,
  createProfile,
  recordCodex,
  type Action,
  type GameEvent,
  type GameState,
  type Profile,
} from '../core/index';
import { applyEventToView, eventDuration, shouldPlay, type PlaybackSpeed } from './playback';

export type Panel = 'settings' | 'guide' | 'info';

/** 재생 중인 일 하나와, 연출에 필요한 덧붙임 정보 */
export interface PlaybackItem {
  event: GameEvent;
  /** cardPlayed일 때 낸 카드 */
  card?: { defId: string; upgraded: boolean };
  /** 같은 종류가 이어질 때도 연출을 다시 시작하도록 매기는 번호 */
  seq: number;
}

export interface GameStore {
  /** 마지막 행동까지 반영된 진짜 상태 */
  state: GameState;
  /** 판 밖의 기록 (02 13.5) */
  profile: Profile;
  /** 마지막 행동에서 일어난 일 */
  lastEvents: GameEvent[];
  /** 재생 중에 보이는 상태 (재생 중이 아니면 null) */
  view: GameState | null;
  queue: GameEvent[];
  current: PlaybackItem | null;
  speed: PlaybackSpeed;
  /** 열려 있는 창 (설정, 하는 법, 정보) */
  panel: Panel | null;
  setPanel: (panel: Panel | null) => void;
  /** 하는 법을 본 적이 있는지 (처음 전투에서 한 번 자동으로 보여 줌) */
  seenGuide: boolean;
  setSeenGuide: (seen: boolean) => void;
  dispatch: (action: Action) => void;
  /** 남은 재생을 건너뜀 */
  skipPlayback: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  /** 새 시드로 처음부터 (프로필의 해금 정보로) */
  newGame: (seed?: number) => void;
}

/** 화면 쪽 시드. core가 아니므로 무작위 API를 써도 됩니다. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

let timer: ReturnType<typeof setTimeout> | null = null;
let seq = 0;

function clearTimer() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

export const useGame = create<GameStore>((set, get) => {
  /** 재생 줄에서 다음 일을 꺼내 보여 줌. 시간이 걸리지 않는 일은 바로 이어서 처리 */
  const step = () => {
    timer = null;
    const { view: start, queue, speed } = get();
    if (!start) return;
    let view = start;
    const rest = queue.slice();
    while (rest.length > 0) {
      const event = rest.shift() as GameEvent;
      let card: PlaybackItem['card'];
      if (event.type === 'cardPlayed') {
        const c = view.battle?.hand.find((h) => h.uid === event.cardUid);
        if (c) card = { defId: c.defId, upgraded: c.upgraded };
      }
      const next = structuredClone(view);
      applyEventToView(next, event);
      const duration = eventDuration(event, speed);
      if (duration > 0) {
        set({ view: next, queue: rest, current: { event, card, seq: ++seq } });
        timer = setTimeout(step, duration);
        return;
      }
      view = next;
    }
    set({ view: null, queue: [], current: null });
  };

  return {
    state: createInitialState(randomSeed()),
    profile: createProfile(),
    lastEvents: [],
    view: null,
    queue: [],
    current: null,
    speed: 'normal',
    panel: null,
    setPanel: (panel) => set({ panel }),
    seenGuide: false,
    setSeenGuide: (seen) => set({ seenGuide: seen }),
    dispatch: (action) => {
      if (get().view) return; // 재생 중에는 입력을 받지 않음
      const before = get().state;
      const result = applyAction(before, action);
      // 프로필: 판이 끝나면 결과를, 아니면 도감만 (02 13.5)
      const ended = result.events.some((e) => e.type === 'runEnded');
      const profile = ended
        ? applyRunResult(get().profile, result.state, result.events)
        : recordCodex(get().profile, result.events);
      if (profile !== get().profile) set({ profile });
      if (shouldPlay(before, result.events, get().speed)) {
        set({
          state: result.state,
          lastEvents: result.events,
          view: structuredClone(before),
          queue: result.events,
          current: null,
        });
        step();
      } else {
        set({ state: result.state, lastEvents: result.events });
      }
    },
    skipPlayback: () => {
      clearTimer();
      set({ view: null, queue: [], current: null });
    },
    setSpeed: (speed) => set({ speed }),
    newGame: (seedValue) => {
      clearTimer();
      set({
        state: createInitialState(seedValue ?? randomSeed(), get().profile.unlocks),
        lastEvents: [],
        view: null,
        queue: [],
        current: null,
        panel: null,
      });
    },
  };
});

/** 화면에 보일 상태: 재생 중이면 재생 중인 상태 */
export function useDisplayState(): GameState {
  return useGame((s) => s.view ?? s.state);
}

export function useIsPlaying(): boolean {
  return useGame((s) => s.view !== null);
}
