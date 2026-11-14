import { describe, expect, it } from 'vitest';
import {
  applyRunResult,
  createInitialState,
  applyAction,
  createProfile,
  defaultUnlocks,
  getLegalActions,
  type GameState,
  SAVE_VERSION,
} from '../../src/core/index';
import { botBattleState } from '../../src/ui/debug';
import {
  isConsistentState,
  isResumable,
  parseProfile,
  parseSavedGame,
  parseSettings,
} from '../../src/ui/save';

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

describe('국면과 상태가 맞는 저장만 이어 함 (빈 화면 막기)', () => {
  it('맞는 저장은 그대로', () => {
    const state = botBattleState(3, 7);
    expect(isConsistentState(state)).toBe(true);
    expect(isConsistentState(createInitialState(1))).toBe(true);
  });

  it('판이 없는 지도, 대기 정보가 다른 보상, 전투 정보가 없는 전투는 버림', () => {
    const state = botBattleState(3, 7);
    expect(parseSavedGame(JSON.stringify({ ...state, phase: 'map', run: null }))).toBeNull();
    expect(parseSavedGame(JSON.stringify({ ...state, phase: 'reward', pending: null }))).toBeNull();
    expect(parseSavedGame(JSON.stringify({ ...state, battle: null }))).toBeNull();
    expect(parseSavedGame(JSON.stringify(state))).toEqual(state);
  });
});

describe('1단계 저장 (버전 1, 2단계 필드 없음) 이어 하기', () => {
  /** 1단계 때의 모양: 2·3단계에 생긴 필드를 지움 */
  function stage1(state: GameState): unknown {
    type Loose = Record<string, unknown>;
    const s = structuredClone(state) as unknown as Loose & {
      run: Loose | null;
      battle: Loose | null;
    };
    s.version = 1;
    delete s.unlocks;
    for (const key of ['formTraits', 'hazard']) if (s.run) delete s.run[key];
    for (const key of ['companions', 'cardsPlayedThisTurn', 'rampage', 'handChoice']) {
      if (s.battle) delete s.battle[key];
    }
    return s;
  }

  it('빠진 필드를 채워 되살리고, 그 뒤로 계속 둘 수 있음', () => {
    for (const steps of [0, 3, 7]) {
      const restored = parseSavedGame(JSON.stringify(stage1(botBattleState(3, steps))));
      expect(restored).not.toBeNull();
      if (!restored) return;
      expect(restored.battle?.companions).toEqual([]);
      expect(restored.run?.formTraits).toEqual({});
      let state = restored;
      for (let i = 0; i < 40; i++) {
        const legal = getLegalActions(state);
        if (legal.length === 0) break;
        const action = legal.find((a) => a.type === 'endTurn') ?? legal[0];
        if (!action) break;
        state = applyAction(state, action).state;
      }
    }
  });

  it('지금 데이터에 없는 카드가 든 저장은 버림', () => {
    const s = stage1(botBattleState(3, 7)) as { run: { deck: { defId: string }[] } };
    const first = s.run.deck[0];
    if (first) first.defId = 'no_such_card';
    expect(parseSavedGame(JSON.stringify(s))).toBeNull();
  });
});
