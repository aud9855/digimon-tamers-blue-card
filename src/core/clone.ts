// 상태 깊은 복사 (03 5절 약속 1: 받은 state는 고치지 않고 복사본을 고침).
// 상태는 일반 객체·배열·원시값만 담으므로(Map·Set·Date·함수 없음) structuredClone보다 훨씬 빠른
// 단순 재귀 복사를 씁니다. 키 순서와 값이 undefined인 키도 그대로 남습니다.

/** 일반 데이터(객체·배열·원시값)를 깊게 복사 */
export function cloneState<T>(value: T): T {
  return copy(value) as T;
}

function copy(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (Array.isArray(value)) {
    const n = value.length;
    const out = new Array<unknown>(n);
    for (let i = 0; i < n; i++) out[i] = copy(value[i]);
    return out;
  }
  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key in src) out[key] = copy(src[key]);
  return out;
}
