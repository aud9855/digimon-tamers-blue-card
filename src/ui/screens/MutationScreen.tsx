// 변이 카드 고르기 (02 15.1). 글은 core의 describeMutation만 씀
import { describeMutation } from '../../core/index';
import { getMutation } from '../../data/index';
import { PrimaryButton, ScreenTitle } from '../components/common';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function MutationScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const pending = state.pending?.kind === 'mutation' ? state.pending : null;
  if (!pending || !state.run) return null;
  return (
    <Screen backdrop={1}>
      <div className="flex flex-1 flex-col justify-center-safe gap-5 overflow-y-auto px-6 py-6">
        <ScreenTitle kicker="MUTATION" accent="#c084fc" center>
          변이를 고르세요
        </ScreenTitle>
        <p className="-mt-2 text-center text-sm text-slate-400">
          좋은 점과 나쁜 점이 판 내내 함께 갑니다
        </p>
        <div className="flex flex-col gap-3">
          {pending.mutationIds.map((id, index) => {
            const text = describeMutation(id);
            return (
              <button
                key={id}
                type="button"
                data-mutation={index}
                onClick={() => dispatch({ type: 'chooseMutation', index })}
                className="ui-choice flex min-h-16 flex-col items-start gap-1 text-left"
              >
                <b className="text-violet-200">{getMutation(id).name}</b>
                <span className="text-sm text-emerald-300">▲ {text.good}</span>
                <span className="text-sm text-rose-300">▼ {text.bad}</span>
              </button>
            );
          })}
        </div>
        <PrimaryButton
          testId="skip-mutation"
          tone="slate"
          onClick={() => dispatch({ type: 'skipMutation' })}
        >
          건너뛰기
        </PrimaryButton>
      </div>
    </Screen>
  );
}
