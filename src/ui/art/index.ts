// 도트 그림 목록 (04 7절). 그림이 없으면 undefined → 화면은 자리표시(속성 색 상자)로 그림.
import type { NodeType } from '../../core/index';
import { CHIP_ICON, NODE_ICON } from './icons';
import { TAMER_ART_LIST } from './tamers';
import type { PixelArt } from './types';
import { AI_MAKO_ART } from './v2/ai_mako';
import { ENEMY_A_ART } from './v2/enemies_a';
import { ENEMY_B_ART } from './v2/enemies_b';
import { HENRY_ART } from './v2/henry';
import { RIKA_ART } from './v2/rika';
import { TAKATO_ART } from './v2/takato';

/** 디지몬은 2판(32×32, build.ts로 조립) */
export const FORM_ART: Record<string, PixelArt> = {
  ...TAKATO_ART,
  ...RIKA_ART,
  ...HENRY_ART,
  ...AI_MAKO_ART,
};
export const ENEMY_ART: Record<string, PixelArt> = { ...ENEMY_A_ART, ...ENEMY_B_ART };
export const TAMER_ART: Record<string, PixelArt> = TAMER_ART_LIST;
export const CHIP_ART: Record<string, PixelArt> = CHIP_ICON;
export const NODE_ART: Record<NodeType, PixelArt> = NODE_ICON;

export type { PixelArt } from './types';
