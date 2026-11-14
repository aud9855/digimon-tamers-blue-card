import { describe, expect, it } from 'vitest';
import {
  applyRunResult,
  createInitialState,
  createProfile,
  defaultUnlocks,
  SAVE_VERSION,
} from '../../src/core/index';
import { botBattleState } from '../../src/ui/debug';
import { isResumable, parseProfile, parseSavedGame, parseSettings } from '../../src/ui/save';

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
    expect(parseSettings({ speed: 'fast', seenGuide: true, sound: false })).toEqual({
      speed: 'fast',
      seenGuide: true,
      sound: false,
    });
    // 효과음은 처음에 켜져 있음 (예전 설정에는 sound가 없음)
    expect(parseSettings({ speed: 'warp' })).toEqual({
      speed: 'normal',
      seenGuide: false,
      sound: true,
    });
    expect(parseSettings(undefined)).toEqual({ speed: 'normal', seenGuide: false, sound: true });
  });
});

describe('프로필 저장 (02 13.5)', () => {
  it('JSON으로 저장했다 되살리면 같다', () => {
    const p = applyRunResult(createProfile(), { ...createInitialState(1), phase: 'title' }, []);
    expect(parseProfile(JSON.stringify(p))).toEqual(p);
  });

  it('없거나 깨졌거나 버전이 다르면 새 프로필', () => {
    expect(parseProfile(undefined)).toEqual(createProfile());
    expect(parseProfile('{깨짐')).toEqual(createProfile());
    expect(parseProfile(JSON.stringify({ ...createProfile(), version: 99 }))).toEqual(
      createProfile(),
    );
    expect(parseProfile(JSON.stringify({ ...createProfile(), codex: { forms: 1 } }))).toEqual(
      createProfile(),
    );
  });

  it('버전 1 저장(해금 정보 없음)은 처음 해금 상태로 이어 함', () => {
    const state = botBattleState(3, 7);
    const old: Partial<typeof state> = { ...state };
    delete old.unlocks;
    const restored = parseSavedGame(JSON.stringify({ ...old, version: 1 }));
    expect(restored?.version).toBe(SAVE_VERSION);
    expect(restored?.unlocks).toEqual(defaultUnlocks());
  });
});
