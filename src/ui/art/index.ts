// 도트 그림 목록 (04 7절). 그림이 없으면 undefined → 화면은 자리표시(속성 색 상자)로 그림.
import type { NodeType } from '../../core/index';
import { ENEMY_ART_LIST } from './enemies';
import { CHIP_ICON, NODE_ICON } from './icons';
import { PARTNER_ART } from './partners';
import { TAMER_ART_LIST } from './tamers';
import type { PixelArt } from './types';

export const FORM_ART: Record<string, PixelArt> = PARTNER_ART;
export const ENEMY_ART: Record<string, PixelArt> = ENEMY_ART_LIST;
export const TAMER_ART: Record<string, PixelArt> = TAMER_ART_LIST;
export const CHIP_ART: Record<string, PixelArt> = CHIP_ICON;
export const NODE_ART: Record<NodeType, PixelArt> = NODE_ICON;

export type { PixelArt } from './types';
