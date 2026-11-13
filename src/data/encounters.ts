// 조우 (02 9.4)
import type { EncounterDef } from '../core/types';

export const encounters = [
  // ── 쉬움 ──
  { id: 'a1_easy_goblimon', act: 1, tier: 'easy', enemies: ['goblimon'] },
  { id: 'a1_easy_harpymon', act: 1, tier: 'easy', enemies: ['harpymon'] },
  { id: 'a1_easy_allomon', act: 1, tier: 'easy', enemies: ['allomon'] },
  { id: 'a1_easy_vilemon_x2', act: 1, tier: 'easy', enemies: ['vilemon', 'vilemon'] },

  // ── 보통 ──
  { id: 'a1_normal_gorillamon', act: 1, tier: 'normal', enemies: ['gorillamon'] },
  {
    id: 'a1_normal_goblimon_harpymon',
    act: 1,
    tier: 'normal',
    enemies: ['goblimon', 'harpymon'],
  },
  { id: 'a1_normal_allomon_vilemon', act: 1, tier: 'normal', enemies: ['allomon', 'vilemon'] },
  {
    id: 'a1_normal_thunderbirdmon_goblimon',
    act: 1,
    tier: 'normal',
    enemies: ['thunderbirdmon', 'goblimon'],
  },
  {
    id: 'a1_normal_harpymon_x2_vilemon',
    act: 1,
    tier: 'normal',
    enemies: ['harpymon', 'harpymon', 'vilemon'],
  },
  {
    id: 'a1_normal_thunderbirdmon_allomon',
    act: 1,
    tier: 'normal',
    enemies: ['thunderbirdmon', 'allomon'],
  },

  // ── 강적 ──
  { id: 'a1_elite_icedevimon', act: 1, tier: 'elite', enemies: ['icedevimon'] },
  { id: 'a1_elite_musyamon', act: 1, tier: 'elite', enemies: ['musyamon'] },

  // ── 보스 ──
  { id: 'a1_boss_mihiramon', act: 1, tier: 'boss', enemies: ['mihiramon'] },
] satisfies EncounterDef[];
