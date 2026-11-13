// 지표 계산·목표와 비교 (02 10절, 03 7.2)
import { getCard, getEncounter } from '../data/index';
import type { BattleRecord, RunRecord } from './runner';

export interface Summary {
  runs: number;
  winRate: number;
  timedOut: number;
  avgTurns: Record<BattleRecord['kind'], number | null>;
  normalHpLoss: number | null;
  evolvedBattleRatio: number | null;
  overdrawTurnRatio: number | null;
}

function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

function ratio(part: number, whole: number): number | null {
  return whole === 0 ? null : part / whole;
}

export function summarize(records: RunRecord[]): Summary {
  const battles = records.flatMap((r) => r.battles);
  const won = battles.filter((b) => b.won);
  const turnsOf = (kind: BattleRecord['kind']) =>
    mean(won.filter((b) => b.kind === kind).map((b) => b.turns));
  return {
    runs: records.length,
    winRate: ratio(records.filter((r) => r.won).length, records.length) ?? 0,
    timedOut: records.filter((r) => r.timedOut).length,
    avgTurns: { normal: turnsOf('normal'), elite: turnsOf('elite'), boss: turnsOf('boss') },
    normalHpLoss: mean(won.filter((b) => b.kind === 'normal').map((b) => b.hpBefore - b.hpAfter)),
    evolvedBattleRatio: ratio(battles.filter((b) => b.evolveCount > 0).length, battles.length),
    overdrawTurnRatio: ratio(
      records.reduce((s, r) => s + r.overdrawTurns, 0),
      records.reduce((s, r) => s + r.turnsEnded, 0),
    ),
  };
}

// ── 02 10절 지표 ──

export interface M0Inputs {
  greedy: Summary;
  greedyTurn2: Summary;
  greedyNever: Summary;
  random: Summary;
}

export interface Metric {
  name: string;
  value: number | null;
  min: number | null;
  max: number | null;
  /** 표시 단위 */
  unit: '%' | '%p' | '';
}

export function m0Metrics(m: M0Inputs): Metric[] {
  const pct = (v: number | null) => (v === null ? null : v * 100);
  return [
    { name: 'greedy 봇 승률', value: pct(m.greedy.winRate), min: 55, max: 70, unit: '%' },
    { name: 'random 봇 승률', value: pct(m.random.winRate), min: null, max: 10, unit: '%' },
    {
      name: '일반 전투 평균 턴 수 (greedy)',
      value: m.greedy.avgTurns.normal,
      min: 3,
      max: 5,
      unit: '',
    },
    { name: '강적 전투 평균 턴 수', value: m.greedy.avgTurns.elite, min: 4.5, max: 7, unit: '' },
    { name: '보스 전투 평균 턴 수', value: m.greedy.avgTurns.boss, min: 6, max: 10, unit: '' },
    {
      name: '일반 전투 한 번에 잃는 HP 평균',
      value: m.greedy.normalHpLoss,
      min: 5,
      max: 12,
      unit: '',
    },
    {
      name: '진화한 전투의 비율 (greedy)',
      value: pct(m.greedy.evolvedBattleRatio),
      min: 80,
      max: null,
      unit: '%',
    },
    {
      name: '메모리를 당겨쓴 턴의 비율 (greedy)',
      value: pct(m.greedy.overdrawTurnRatio),
      min: 3,
      max: 40,
      unit: '%',
    },
    {
      name: '진화의 보람: greedy - greedy(진화 안 함)',
      value: (m.greedy.winRate - m.greedyNever.winRate) * 100,
      min: 10,
      max: 30,
      unit: '%p',
    },
    {
      name: '진화 시점의 선택: greedy - greedy(2턴부터)',
      value: (m.greedy.winRate - m.greedyTurn2.winRate) * 100,
      min: -10,
      max: 10,
      unit: '%p',
    },
  ];
}

export function metricPasses(metric: Metric): boolean {
  if (metric.value === null) return false;
  if (metric.min !== null && metric.value < metric.min) return false;
  if (metric.max !== null && metric.value > metric.max) return false;
  return true;
}

