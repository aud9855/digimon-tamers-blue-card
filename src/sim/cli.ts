// npm run sim (03 7.2)
//   npm run sim -- --policy greedy --tamer takato --runs 1000 --seed-start 1
//   npm run sim -- --policy greedy --evolve turn2 --runs 1000
//   npm run sim -- --report m0 [--runs 1000] [--json]
//   npm run sim -- --policy greedy --tamer rika --runs 300 --mutation fat_wallet
import type { TamerId } from '../core/index';
import { getMutation, getTamer, getTamers } from '../data/index';
import type { EvolveMode } from './policies/types';
import {
  encounterTable,
  formatEncounters,
  formatMetrics,
  formatPicks,
  formatSummary,
  m0Metrics,
  m2Metrics,
  type Metric,
  metricPasses,
  pickCounts,
  summarize,
} from './report';
import { runMany, runOne, type PolicyName, type RunConfig, type RunRecord } from './runner';

interface Args {
  policy: PolicyName;
  tamer: TamerId;
  runs: number;
  seedStart: number;
  evolve: EvolveMode;
  hazard: number;
  /** 제시되면 고를 변이 (02 15.1) */
  mutation: string | null;
  report: 'm0' | 'm2' | null;
  json: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    policy: 'greedy',
    tamer: 'takato',
    runs: 1000,
    seedStart: 1,
    evolve: 'asap',
    hazard: 0,
    mutation: null,
    report: null,
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    const take = (): string => {
      if (value === undefined) throw new Error(`${key} 뒤에 값이 필요합니다`);
      i++;
      return value;
    };
    switch (key) {
      case '--policy': {
        const v = take();
        if (v !== 'random' && v !== 'greedy') throw new Error(`없는 정책: ${v}`);
        args.policy = v;
        break;
      }
      case '--tamer':
        args.tamer = take() as TamerId;
        break;
      case '--runs':
        args.runs = Number(take());
        break;
      case '--seed-start':
        args.seedStart = Number(take());
        break;
      case '--evolve': {
        const v = take();
        if (v !== 'asap' && v !== 'turn2' && v !== 'never') throw new Error(`없는 진화 방식: ${v}`);
        args.evolve = v;
        break;
      }
      case '--report': {
        const v = take();
        if (v !== 'm0' && v !== 'm2') throw new Error(`없는 보고서: ${v}`);
        args.report = v;
        break;
      }
      case '--hazard':
        args.hazard = Number(take());
        break;
      case '--mutation': {
        const v = take();
        getMutation(v); // 없는 id면 예외
        args.mutation = v;
        break;
      }
      case '--json':
        args.json = true;
        break;
      default:
        throw new Error(`알 수 없는 인자: ${key}`);
    }
  }
  if (!Number.isInteger(args.runs) || args.runs <= 0) throw new Error('--runs는 양의 정수');
  if (!Number.isInteger(args.seedStart)) throw new Error('--seed-start는 정수');
  if (!Number.isInteger(args.hazard) || args.hazard < 0)
    throw new Error('--hazard는 0 이상의 정수');
  return args;
}

