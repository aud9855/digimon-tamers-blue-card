// 이벤트 (02 7.5)
import { describeEventChoice } from '../../core/index';
import { getEvent } from '../../data/index';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export function EventScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const pending = state.pending?.kind === 'event' ? state.pending : null;
  if (!pending) return null;
  const event = getEvent(pending.eventId);

  return (
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-xl font-black">{event.title}</h1>
        <p className="leading-relaxed text-slate-200">{event.text}</p>
        <div className="mt-auto flex flex-col gap-3">
          {event.choices.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              data-choice={index}
              onClick={() => dispatch({ type: 'eventChoose', index })}
              className="min-h-14 rounded-xl bg-indigo-700 px-4 py-2 text-left active:bg-indigo-600"
            >
              <b>{choice.label}</b>
              <span className="block text-sm text-indigo-200">
                {describeEventChoice(event.id, index)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
