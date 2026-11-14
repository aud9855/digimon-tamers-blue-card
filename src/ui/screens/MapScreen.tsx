// 지도 화면 (04 T1-5): 갈 수 있는 칸만 눌림. 지나온 길이 보임
import { useEffect, useMemo, useRef } from 'react';
import { getLegalActions, type MapNode, type NodeType } from '../../core/index';
import { constants, getAct } from '../../data/index';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { useDisplayState, useGame } from '../store';

export const NODE_LABEL: Record<NodeType, { icon: string; name: string; color: string }> = {
  battle: { icon: '⚔', name: '전투', color: 'bg-slate-600' },
  elite: { icon: '☠', name: '강적', color: 'bg-rose-700' },
  event: { icon: '?', name: '이벤트', color: 'bg-indigo-600' },
  shop: { icon: '¤', name: '상점', color: 'bg-amber-600' },
  rest: { icon: '♨', name: '휴식', color: 'bg-emerald-700' },
  treasure: { icon: '◆', name: '보물', color: 'bg-sky-600' },
  boss: { icon: '♛', name: '보스', color: 'bg-fuchsia-700' },
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
    <Screen>
      <RunHeader state={state} />
      {run.nodeId === null ? (
        <div className="mx-4 mt-2 rounded-xl bg-slate-900 px-3 py-2" data-testid="act-intro">
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
        <div className="relative mx-auto" style={{ width, height }}>
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
            return (
              <button
                key={node.id}
                type="button"
                data-node-id={node.id}
                data-reachable={canGo}
                disabled={!canGo}
                onClick={() => dispatch({ type: 'chooseNode', nodeId: node.id })}
                className={`absolute flex flex-col items-center justify-center rounded-full text-white ${label.color} ${
                  canGo
                    ? 'animate-pulse ring-4 ring-sky-400'
                    : visited
                      ? 'ring-4 ring-amber-400'
                      : 'opacity-50'
                } ${here ? 'scale-110' : ''}`}
                style={{
                  left: x - NODE / 2,
                  top: y - NODE / 2,
                  width: node.type === 'boss' ? NODE + 12 : NODE,
                  height: node.type === 'boss' ? NODE + 12 : NODE,
                  marginLeft: node.type === 'boss' ? -6 : 0,
                  marginTop: node.type === 'boss' ? -6 : 0,
                }}
              >
                <span className="text-lg leading-none">{label.icon}</span>
                <span className="text-[12px] leading-tight">{label.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
