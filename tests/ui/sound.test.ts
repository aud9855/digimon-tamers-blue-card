// 02 13.7 효과음: 어떤 일에 어떤 소리를 내는지 (소리 자체는 브라우저에서만)
import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../../src/core/index';
import { playSound, SOUNDS, soundFor, soundsForBatch } from '../../src/ui/sound';

const dmg = (target: 'player' | number, hpLost: number): GameEvent => ({
  type: 'damage',
  source: target === 'player' ? 0 : 'player',
  target,
  amount: 5,
  blocked: 5 - hpLost,
  tempHpLost: 0,
  hpLost,
  attrMult: 1,
});

describe('효과음 (02 13.7)', () => {
  it('일마다 소리', () => {
    expect(soundFor({ type: 'cardPlayed', cardUid: 1 } as GameEvent)).toBe('card');
    expect(soundFor(dmg(0, 3))).toBe('hit');
    expect(soundFor(dmg(0, 0))).toBe('block');
    expect(soundFor(dmg('player', 3))).toBe('hurt');
    expect(soundFor({ type: 'enemyDied', enemyIndex: 0 })).toBe('enemyDown');
    expect(soundFor({ type: 'runEnded', won: false })).toBe('runLost');
    expect(
      soundFor({
        type: 'evolved',
        from: 'rookie',
        to: 'champion',
        cost: 3,
        tempHpGained: 8,
        formId: 'growlmon',
      }),
    ).toBe('evolve');
    expect(
      soundFor({
        type: 'evolved',
        from: 'ultimate',
        to: 'mega',
        cost: 0,
        tempHpGained: 25,
        formId: 'megidramon',
      }),
    ).toBe('rampage');
    expect(soundFor({ type: 'turnStarted', turn: 1 })).toBeNull();
  });

  it('한꺼번에 처리할 때는 종류마다 한 번, 끝을 알리는 소리가 먼저', () => {
    const kinds = soundsForBatch([
      dmg(0, 3),
      dmg(0, 3),
      { type: 'enemyDied', enemyIndex: 0 },
      { type: 'runEnded', won: true },
    ]);
    expect(kinds).toEqual(['runWon', 'hit', 'enemyDown']);
  });

  it('모든 소리에 음이 있고, Web Audio가 없으면 아무 일도 없음', () => {
    for (const tones of Object.values(SOUNDS)) expect(tones.length).toBeGreaterThan(0);
    expect(() => playSound('win')).not.toThrow();
  });
});
