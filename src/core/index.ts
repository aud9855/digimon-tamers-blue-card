// core가 밖에 내보내는 것 (03 5절)
export { cloneState } from './clone';
export { createInitialState, SAVE_VERSION } from './state';
export {
  applyRunResult,
  createProfile,
  defaultUnlocks,
  fullUnlocks,
  PROFILE_VERSION,
  recordCodex,
  tamerUnlockWins,
  totalWins,
} from './meta';
/** 지금 형태 (폭주 중이면 폭주 형태)와 매트릭스 여부: 화면 표시용 */
export { currentForm, isMatrix } from './helpers';
export { applyAction, getLegalActions, IllegalActionError } from './engine';
/** 휴식의 회복 비율 (해저드 반영) */
export { restHealPct } from './run/rest';
export { totalNodesVisited } from './run/act';
export {
  describeCard,
  describeChip,
  describeEventChoice,
  describeIntent,
  describeHazard,
  describeHazardRule,
  describeTamer,
  previewCardCost,
  previewEvolveCost,
  previewOverdraw,
  describeEnding,
} from './describe';
export type { DescribeContext, IntentView } from './describe';
export type * from './types';
