import { describeIntent, type GameState, type IntentView } from '../../core/index';
import { getEnemy } from '../../data/index';
import { HpBar, StatusRow } from './Bars';
import { ATTRIBUTE_LABEL, ATTRIBUTE_RING } from './labels';
import { BattleSprite, EnemySprite } from './Sprites';

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
  size = 80,
}: {
  state: GameState;
  index: number;
  selected?: boolean;
  targetable?: boolean;
  onSelect?: () => void;
  /** 그림 칸 한 변 (px). 적이 적을수록 크게 (04 B1 배치) */
  size?: number;
}) {
  const compact = size <= 80;
  const enemy = state.battle?.enemies[index];
  if (!enemy) return null;
  const def = getEnemy(enemy.defId);
  if (!enemy.alive) {
    return <div className="w-full" data-enemy-index={index} />;
  }
  const intent = describeIntent(state, index);
  return (
    <button
      type="button"
      data-enemy-index={index}
      disabled={!onSelect}
      onClick={onSelect}
      className={`flex w-full min-w-0 flex-col items-center gap-0.5 rounded-xl p-0.5 ${
        selected
          ? 'bg-amber-300/10 ring-2 ring-amber-300'
          : targetable
            ? 'bg-sky-400/10 ring-2 ring-sky-400/60'
            : ''
      }`}
    >
      <IntentBadge intent={intent} />
      <div
        className="flex max-w-full items-end justify-center [filter:drop-shadow(0_0_1px_rgb(255_255_255/0.85))_drop-shadow(0_0_4px_rgb(255_255_255/0.3))]"
        style={{ width: size, height: size }}
        data-enemy-sprite
      >
        <BattleSprite className="h-full w-full" phase={index + 1}>
          <EnemySprite enemyId={def.id} className="h-full w-full" scaled />
        </BattleSprite>
      </div>
      <div className="max-w-full truncate text-xs text-slate-100 [text-shadow:0_1px_0_#000]">
        {def.name}{' '}
        {def.attribute === 'none' ? null : compact ? (
          <span
            className={`ml-0.5 inline-block h-2 w-2 rounded-full ring-2 ${ATTRIBUTE_RING[def.attribute]}`}
            title={ATTRIBUTE_LABEL[def.attribute]}
            aria-label={ATTRIBUTE_LABEL[def.attribute]}
          />
        ) : (
          <span className={`rounded px-0.5 ring-1 ${ATTRIBUTE_RING[def.attribute]} text-slate-300`}>
            {ATTRIBUTE_LABEL[def.attribute]}
          </span>
        )}
      </div>
      <HpBar hp={enemy.hp} maxHp={enemy.maxHp} shield={enemy.shield} />
      <StatusRow statuses={enemy.statuses} accel={enemy.accel} />
    </button>
  );
}
