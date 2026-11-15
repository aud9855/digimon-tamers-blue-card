// 원작 모델 도트의 디지몬별 화면 크기 (04 7절): 모든 그림에 크기가 있고, 칸의 55~100% 안에서 크기 순서를 지킴
import { describe, expect, it } from 'vitest';
import { OFFICIAL_SPRITE } from '../../src/ui/art/official';
import { SPRITE_SIZE, spriteHeightFrac } from '../../src/ui/art/spriteScale';

describe('디지몬별 화면 크기', () => {
  it('원작 도트마다 크기 값이 있음', () => {
    for (const id of Object.keys(OFFICIAL_SPRITE)) expect(SPRITE_SIZE[id], id).toBeTypeOf('number');
  });

  it('칸 높이의 55~100% 안', () => {
    for (const id of Object.keys(SPRITE_SIZE)) {
      const f = spriteHeightFrac(id);
      expect(f, id).toBeGreaterThanOrEqual(0.55);
      expect(f, id).toBeLessThanOrEqual(1);
    }
    expect(spriteHeightFrac('zhuqiaomon')).toBe(1);
    expect(spriteHeightFrac('no_such_digimon')).toBe(1);
  });

  it('크기 값이 크면 화면에서도 크거나 같음', () => {
    const ids = Object.keys(SPRITE_SIZE).sort((a, b) => SPRITE_SIZE[a]! - SPRITE_SIZE[b]!);
    for (let i = 1; i < ids.length; i++)
      expect(spriteHeightFrac(ids[i]!)).toBeGreaterThanOrEqual(spriteHeightFrac(ids[i - 1]!));
  });

  it('진화하면 커짐: 길몬 < 그라우몬 < 메가로그라우몬', () => {
    expect(spriteHeightFrac('guilmon')).toBeLessThan(spriteHeightFrac('growlmon'));
    expect(spriteHeightFrac('growlmon')).toBeLessThan(spriteHeightFrac('wargrowlmon'));
  });
});
