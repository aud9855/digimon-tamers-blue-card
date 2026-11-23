// 이벤트 (02 7.5)
import { describeEventChoice, getLegalActions } from '../../core/index';
import { getEvent } from '../../data/index';
import { DeckPicker, ScreenTitle } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function EventScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  // 이벤트 효과로 카드를 고르는 중 (02 14.2): 건너뛸 수 없음
  if (state.pending?.kind === 'eventCard' && state.run) {
    const upgrade = state.pending.mode === 'upgrade';
    const pickable = new Set(
      getLegalActions(state).flatMap((a) => (a.type === 'eventPickCard' ? [a.cardUid] : [])),
    );
    return (
      <Screen backdrop={state.run.act}>
        <DeckPicker
          title={upgrade ? '강화할 카드 (강화된 모습)' : '지울 카드'}
          cards={state.run.deck.filter((c) => pickable.has(c.uid))}
          preview={upgrade ? (c) => ({ defId: c.defId, upgraded: true }) : undefined}
          onPick={(card) => dispatch({ type: 'eventPickCard', cardUid: card.uid })}
        />
      </Screen>
    );
  }
  const pending = state.pending?.kind === 'event' ? state.pending : null;
  if (!pending) return null;
  const event = getEvent(pending.eventId);

  return (
    <Screen backdrop={state.run?.act}>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-6 pb-4">
        <ScreenTitle kicker="DIGITAL FIELD" accent="#a78bfa">
          {event.title}
        </ScreenTitle>
        <p className="ui-panel p-4 leading-relaxed text-slate-200">{event.text}</p>
        <div className="mt-auto flex flex-col gap-3">
          {event.choices.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              data-choice={index}
              onClick={() => dispatch({ type: 'eventChoose', index })}
              className="ui-choice [--accent:#a78bfa]"
            >
              <b className="block text-white">{choice.label}</b>
              <span className="block text-sm text-violet-200">
                {describeEventChoice(event.id, index)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
