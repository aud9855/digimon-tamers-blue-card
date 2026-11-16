// 지도 화면 (04 T1-5): 갈 수 있는 칸만 눌림. 지나온 길이 보임
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { getLegalActions, type MapNode, type NodeType } from '../../core/index';
import { constants, getAct, getEncounter, getForm, getTamer } from '../../data/index';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';
import { EnemySprite, FormSprite, NodeIcon } from '../components/Sprites';

/** 칸 종류별 이름·색(밝은 쪽, 어두운 쪽)·모양 */
export const NODE_LABEL: Record<
  NodeType,
  { name: string; c: string; c2: string; shape?: 'diamond' | 'card' }
> = {
  battle: { name: '전투', c: '#64748b', c2: '#1e293b' },
  elite: { name: '강적', c: '#e11d48', c2: '#4c0519', shape: 'diamond' },
  event: { name: '이벤트', c: '#6366f1', c2: '#1e1b4b', shape: 'card' },
  shop: { name: '상점', c: '#f59e0b', c2: '#451a03' },
  rest: { name: '휴식', c: '#10b981', c2: '#022c22' },
  treasure: { name: '보물', c: '#0ea5e9', c2: '#082f49' },
  boss: { name: '보스', c: '#c026d3', c2: '#3b0764' },
};

/** 한 행의 높이와 열 간격 (px) */
const ROW_H = 76;
const COL_W = 96;
const NODE = 52;
const PAD = 40;

function position(node: MapNode, rows: number) {
  // 1행이 아래, 보스가 위
  const x = PAD + node.col * COL_W + NODE / 2;
  const y = PAD + (rows - node.row) * ROW_H + NODE / 2;
  return { x, y };
}

export function MapScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const scrollRef = useRef<HTMLDivElement>(null);
  const run = state.run;

  const reachable = useMemo(
    () =>
      new Set(getLegalActions(state).flatMap((a) => (a.type === 'chooseNode' ? [a.nodeId] : []))),
    [state],
  );

  const rows = constants.BOSS_ROW;
  const width = PAD * 2 + (constants.MAP_COLS - 1) * COL_W + NODE;
  const height = PAD * 2 + (rows - 1) * ROW_H + NODE;

  // 지금 갈 수 있는 칸이 보이도록 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !run) return;
    const current = run.map.nodes.find((n) => reachable.has(n.id));
    if (!current) return;
    const { y } = position(current, rows);
    el.scrollTop = y - el.clientHeight / 2;
  }, [run, reachable, rows]);

  if (!run) return null;
  const path = new Set(run.path);
  const byId = new Map(run.map.nodes.map((n) => [n.id, n]));
  const pathEdges = new Set(run.path.slice(1).map((id, i) => `${run.path[i]}>${id}`));

  return (
    <Screen backdrop={run.act}>
      <RunHeader state={state} />
      {run.nodeId === null ? (
        <div className="ui-panel mx-4 mt-2 px-3 py-2" data-testid="act-intro">
          <p className="text-sm font-bold text-sky-200">
            {run.act}막 · {getAct(run.act).name}
          </p>
          <p className="text-xs leading-snug text-slate-300">{getAct(run.act).intro}</p>
          <p className="mt-1 text-xs text-slate-500">시작할 칸을 고르세요</p>
        </div>
      ) : (
        <p className="px-4 pt-1 text-xs text-slate-400">
          {run.act}막 · {getAct(run.act).name} — 다음 칸을 고르세요
        </p>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" data-testid="map">
        <div
          className="relative mx-auto bg-[linear-gradient(rgb(56_189_248/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(56_189_248/0.07)_1px,transparent_1px)] bg-[size:24px_24px]"
          style={{ width, height }}
        >
          <svg className="absolute inset-0" width={width} height={height} aria-hidden>
            {run.map.nodes.flatMap((node) =>
              node.next.map((nextId) => {
                const next = byId.get(nextId);
                if (!next) return null;
                const a = position(node, rows);
                const b = position(next, rows);
                const walked = pathEdges.has(`${node.id}>${nextId}`);
                const open = node.id === run.nodeId && reachable.has(nextId);
                return (
                  <line
                    key={`${node.id}>${nextId}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={walked ? '#fbbf24' : open ? '#38bdf8' : '#334155'}
                    strokeWidth={walked || open ? 4 : 2}
                    strokeDasharray={walked ? undefined : '6 6'}
                  />
                );
              }),
            )}
          </svg>
          {run.map.nodes.map((node) => {
            const { x, y } = position(node, rows);
            const label = NODE_LABEL[node.type];
            const canGo = reachable.has(node.id);
            const visited = path.has(node.id);
            const here = node.id === run.nodeId;
            const boss = node.type === 'boss';
            const size = boss ? NODE + 20 : NODE;
            const bossId =
              boss && node.encounterId ? getEncounter(node.encounterId).enemies[0] : undefined;
            return (
              <button
                key={node.id}
                type="button"
                data-node-id={node.id}
                data-reachable={canGo}
                disabled={!canGo}
                aria-label={label.name}
                onClick={() => dispatch({ type: 'chooseNode', nodeId: node.id })}
                className={`absolute ${canGo ? 'map-open' : visited ? 'map-done' : 'map-far'}`}
                style={
                  {
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                    '--c': label.c,
                    '--c2': label.c2,
                  } as CSSProperties
                }
              >
                {boss && (
                  <span className="ui-rays" style={{ '--ray': '240 171 252' } as CSSProperties} />
                )}
                <span className="map-node" data-shape={label.shape}>
                  {bossId ? (
                    <EnemySprite enemyId={bossId} className="h-[85%] w-[85%]" />
                  ) : (
                    <NodeIcon type={node.type} className="h-7 w-7" />
                  )}
                </span>
                <span className="map-tag">{label.name}</span>
                {here && (
                  <FormSprite
                    formId={getForm(getTamer(run.tamerId).line, 'rookie').id}
                    decorative
                    className="absolute -top-7 -right-6 h-11 w-11 [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_2px_0_#000)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
