import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLegalActions } from '../../src/core/index';
import { botBattleState } from '../../src/ui/debug';
import { useGame } from '../../src/ui/store';

beforeEach(() => {
  useGame.getState().newGame(1);
  useGame.getState().setSpeed('off');
});

describe('화면 상태 (03 9.1)', () => {
  it('제목 화면에서 런을 시작하면 국면이 바뀐다', () => {
    expect(useGame.getState().state.phase).toBe('title');
    useGame.getState().dispatch({ type: 'startRun', tamerId: 'takato' });
    expect(useGame.getState().state.phase).toBe('startChip');
    useGame.getState().dispatch({ type: 'chooseStartChip', index: 0 });
    expect(useGame.getState().state.phase).toBe('reward');
    expect(useGame.getState().lastEvents.length).toBeGreaterThan(0);
    useGame.getState().dispatch({ type: 'skipCards' });
    expect(useGame.getState().state.phase).toBe('map');
  });

  it('할 수 있는 행동만 넣어 한 판을 끝까지', () => {
    for (let i = 0; i < 5000; i++) {
      const { state, dispatch } = useGame.getState();
      const legal = getLegalActions(state);
      if (legal.length === 0) break;
      const nonEnd = legal.filter((a) => a.type !== 'endTurn');
      const action = (nonEnd.length > 0 ? nonEnd : legal)[0];
      if (!action) break;
      dispatch(action);
    }
    expect(['runWon', 'runLost']).toContain(useGame.getState().state.phase);
  });

  it('newGame은 제목 화면으로 돌아감', () => {
    useGame.getState().dispatch({ type: 'startRun', tamerId: 'takato' });
    useGame.getState().newGame(2);
    expect(useGame.getState().state.phase).toBe('title');
    expect(useGame.getState().state.seed).toBe(2);
  });
});

describe('재생 줄 (04 T1-4)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGame.setState({ state: botBattleState(1, 0), lastEvents: [] });
    useGame.getState().setSpeed('normal');
  });
  afterEach(() => vi.useRealTimers());

  function playFirstCard() {
    const state = useGame.getState().state;
    const action = getLegalActions(state).find((a) => a.type === 'playCard');
    if (!action) throw new Error('낼 카드가 없음');
    useGame.getState().dispatch(action);
    return action;
  }

  it('한 행동의 결과를 차례로 보여 주고, 끝나면 진짜 상태로', () => {
    const before = useGame.getState().state;
    playFirstCard();
    const { view, state, current } = useGame.getState();
    expect(view).not.toBeNull();
    expect(current?.event.type).toBe('cardPlayed');
    expect(current?.card).toBeDefined();
    // 보이는 상태는 아직 행동 전에 가깝고, 진짜 상태는 이미 바뀌어 있음
    expect(view?.battle?.hand.length).toBe((before.battle?.hand.length ?? 0) - 1);
    expect(state).not.toBe(before);

    const seen: string[] = [];
    for (let i = 0; i < 50 && useGame.getState().view; i++) {
      seen.push(useGame.getState().current?.event.type ?? '');
      vi.advanceTimersToNextTimer();
    }
    expect(useGame.getState().view).toBeNull();
    expect(seen[0]).toBe('cardPlayed');
  });

  it('재생 중에는 입력을 받지 않는다', () => {
    playFirstCard();
    const state = useGame.getState().state;
    useGame.getState().dispatch({ type: 'endTurn' });
    expect(useGame.getState().state).toBe(state);
  });

  it('건너뛰면 바로 진짜 상태가 보인다', () => {
    playFirstCard();
    useGame.getState().skipPlayback();
    expect(useGame.getState().view).toBeNull();
    useGame.getState().dispatch({ type: 'endTurn' });
    expect(useGame.getState().lastEvents.some((e) => e.type === 'turnEnded')).toBe(true);
  });

  it('턴 끝: 적 행동과 받은 피해가 순서대로 재생된다', () => {
    useGame.getState().dispatch({ type: 'endTurn' });
    const order: string[] = [];
    let hpSeen = useGame.getState().view?.run?.hp ?? 0;
    for (let i = 0; i < 50 && useGame.getState().view; i++) {
      const cur = useGame.getState().current;
      if (cur) order.push(cur.event.type);
      const hp = useGame.getState().view?.run?.hp ?? 0;
      if (cur?.event.type === 'damage' && cur.event.target === 'player') {
        expect(hp).toBe(hpSeen - cur.event.hpLost);
      }
      hpSeen = hp;
      vi.advanceTimersToNextTimer();
    }
    expect(order, JSON.stringify(order)).toContain('turnStarted');
    expect(order.indexOf('enemyMoved')).toBeLessThan(order.indexOf('turnStarted'));
    expect(useGame.getState().state.battle?.turn).toBe(2);
  });

  it('연출 끔이면 재생하지 않음', () => {
    useGame.getState().setSpeed('off');
    playFirstCard();
    expect(useGame.getState().view).toBeNull();
  });

  it('빠르게는 보통보다 짧다', () => {
    playFirstCard();
    let normal = 0;
    while (useGame.getState().view && normal < 20000) {
      vi.advanceTimersByTime(10);
      normal += 10;
    }
    useGame.setState({ state: botBattleState(1, 0), lastEvents: [] });
    useGame.getState().setSpeed('fast');
    playFirstCard();
    let fast = 0;
    while (useGame.getState().view && fast < 20000) {
      vi.advanceTimersByTime(10);
      fast += 10;
    }
    expect(fast).toBeLessThan(normal);
    expect(fast).toBeGreaterThan(0);
  });
});
