// 조우 (02 9.4, 12.10)
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

  // ── 2막 (02 12.10) ──
  { id: 'a2_easy_gotsumon', act: 2, tier: 'easy', enemies: ['gotsumon'] },
  { id: 'a2_easy_kuwagamon', act: 2, tier: 'easy', enemies: ['kuwagamon'] },
  { id: 'a2_easy_unimon', act: 2, tier: 'easy', enemies: ['unimon'] },
  {
    id: 'a2_easy_pico_devimon_x2',
    act: 2,
    tier: 'easy',
    enemies: ['pico_devimon', 'pico_devimon'],
  },
  { id: 'a2_normal_gekomon_gotsumon', act: 2, tier: 'normal', enemies: ['gekomon', 'gotsumon'] },
  {
    id: 'a2_normal_piddomon_kuwagamon',
    act: 2,
    tier: 'normal',
    enemies: ['piddomon', 'kuwagamon'],
  },
  {
    id: 'a2_normal_unimon_pico_devimon',
    act: 2,
    tier: 'normal',
    enemies: ['unimon', 'pico_devimon'],
  },
  { id: 'a2_normal_gekomon_piddomon', act: 2, tier: 'normal', enemies: ['gekomon', 'piddomon'] },
  { id: 'a2_normal_kuwagamon_x2', act: 2, tier: 'normal', enemies: ['kuwagamon', 'kuwagamon'] },
  {
    id: 'a2_normal_gotsumon_pico_devimon_x2',
    act: 2,
    tier: 'normal',
    enemies: ['gotsumon', 'pico_devimon', 'pico_devimon'],
  },
  { id: 'a2_elite_sandiramon', act: 2, tier: 'elite', enemies: ['sandiramon'] },
  { id: 'a2_elite_vajramon', act: 2, tier: 'elite', enemies: ['vajramon'] },
  { id: 'a2_boss_zhuqiaomon', act: 2, tier: 'boss', enemies: ['zhuqiaomon'] },

  // ── 3막 (02 12.10) ──
  { id: 'a3_easy_searcher', act: 3, tier: 'easy', enemies: ['reaper_searcher'] },
  { id: 'a3_easy_creeper', act: 3, tier: 'easy', enemies: ['reaper_creeper'] },
  { id: 'a3_easy_paranoia', act: 3, tier: 'easy', enemies: ['reaper_paranoia'] },
  { id: 'a3_easy_gotsumon_unimon', act: 3, tier: 'easy', enemies: ['gotsumon', 'unimon'] },
  {
    id: 'a3_normal_searcher_paranoia',
    act: 3,
    tier: 'normal',
    enemies: ['reaper_searcher', 'reaper_paranoia'],
  },
  {
    id: 'a3_normal_creeper_kuwagamon',
    act: 3,
    tier: 'normal',
    enemies: ['reaper_creeper', 'kuwagamon'],
  },
  {
    id: 'a3_normal_searcher_creeper',
    act: 3,
    tier: 'normal',
    enemies: ['reaper_searcher', 'reaper_creeper'],
  },
  {
    id: 'a3_normal_paranoia_x2',
    act: 3,
    tier: 'normal',
    enemies: ['reaper_paranoia', 'reaper_paranoia'],
  },
  { id: 'a3_normal_unimon_creeper', act: 3, tier: 'normal', enemies: ['unimon', 'reaper_creeper'] },
  {
    id: 'a3_normal_searcher_gotsumon_kuwagamon',
    act: 3,
    tier: 'normal',
    enemies: ['reaper_searcher', 'gotsumon', 'kuwagamon'],
  },
  { id: 'a3_elite_horn_striker', act: 3, tier: 'elite', enemies: ['reaper_horn_striker'] },
  { id: 'a3_elite_optimizer', act: 3, tier: 'elite', enemies: ['reaper_optimizer'] },
  { id: 'a3_boss_d_reaper', act: 3, tier: 'boss', enemies: ['d_reaper'] },
] satisfies EncounterDef[];
