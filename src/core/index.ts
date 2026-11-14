// core가 밖에 내보내는 것 (03 5절)
export { createInitialState, SAVE_VERSION } from './state';
export { applyAction, getLegalActions, IllegalActionError } from './engine';
export {
  describeCard,
  describeChip,
  describeEventChoice,
  describeIntent,
  previewEvolveCost,
  previewOverdraw,
} from './describe';
export type { DescribeContext, IntentView } from './describe';
export type * from './types';
