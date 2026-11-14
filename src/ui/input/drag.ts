// 카드 끌어서 내기·누르기·길게 누르기 (Pointer Events, 03 9.2)
import { useCallback, useEffect, useRef } from 'react';
import type { CardInstance } from '../../core/index';

/** 이만큼 움직이면 끌기로 봄 (px) */
const DRAG_THRESHOLD = 8;
/** 이만큼 누르고 있으면 크게 보기 (ms) */
const LONG_PRESS_MS = 450;

export interface CardPointerHandlers {
  onTap: (card: CardInstance) => void;
  onLongPressStart: (card: CardInstance) => void;
  onLongPressEnd: () => void;
  /** 끌기를 시작해도 되는 카드인지 (낼 수 없는 카드는 끌지 않음) */
  canDrag: (card: CardInstance) => boolean;
  onDragMove: (card: CardInstance, x: number, y: number) => void;
  onDrop: (card: CardInstance, x: number, y: number) => void;
  onDragCancel: () => void;
}

export function useCardPointer(handlers: CardPointerHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  return useCallback((card: CardInstance, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cleanup.current?.();
    const startX = e.clientX;
    const startY = e.clientY;
    let mode: 'press' | 'drag' | 'long' = 'press';

    const timer = window.setTimeout(() => {
      if (mode === 'press') {
        mode = 'long';
        ref.current.onLongPressStart(card);
      }
    }, LONG_PRESS_MS);

    const move = (ev: PointerEvent) => {
      if (mode === 'long') return;
      const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (mode === 'press' && moved > DRAG_THRESHOLD) {
        window.clearTimeout(timer);
        if (!ref.current.canDrag(card)) {
          mode = 'long'; // 끌 수 없는 카드: 이 누름은 무시
          return;
        }
        mode = 'drag';
      }
      if (mode === 'drag') ref.current.onDragMove(card, ev.clientX, ev.clientY);
    };

    const up = (ev: PointerEvent) => {
      done();
      if (mode === 'press') ref.current.onTap(card);
      else if (mode === 'drag') ref.current.onDrop(card, ev.clientX, ev.clientY);
      else ref.current.onLongPressEnd();
    };

    const cancel = () => {
      done();
      if (mode === 'drag') ref.current.onDragCancel();
      if (mode === 'long') ref.current.onLongPressEnd();
    };

    function done() {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      cleanup.current = null;
    }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    cleanup.current = done;
  }, []);
}

/** 화면 좌표 아래의 적 위치 (data-enemy-index) */
export function enemyIndexAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)?.closest('[data-enemy-index]');
  if (!el) return null;
  const index = Number(el.getAttribute('data-enemy-index'));
  return Number.isInteger(index) ? index : null;
}
