// 화면에 쓰는 이름표 (규칙 계산 없음)
import type { Attribute, Stage, StatusId } from '../../core/index';

export const STAGE_LABEL: Record<Stage, string> = {
  rookie: '성장기',
  champion: '성숙기',
  ultimate: '완전체',
  mega: '궁극체',
};

export const ATTRIBUTE_LABEL: Record<Attribute, string> = {
  vaccine: '백신',
  data: '데이터',
  virus: '바이러스',
  none: '없음',
};

/** 속성 색 배경 (자리표시 그림, 04 4절) */
export const ATTRIBUTE_BG: Record<Attribute, string> = {
  vaccine: 'bg-vaccine',
  data: 'bg-data',
  virus: 'bg-virus',
  none: 'bg-none',
};

export const STATUS_LABEL: Record<StatusId, string> = {
  strength: '힘',
  weak: '약화',
  vulnerable: '취약',
};
