import { beforeEach, describe, expect, it } from 'vitest';
import { getLegalActions } from '../../src/core/index';
import { useGame } from '../../src/ui/store';

beforeEach(() => useGame.getState().newGame(1));

describe('화면 상태 (03 9.1)', () => {
  it('제목 화면에서 런을 시작하면 국면이 바뀐다', () => {
    expect(useGame.getState().state.phase).toBe('title');
    useGame.getState().dispatch({ type: 'startRun', tamerId: 'takato' });
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
