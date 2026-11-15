// 전투 도트 효과 (04 7절 V1): 이벤트 → 효과 고르기, 들여온 pixelfx 효과가 끝까지 돌고 사라지는지
import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../../src/core/index';
import {
  FX_MODULES,
  PAL,
  clearFrame,
  createFrame,
  createFx,
  type FxKey,
} from '../../src/ui/fx/library';
import { vfxFor } from '../../src/ui/fx/vfx';

const damage = (over: Partial<Extract<GameEvent, { type: 'damage' }>>): GameEvent =>
  ({
    type: 'damage',
    target: 0,
    hpLost: 0,
    tempHpLost: 0,
    blocked: 0,
    attrMult: 1,
    ...over,
  }) as GameEvent;

describe('vfxFor', () => {
  it('적 피해: 보통은 불꽃, 속성 유리는 큰 타격과 흔들림, 다 막으면 막음', () => {
    expect(vfxFor(damage({ hpLost: 6 }))).toEqual([{ fx: 'hitSpark', who: 0 }]);
    expect(vfxFor(damage({ hpLost: 9, attrMult: 1.5 }))).toEqual([
      { fx: 'critHit', who: 0, shake: true },
    ]);
    expect(vfxFor(damage({ blocked: 6 }))).toEqual([{ fx: 'parry', who: 0 }]);
    expect(vfxFor(damage({}))).toEqual([]);
  });

  it('파트너 피해: 임시 체력만 깎여도 맞은 효과', () => {
    expect(vfxFor(damage({ target: 'player', tempHpLost: 3 }))[0]).toMatchObject({
      fx: 'bluntHit',
      who: 'player',
      shake: true,
    });
  });

  it('진화: 보통·매트릭스·폭주가 서로 다름', () => {
    const evolved = (to: string, formId: string) =>
      ({ type: 'evolved', from: 'rookie', to, formId, tempHpGained: 0 }) as unknown as GameEvent;
    expect(vfxFor(evolved('champion', 'growlmon'))[0]).toMatchObject({
      fx: 'holyPillar',
      palette: 'cyber',
    });
    expect(vfxFor(evolved('mega', 'gallantmon'))[0]).toMatchObject({
      fx: 'holyPillar',
      palette: 'gold',
    });
    expect(vfxFor(evolved('ultimate', 'megidramon'))[0]).toMatchObject({ fx: 'darkExplosion' });
  });

  it('고른 효과와 색은 모두 들여온 것 안에 있음', () => {
    const events: GameEvent[] = [
      damage({ hpLost: 1 }),
      damage({ hpLost: 1, attrMult: 2 }),
      damage({ blocked: 1 }),
      damage({ target: 'player', hpLost: 1 }),
      { type: 'hpLost', amount: 2 } as GameEvent,
      { type: 'healed', amount: 2 } as GameEvent,
      { type: 'shieldGained', target: 'player', amount: 2 } as GameEvent,
      { type: 'enemyDied', enemyIndex: 1 } as GameEvent,
    ];
    for (const cue of events.flatMap(vfxFor)) {
      expect(FX_MODULES[cue.fx]).toBeDefined();
      if (cue.palette) expect(PAL[cue.palette]).toBeDefined();
    }
  });
});

describe('들여온 pixelfx 효과', () => {
  const keys = Object.keys(FX_MODULES) as FxKey[];

  it.each(keys)('%s: 한 번 터지고 끝나며, 끝나면 아무것도 그리지 않음', (key) => {
    const mod = FX_MODULES[key];
    expect(mod.meta.loop).toBeFalsy();
    const fx = createFx(mod, { x: 100, y: 150, seed: 7, height: 12 });
    const frame = createFrame(200, 200);
    let drew = false;
    for (let i = 0; i < 600 && !fx.done(); i++) {
      fx.update(1 / 30);
      clearFrame(frame);
      fx.draw(frame);
      if (frame.color.some((c) => c !== 0) || frame.light.some((c) => c !== 0)) drew = true;
    }
    expect(drew, '무언가 그림').toBe(true);
    expect(fx.done(), '끝남').toBe(true);
  });

  it('같은 시드면 같은 그림 (결정적)', () => {
    const render = () => {
      const fx = createFx(FX_MODULES.hitSpark, { x: 60, y: 60, seed: 3 });
      const frame = createFrame(120, 100);
      for (let i = 0; i < 5; i++) fx.update(1 / 30);
      fx.draw(frame);
      return Array.from(frame.color);
    };
    expect(render()).toEqual(render());
  });
});
