import type { Action, GameEvent, GameState } from './types';

/** 지금 할 수 없는 행동을 넣었을 때 던집니다 (03 5절 약속 3). */
export class IllegalActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalActionError';
  }
}

type ActionType = Action['type'];
type ActionOf<T extends ActionType> = Extract<Action, { type: T }>;
type Handler<T extends ActionType> = (
  draft: GameState,
  events: GameEvent[],
  action: ActionOf<T>,
) => void;

// 행동 종류별 처리 함수. 작업이 진행되면서 하나씩 채웁니다 (04 문서).
// 여기 없는 행동은 IllegalActionError입니다.
const handlers: { [T in ActionType]?: Handler<T> } = {};

/** 지금 할 수 있는 모든 행동 (03 5.2). */
export function getLegalActions(state: GameState): Action[] {
  void state;
  return [];
}

/** 받은 state는 고치지 않고 복사본을 고쳐 돌려줍니다 (03 5절 약속 1). */
export function applyAction(
  state: GameState,
  action: Action,
): { state: GameState; events: GameEvent[] } {
  const handler = handlers[action.type] as Handler<typeof action.type> | undefined;
  if (!handler) {
    throw new IllegalActionError(`'${state.phase}' 국면에서 할 수 없는 행동: ${action.type}`);
  }
  const draft = structuredClone(state);
  const events: GameEvent[] = [];
  handler(draft, events, action);
  return { state: draft, events };
}
