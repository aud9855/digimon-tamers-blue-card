// random: 할 수 있는 행동 중 하나를 무작위로. 전투에서 endTurn은 다른 행동이 없을 때만 (03 7.1)
import type { Action } from '../../core/index';
import type { Policy } from './types';

export const randomPolicy: Policy = (state, legal, ctx) => {
  if (state.phase === 'title') {
    const own = legal.find((a) => a.type === 'startRun' && a.tamerId === ctx.tamerId);
    if (own) return own;
  }
  const pool = state.phase === 'battle' ? legal.filter((a) => a.type !== 'endTurn') : legal;
  const choices: Action[] = pool.length > 0 ? pool : legal;
  const action = choices[ctx.rng.int(choices.length)];
  if (!action) throw new Error('할 수 있는 행동이 없습니다');
  return action;
};
