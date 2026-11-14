import { describe, expect, it } from 'vitest';
import { createInitialState, SAVE_VERSION } from '../../src/core/index';
import { botBattleState } from '../../src/ui/debug';
import { isResumable, parseSavedGame, parseSettings } from '../../src/ui/save';

describe('저장 형식 (04 T1-7)', () => {
  it('전투 도중 상태를 JSON으로 저장했다 되살리면 같다', () => {
    const state = botBattleState(3, 7);
    expect(state.phase).toBe('battle');
    expect(parseSavedGame(JSON.stringify(state))).toEqual(state);
  });

  it('버전이 다르거나 깨진 저장은 버린다', () => {
    const state = createInitialState(1);
    expect(parseSavedGame(JSON.stringify({ ...state, version: SAVE_VERSION + 1 }))).toBeNull();
    expect(parseSavedGame('{깨짐')).toBeNull();
    expect(parseSavedGame(undefined)).toBeNull();
    expect(parseSavedGame(JSON.stringify({ phase: 'map' }))).toBeNull();
  });

  it('제목·결과 화면은 이어 하지 않는다', () => {
    expect(isResumable(createInitialState(1))).toBe(false);
    expect(isResumable(botBattleState(3, 7))).toBe(true);
    expect(isResumable({ ...createInitialState(1), phase: 'runLost' })).toBe(false);
  });

  it('설정: 모르는 값은 기본값', () => {
    expect(parseSettings({ speed: 'fast' })).toEqual({ speed: 'fast' });
    expect(parseSettings({ speed: 'warp' })).toEqual({ speed: 'normal' });
    expect(parseSettings(undefined)).toEqual({ speed: 'normal' });
  });
});
