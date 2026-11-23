// 효과 프레임 옮기기 빠른 판 (성능 작업): pixelfx composite와 결과가 바이트까지 같아야 함
import { describe, expect, it } from 'vitest';
import { compositeFast } from '../../src/ui/fx/composite';
import { composite, createFrame } from '../../src/ui/fx/library';

describe('compositeFast', () => {
  it('빈 점·불투명·반투명·빛 섞인 점 모두 pixelfx composite와 같음', () => {
    const w = 37;
    const h = 23;
    const frame = createFrame(w, h);
    // 고정된 의사 난수 (테스트가 늘 같게)
    let x = 12345;
    const rand = () => {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      return x;
    };
    for (let i = 0; i < w * h; i++) {
      const kind = i % 5;
      if (kind === 0) continue; // 빈 점
      frame.color[i] = kind === 1 ? (rand() | 0xff000000) >>> 0 : rand();
      if (kind >= 3) frame.light[i] = rand();
    }
    const expected = new Uint8ClampedArray(w * h * 4);
    composite(frame, expected, null);
    const actual = new Uint8ClampedArray(w * h * 4);
    compositeFast(frame, actual);
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });
});