function single(args: Args): void {
  const config: RunConfig = {
    policy: args.policy,
    tamerId: args.tamer,
    evolve: args.evolve,
    hazard: args.hazard,
    ...(args.mutation ? { mutation: args.mutation } : {}),
  };
  const records = runMany(config, args.runs, args.seedStart);
  const summary = summarize(records);
  const encounters = encounterTable(records);
  const picks = pickCounts(records);
  const mutation = args.mutation ? mutationReport(config, records, args.mutation) : null;
  if (args.json) {
    const out = { config, summary, encounters, picks, ...(mutation ? { mutation } : {}) };
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  const label = `${args.policy}${args.policy === 'greedy' ? ` (진화 ${args.evolve})` : ''}${args.hazard > 0 ? ` · 해저드 ${args.hazard}` : ''}`;
  console.log(formatSummary(label, summary));
  if (mutation) console.log(formatMutationReport(mutation));
  console.log('\n## 조우별\n');
  console.log(formatEncounters(encounters));
  console.log('\n## 카드별 고른 횟수\n');
  console.log(formatPicks(picks));
  if (summary.timedOut > 0) process.exitCode = 1;
}

interface MutationReport {
  mutationId: string;
  runs: number;
  /** 변이가 3개 후보에 들어 고른 판 수. 나머지 판은 건너뜀 */
  chosen: number;
  /** 고른 판의 승률 */
  chosenWinRate: number;
  /** 고른 판과 같은 시드를 변이 없이(건너뛰고) 돌린 승률 */
  sameSeedsNoMutationWinRate: number;
}

/**
 * --mutation (02 15.1): 변이는 core 규칙대로 3개 후보에 들 때만 고를 수 있어 섞인 판이 됩니다.
 * 고른 판만 떼어, 같은 시드를 변이 없이 돌린 판과 짝지어 비교합니다.
 * mutation 흐름은 다른 흐름과 따로라 고른 시드는 시드 전체에서 고르게 뽑힌 것과 같습니다.
 */
function mutationReport(
  config: RunConfig,
  records: RunRecord[],
  mutationId: string,
): MutationReport {
  const chosen = records.filter((r) => r.finalState.run?.mutation === mutationId);
  const noMutation: RunConfig = { ...config };
  delete noMutation.mutation;
  const baseline = chosen.map((r) => runOne(r.seed, noMutation));
  const rate = (list: RunRecord[]) =>
    list.length === 0 ? 0 : list.filter((r) => r.won).length / list.length;
  return {
    mutationId,
    runs: records.length,
    chosen: chosen.length,
    chosenWinRate: rate(chosen),
    sameSeedsNoMutationWinRate: rate(baseline),
  };
}

function formatMutationReport(m: MutationReport): string {
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  const diff = (m.chosenWinRate - m.sameSeedsNoMutationWinRate) * 100;
  return [
    `\n## 변이 ${getMutation(m.mutationId).name} (${m.mutationId})\n`,
    `- 후보에 들어 고른 판: ${m.chosen} / ${m.runs} (후보에 없어 건너뛴 판 ${m.runs - m.chosen})`,
    `- 고른 판 승률: ${pct(m.chosenWinRate)}`,
    `- 같은 시드, 변이 없음: ${pct(m.sameSeedsNoMutationWinRate)} (차이 ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%p)`,
  ].join('\n');
}

function reportM0(args: Args): void {
  const base = { tamerId: args.tamer } as const;
  const run = (policy: PolicyName, evolve: EvolveMode) =>
    runMany({ ...base, policy, evolve }, args.runs, args.seedStart);
  const greedyRecords = run('greedy', 'asap');
  // M0는 0단계 기준이라 1막만 잽니다 (02 10절)
  const inputs = {
    greedy: summarize(greedyRecords, 1),
    greedyTurn2: summarize(run('greedy', 'turn2'), 1),
    greedyNever: summarize(run('greedy', 'never'), 1),
    random: summarize(run('random', 'asap'), 1),
  };
  const metrics = m0Metrics(inputs);
  const encounters = encounterTable(greedyRecords);
  const picks = pickCounts(greedyRecords);
  if (args.json) {
    console.log(JSON.stringify({ metrics, summaries: inputs, encounters, picks }, null, 2));
    return;
  }
  const passed = metrics.filter(metricPasses).length;
  console.log(
    `# M0 측정 (${args.tamer}, 시드 ${args.seedStart}~${args.seedStart + args.runs - 1})\n`,
  );
  console.log(formatMetrics(metrics));
  console.log(`\n통과 ${passed} / ${metrics.length}\n`);
  console.log(formatSummary('greedy (asap)', inputs.greedy));
  console.log(formatSummary('greedy (turn2)', inputs.greedyTurn2));
  console.log(formatSummary('greedy (never)', inputs.greedyNever));
  console.log(formatSummary('random', inputs.random));
  console.log('\n## 조우별 (greedy asap)\n');
  console.log(formatEncounters(encounters));
  console.log('\n## 카드별 고른 횟수 (greedy asap)\n');
  console.log(formatPicks(picks));
}

/** 02 12.12: 테이머 3명 × 3막, 테이머마다 지표와 테이머끼리 승률 차이 */
function reportM2(args: Args): void {
  const tamers = getTamers().map((t) => t.id);
  const results = tamers.map((tamerId) => {
    const run = (policy: PolicyName, evolve: EvolveMode) =>
      runMany({ tamerId, policy, evolve }, args.runs, args.seedStart);
    const greedyRecords = run('greedy', 'asap');
    const neverRecords = run('greedy', 'never');
    const inputs = {
      greedy: summarize(greedyRecords),
      greedyTurn2: summarize(run('greedy', 'turn2')),
      greedyNever: summarize(neverRecords),
      random: summarize(run('random', 'asap')),
    };
    const act1 = { greedy: summarize(greedyRecords, 1), greedyNever: summarize(neverRecords, 1) };
    return { tamerId, inputs, metrics: m2Metrics(inputs, act1) };
  });
  const winRates = results.map((r) => r.inputs.greedy.winRate * 100);
  const spread = Math.max(...winRates) - Math.min(...winRates);
  const spreadMetric: Metric = {
    name: '테이머끼리 greedy 승률 차이',
    value: spread,
    min: null,
    max: 10,
    unit: '%p',
  };
  if (args.json) {
    console.log(JSON.stringify({ results, spread: spreadMetric }, null, 2));
    return;
  }
  console.log(
    `# M2 측정 (테이머 ${tamers.length}명 × 3막, 시드 ${args.seedStart}~${args.seedStart + args.runs - 1})\n`,
  );
  let passed = metricPasses(spreadMetric) ? 1 : 0;
  let total = 1;
  for (const r of results) {
    console.log(`## ${getTamer(r.tamerId).name} (${r.tamerId})\n`);
    console.log(formatMetrics(r.metrics));
    console.log('');
    passed += r.metrics.filter(metricPasses).length;
    total += r.metrics.length;
  }
  console.log(formatMetrics([spreadMetric]));
  console.log(`\n통과 ${passed} / ${total}`);
}

const args = parseArgs(process.argv.slice(2));
const started = Date.now();
if (args.report === 'm0') reportM0(args);
else if (args.report === 'm2') reportM2(args);
else single(args);
if (!args.json) console.log(`\n(걸린 시간 ${((Date.now() - started) / 1000).toFixed(1)}초)`);
