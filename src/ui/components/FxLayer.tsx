// 전투 도트 효과 층 (04 V1): 재생 중인 일마다 pixelfx 효과를 화면 위 캔버스에 그립니다.
// 입력은 막지 않고(pointer-events-none), 재생을 건너뛰어도 남은 효과는 끝까지 사라지며 그립니다.
import { useEffect, useRef } from 'react';
import type { Who } from '../../core/index';
import {
  FX_MODULES,
  PAL,
  clearFrame,
  composite,
  createFrame,
  createFx,
  type FxFrame,
  type FxInstance,
} from '../fx/library';
import { FEEL, motionFor, vfxFor, type FeelTier, type VfxCue } from '../fx/vfx';
import { playBodyMotion } from './bodyMotion';
import { useGame } from '../store';

/** 효과 1칸 = 화면 2px (도트 그림 24칸 ≈ 56px과 비슷한 크기) */
export const FX_SCALE = 2;
/** 빠르게 재생할 때 효과도 빨리 (playback의 SPEED_FACTOR 0.4와 맞춤) */
const FAST_RATE = 2.5;

function targetElement(who: Who): Element | null {
  if (who === 'player') return document.querySelector('[data-testid="partner"] [data-form]');
  const slot = `[data-enemy-index="${who}"]`;
  // 쓰러진 적은 그림 칸이 없으므로 자리 칸에 띄움
  return document.querySelector(`${slot} [data-enemy-sprite]`) ?? document.querySelector(slot);
}

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * 손맛 (game-feel): 흔들림은 쌓이는 trauma로, 세기는 trauma²이고 실제 시간으로 줄어듭니다.
 * 매 프레임 무작위가 아니라 서로 다른 빠르기의 사인을 더해 부드럽게 흔듭니다 (덜덜 떨림 방지).
 * 타격 정지는 효과만 잠깐 멈춥니다 (규칙·재생 순서에는 손대지 않음).
 */
const feel = { trauma: 0, stop: 0, t: 0 };
const SHAKE_PX = { x: 7, y: 5 };
const TRAUMA_DECAY = 2.2; // 1초에 줄어드는 양

function addFeel(tier: FeelTier) {
  const f = FEEL[tier];
  if (!reducedMotion()) feel.trauma = Math.min(1, feel.trauma + f.trauma);
  // 겹친 정지는 더 긴 쪽만 남김 (새 정지가 이전 정지를 끊지 않음)
  feel.stop = Math.max(feel.stop, f.stop);
}

function applyShake(realDt: number) {
  const root = document.getElementById('root');
  if (!root) return;
  feel.trauma = Math.max(0, feel.trauma - TRAUMA_DECAY * realDt);
  if (feel.trauma === 0) {
    root.style.transform = '';
    return;
  }
  feel.t += realDt * 30;
  const k = feel.trauma * feel.trauma;
  const x = Math.round(SHAKE_PX.x * k * Math.sin(feel.t * 1.7));
  const y = Math.round(SHAKE_PX.y * k * Math.sin(feel.t * 2.3));
  root.style.transform = `translate(${x}px, ${y}px)`;
}

let seed = 1;

/** 대상 요소의 바닥 가운데에 효과를 놓음 (효과의 (0,0)은 발·맞는 점) */
function spawn(cue: VfxCue): FxInstance | null {
  const el = targetElement(cue.who);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const mod = FX_MODULES[cue.fx];
  const palette = cue.palette ? PAL[cue.palette] : undefined;
  if (cue.tier) addFeel(cue.tier);
  seed = (seed * 48271) % 2147483647;
  return createFx(mod, {
    x: (r.left + r.width / 2) / FX_SCALE,
    y: r.bottom / FX_SCALE,
    flip: cue.flip ?? false,
    seed,
    height: Math.round(r.height / FX_SCALE / 2),
    ...(palette ? { palette } : {}),
  });
}

export function FxLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef<FxInstance[]>([]);
  const kick = useRef<() => void>(() => {});
  const current = useGame((s) => s.current);
  const speed = useGame((s) => s.speed);
  const rate = useRef(1);
  rate.current = speed === 'fast' ? FAST_RATE : 1;

  // 그리기 고리: 살아 있는 효과가 있을 때만 돌고, 다 끝나면 멈춤
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let frame: FxFrame | null = null;
    let image: ImageData | null = null;
    let raf = 0;
    let last = 0;

    const fitCanvas = () => {
      const w = Math.ceil(window.innerWidth / FX_SCALE);
      const h = Math.ceil(window.innerHeight / FX_SCALE);
      if (frame && frame.w === w && frame.h === h) return;
      canvas.width = w;
      canvas.height = h;
      frame = createFrame(w, h);
      image = ctx.createImageData(w, h);
    };

    const tick = (now: number) => {
      const realDt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      applyShake(realDt);
      // 타격 정지 중에는 효과 시간이 흐르지 않음
      const frozen = feel.stop > 0;
      feel.stop = Math.max(0, feel.stop - realDt);
      const dt = frozen ? 0 : realDt;
      fitCanvas();
      if (!frame || !image) return;
      clearFrame(frame);
      for (const fx of live.current) {
        fx.update(dt * rate.current);
        fx.draw(frame);
      }
      live.current = live.current.filter((fx) => !fx.done());
      composite(frame, image.data, null);
      ctx.putImageData(image, 0, 0);
      if (live.current.length > 0 || feel.trauma > 0) raf = requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        raf = 0;
        last = 0;
      }
    };

    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    return () => {
      cancelAnimationFrame(raf);
      feel.trauma = 0;
      applyShake(0);
      kick.current = () => {};
    };
  }, []);

  // 재생 중인 일이 바뀔 때마다 그 일의 효과를 띄움
  useEffect(() => {
    if (!current) return;
    for (const m of motionFor(current.event)) playBodyMotion(m.who, m.motion, rate.current);
    let added = false;
    for (const cue of vfxFor(current.event)) {
      const fx = spawn(cue);
      if (fx) {
        live.current.push(fx);
        added = true;
      }
    }
    if (added) kick.current();
  }, [current]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="fx-layer"
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[49] h-full w-full [image-rendering:pixelated]"
    />
  );
}
