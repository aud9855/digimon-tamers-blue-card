// 원작 그림에서 줄인 도트(official/)의 화면 크기 (04 7절 "원작 모델 도트").
// 값은 2026-11-15 사용자가 시안 페이지에서 정한 상대 크기(%)입니다. 성장기 50 · 성숙기 70 · 완전체 85 · 궁극체 100이 기본.
// 게임 칸은 크기가 정해져 있어서, 그대로 쓰면 작은 디지몬이 너무 작아집니다.
// 그래서 순서는 지키되 칸 높이의 MIN_FRAC~100% 사이로 눌러 담습니다 (사용자 결정).
export const SPRITE_SIZE: Record<string, number> = {
  guilmon: 35,
  growlmon: 70,
  wargrowlmon: 85,
  gallantmon: 50,
  megidramon: 115,
  renamon: 50,
  kyubimon: 70,
  taomon: 85,
  sakuyamon: 65,
  terriermon: 30,
  gargomon: 70,
  rapidmon: 85,
  megagargomon: 100,
  impmon: 50,
  beelzemon: 100,
  goblimon: 45,
  vilemon: 50,
  allomon: 70,
  gorillamon: 70,
  harpymon: 75,
  thunderbirdmon: 70,
  icedevimon: 85,
  musyamon: 70,
  mihiramon: 85,
  gotsumon: 35,
  gekomon: 40,
  kuwagamon: 80,
  pico_devimon: 35,
  unimon: 70,
  piddomon: 75,
  sandiramon: 95,
  vajramon: 85,
  zhuqiaomon: 150,
  reaper_horn_striker: 85,
  reaper_optimizer: 85,
  d_reaper: 130,
  // 원작 그림이 없어 직접 그린 디 리퍼 요원 (2026-11-16 아트 점검에서 더함)
  reaper_searcher: 60,
  reaper_creeper: 60,
  reaper_paranoia: 70,
};

const MIN_SIZE = 30;
const MAX_SIZE = 150;
const MIN_FRAC = 0.55;

/** 칸 높이 대비 그림 높이 (0.55~1). 크기 값이 없으면 1 (칸을 채움) */
export function spriteHeightFrac(id: string): number {
  const size = SPRITE_SIZE[id];
  if (size === undefined) return 1;
  const t = Math.min(1, Math.max(0, (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)));
  return MIN_FRAC + (1 - MIN_FRAC) * t;
}