// ── 조우별·카드별 ──

export interface EncounterRow {
  encounterId: string;
  name: string;
  fights: number;
  winRate: number;
  avgTurns: number | null;
  avgHpLoss: number | null;
}

export function encounterTable(records: RunRecord[]): EncounterRow[] {
  const groups = new Map<string, BattleRecord[]>();
  for (const b of records.flatMap((r) => r.battles)) {
    groups.set(b.encounterId, [...(groups.get(b.encounterId) ?? []), b]);
  }
  return [...groups.entries()]
    .map(([encounterId, list]) => {
      const won = list.filter((b) => b.won);
      return {
        encounterId,
        name: getEncounter(encounterId).enemies.join(', '),
        fights: list.length,
        winRate: won.length / list.length,
        avgTurns: mean(won.map((b) => b.turns)),
        avgHpLoss: mean(won.map((b) => b.hpBefore - b.hpAfter)),
      };
    })
    .sort((a, b) => a.encounterId.localeCompare(b.encounterId));
}

export function pickCounts(records: RunRecord[]): { defId: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of records.flatMap((r) => r.picks)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .map(([defId, count]) => ({ defId, name: getCard(defId).name, count }))
    .sort((a, b) => b.count - a.count);
}

// ── 글로 보이기 ──

function fmt(value: number | null, unit: Metric['unit'] | '' = ''): string {
  if (value === null) return '—';
  const digits = unit === '' ? 2 : 1;
  return `${value.toFixed(digits)}${unit}`;
}

function range(metric: Metric): string {
  const u = metric.unit;
  if (metric.min !== null && metric.max !== null) return `${metric.min}~${metric.max}${u}`;
  if (metric.min !== null) return `${metric.min}${u} 이상`;
  return `${metric.max}${u} 이하`;
}

export function formatMetrics(metrics: Metric[]): string {
  const lines = ['| 지표 | 값 | 목표 | 결과 |', '| :--- | ---: | :--- | :---: |'];
  for (const m of metrics) {
    lines.push(
      `| ${m.name} | ${fmt(m.value, m.unit)} | ${range(m)} | ${metricPasses(m) ? '통과' : '벗어남'} |`,
    );
  }
  return lines.join('\n');
}

export function formatSummary(label: string, s: Summary): string {
  return [
    `### ${label}`,
    `- 판 수: ${s.runs}, 승률: ${fmt(s.winRate * 100, '%')}, 끝나지 않은 판: ${s.timedOut}`,
    `- 평균 턴 수: 일반 ${fmt(s.avgTurns.normal)}, 강적 ${fmt(s.avgTurns.elite)}, 보스 ${fmt(s.avgTurns.boss)}`,
    `- 일반 전투 HP 손실 평균: ${fmt(s.normalHpLoss)}`,
    `- 진화한 전투 비율: ${fmt(s.evolvedBattleRatio === null ? null : s.evolvedBattleRatio * 100, '%')}`,
    `- 당겨쓴 턴 비율: ${fmt(s.overdrawTurnRatio === null ? null : s.overdrawTurnRatio * 100, '%')}`,
  ].join('\n');
}

export function formatEncounters(rows: EncounterRow[]): string {
  const lines = [
    '| 조우 | 적 | 전투 수 | 승률 | 평균 턴 | 평균 HP 손실 |',
    '| :--- | :--- | ---: | ---: | ---: | ---: |',
  ];
  for (const r of rows) {
    lines.push(
      `| ${r.encounterId} | ${r.name} | ${r.fights} | ${fmt(r.winRate * 100, '%')} | ${fmt(r.avgTurns)} | ${fmt(r.avgHpLoss)} |`,
    );
  }
  return lines.join('\n');
}

export function formatPicks(rows: ReturnType<typeof pickCounts>): string {
  const lines = ['| 카드 | 고른 횟수 |', '| :--- | ---: |'];
  for (const r of rows) lines.push(`| ${r.name} (\`${r.defId}\`) | ${r.count} |`);
  return lines.join('\n');
}
