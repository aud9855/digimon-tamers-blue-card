import { describeIntent, type GameState, type IntentView } from '../../core/index';
import { getEnemy } from '../../data/index';
import { HpBar, StatusRow } from './Bars';
import { ATTRIBUTE_BG, ATTRIBUTE_LABEL } from './labels';

const INTENT_ICON: Record<IntentView['kind'], string> = {
  attack: '⚔',
  defend: '🛡',
  buff: '▲',
  debuff: '▼',
  mixed: '✦',
};

export function IntentBadge({ intent }: { intent: IntentView }) {
  const damage =
    intent.damage === undefined
      ? ''
      : (intent.hits ?? 1) > 1
        ? ` ${intent.damage}×${intent.hits}`
        : ` ${intent.damage}`;
  return (
    <div
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        intent.damage !== undefined ? 'bg-rose-900 text-rose-100' : 'bg-slate-700 text-slate-100'
      }`}
      title={intent.name}
    >
      {INTENT_ICON[intent.kind]}
      {damage}
    </div>
  );
}

export function EnemyView({
  state,
  index,
  selected = false,
  targetable = false,
  onSelect,
}: {
  state: GameState;
  index: number;
  selected?: boolean;
  targetable?: boolean;
  onSelect?: () => void;
}) {
  const enemy = state.battle?.enemies[index];
  if (!enemy) return null;
  const def = getEnemy(enemy.defId);
  if (!enemy.alive) {
    return <div className="max-w-40 flex-1 basis-0" data-enemy-index={index} />;
  }
  const intent = describeIntent(state, index);
  return (
    <button
      type="button"
      data-enemy-index={index}
      disabled={!onSelect}
      onClick={onSelect}
      className={`flex max-w-40 min-w-0 flex-1 basis-0 flex-col items-center gap-1 rounded-xl p-1 ${
        selected ? 'ring-2 ring-amber-300' : targetable ? 'ring-2 ring-sky-400/60' : ''
      }`}
    >
      <IntentBadge intent={intent} />
      <div
        className={`flex aspect-square w-full max-w-20 items-center justify-center rounded-xl ${ATTRIBUTE_BG[def.attribute]} p-1 text-center text-xs font-bold text-white`}
      >
        {def.name}
      </div>
      <div className="text-xs text-slate-400">{ATTRIBUTE_LABEL[def.attribute]}</div>
      <HpBar hp={enemy.hp} maxHp={enemy.maxHp} shield={enemy.shield} />
      <StatusRow statuses={enemy.statuses} accel={enemy.accel} />
    </button>
  );
}
