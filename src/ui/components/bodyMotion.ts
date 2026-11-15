// 도트 몸 움직임 (04 V2): 맞으면 하얗게 번쩍이고 밀렸다 돌아옴, 덤빌 때는 물러났다 튀어 나감.
// 파트너는 화면 아래, 적은 위에 있으므로 "앞"은 파트너에게 위, 적에게 아래입니다.
import type { Who } from '../../core/index';
import type { BodyMotion } from '../fx/vfx';

/** 움직일 상자: 파트너 그림 칸, 적 그림 칸 */
export function bodyElement(who: Who): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    who === 'player'
      ? '[data-testid="partner"] [data-form]'
      : `[data-enemy-index="${who}"] [data-enemy-sprite]`,
  );
}

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** rate: 빠른 재생이면 짧게 (1 = 보통) */
export function playBodyMotion(who: Who, motion: BodyMotion, rate = 1) {
  const box = bodyElement(who);
  if (!box?.animate) return;
  const ahead = who === 'player' ? -1 : 1; // 앞으로(상대 쪽) 가는 방향
  const ms = (n: number) => Math.round(n / rate);
  // 그림자는 빼고 몸만 번쩍임
  const art = box.querySelector<HTMLElement>('.spr-idle');

  if (motion === 'hurt') {
    // 하얀 실루엣 2프레임 (도트 게임의 피격 번쩍임)
    art?.animate([{ filter: 'brightness(0) invert(1)' }, { filter: 'none' }], {
      duration: ms(140),
      easing: 'steps(1, end)',
    });
    if (reducedMotion()) return;
    // 뒤로 밀렸다가 천천히 돌아옴
    box.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: `translate(0, ${-ahead * 6}px)`, offset: 0.15 },
        { transform: `translate(0, ${-ahead * 4}px)`, offset: 0.45 },
        { transform: 'translate(0, 0)' },
      ],
      { duration: ms(320), easing: 'steps(6, end)' },
    );
    return;
  }

  if (reducedMotion()) return;
  // 덤빔: 살짝 물러남(예비 동작) → 빠르게 앞으로 → 제자리
  box.animate(
    [
      { transform: 'translate(0, 0)' },
      { transform: `translate(0, ${-ahead * 3}px)`, offset: 0.3 },
      { transform: `translate(0, ${ahead * 12}px)`, offset: 0.45 },
      { transform: `translate(0, ${ahead * 10}px)`, offset: 0.6 },
      { transform: 'translate(0, 0)' },
    ],
    { duration: ms(360), easing: 'steps(8, end)' },
  );
}
