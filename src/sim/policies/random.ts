// random: 할 수 있는 행동 중 하나를 무작위로. 전투에서 endTurn은 다른 행동이 없을 때만 (03 7.1)
import type { Action } from '../../core/index';
import { mutationAction, type Policy } from './types';

export const randomPolicy: Policy = (state, legal, ctx) => {
  if (state.phase === 'title') {
    const own = legal.find(
      (a) => a.type === 'startRun' && a.tamerId === ctx.tamerId && (a.hazard ?? 0) === ctx.hazard,
    );
    if (own) return own;
  }
  // 변이는 무작위로 고르지 않음: 기본은 건너뛰기 (02 15.1)
  if (state.phase === 'mutation') return mutationAction(state, ctx);
  const pool = state.phase === 'battle' ? legal.filter((a) => a.type !== 'endTurn') : legal;
  const choices: Action[] = pool.length > 0 ? pool : legal;
  const action = choices[ctx.rng.int(choices.length)];
  if (!action) throw new Error('할 수 있는 행동이 없습니다');
  return action;
};
