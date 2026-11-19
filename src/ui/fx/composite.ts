// 효과 프레임을 화면 픽셀로 옮기기 (pixelfx composite의 빠른 판, 배경 없음·lightK=1일 때).
// 빛이 없는 점은 색 값(ABGR 32비트)이 곧 RGBA 바이트라서 32비트로 한 번에 옮김.
// 빛이 있는 점만 pixelfx의 원래 계산을 그대로 씀 → 결과는 composite(frame, out, null)과 같음.
import { composite, type FxFrame } from './library';

/** 이 기기가 리틀 엔디언인지 (휴대폰·PC 모두 그렇지만, 아니면 원래 계산으로) */
const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

export function compositeFast(f: FxFrame, out: Uint8ClampedArray): void {
  if (!LITTLE_ENDIAN) {
    composite(f, out, null);
    return;
  }
  const n = f.w * f.h;
  const C = f.color;
  const L = f.light;
  const out32 = new Uint32Array(out.buffer, out.byteOffset, n);
  for (let i = 0; i < n; i++) {
    const l = (L[i] as number) & 0xffffff;
    const c = C[i] as number;
    if (l === 0) {
      out32[i] = c;
      continue;
    }
    let r = c & 255;
    let g = (c >>> 8) & 255;
    let b = (c >>> 16) & 255;
    let a = c >>> 24;
    const lr = l & 255;
    const lg = (l >>> 8) & 255;
    const lb = (l >>> 16) & 255;
    if (a < 255) {
      const pa = a / 255;
      const pr = r * pa + lr;
      const pg = g * pa + lg;
      const pb = b * pa + lb;
      const na = Math.min(1, Math.max(pa, Math.max(lr, lg, lb) / 255));
      if (na > 0) {
        r = Math.min(255, pr / na);
        g = Math.min(255, pg / na);
        b = Math.min(255, pb / na);
        a = na * 255;
      }
    } else {
      r = Math.min(255, r + lr);
      g = Math.min(255, g + lg);
      b = Math.min(255, b + lb);
    }
    const j = i * 4;
    out[j] = r;
    out[j + 1] = g;
    out[j + 2] = b;
    out[j + 3] = a;
  }
}
