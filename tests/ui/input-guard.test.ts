// 연타 막기 (팀 점검 QA 1·2)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INPUT_LOCK_MS, inputLocked, lockInput } from '../../src/ui/inputGuard';

afterEach(() => vi.restoreAllMocks());

describe('연타 막기', () => {
  it('잠근 뒤 INPUT_LOCK_MS 동안만 막고, 그 뒤에는 풀림', () => {
    let now = 1_000_000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    expect(inputLocked()).toBe(false);
    lockInput();
    expect(inputLocked()).toBe(true);
    now += INPUT_LOCK_MS - 1;
    expect(inputLocked()).toBe(true);
    now += 2;
    expect(inputLocked()).toBe(false);
  });

  it('겹쳐 잠그면 더 늦게 끝나는 쪽을 따름', () => {
    let now = 2_000_000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    lockInput(500);
    now += 100;
    lockInput(100);
    now += 300;
    expect(inputLocked()).toBe(true);
  });
});
