// 원작 도트 (04 7절 "원작 도트"): official/ 폴더의 그림을 id → 주소로.
// 2026-11-15에 사용자가 공개 저장소에 넣기로 정함. 출처는 official/SOURCES.md.
// 그림이 없는 디지몬은 직접 그린 도트(v2/)를 씁니다.
const files = import.meta.glob('./official/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const OFFICIAL_SPRITE: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path
      .split('/')
      .pop()!
      .replace(/\.png$/, ''),
    url,
  ]),
);
