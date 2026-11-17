// 연타 막기 (팀 점검 QA 1·2): 국면·턴이 바뀐 직후나 연출을 건너뛴 직후 잠깐 누르기를 무시합니다.
// 안 막으면 같은 자리를 빠르게 두 번 누를 때 두 번째 누르기가 새 화면의 버튼(턴 끝, 지도 칸)에 닿습니다.

/** 잠그는 시간 (ms). 사람이 일부러 다시 누르기보다 짧게 */
export const INPUT_LOCK_MS = 400;

let lockedUntil = 0;

export function lockInput(ms = INPUT_LOCK_MS): void {
  lockedUntil = Math.max(lockedUntil, performance.now() + ms);
}

export function inputLocked(): boolean {
  return performance.now() < lockedUntil;
}

/** 화면 전체의 누르기를 잠금 중에는 버림 (캡처 단계라 어떤 버튼보다 먼저 봄) */
export function installInputGuard(): () => void {
  const block = (e: Event) => {
    if (!inputLocked()) return;
    e.stopPropagation();
    e.preventDefault();
  };
  const types = ['pointerdown', 'click'] as const;
  for (const t of types) window.addEventListener(t, block, { capture: true });
  return () => {
    for (const t of types) window.removeEventListener(t, block, { capture: true });
  };
}
