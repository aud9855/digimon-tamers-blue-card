// npm run sim (03 7.2)
//   npm run sim -- --policy greedy --tamer takato --runs 1000 --seed-start 1
//   npm run sim -- --policy greedy --evolve turn2 --runs 1000
//   npm run sim -- --report m0 [--runs 1000] [--json]
import type { TamerId } from '../core/index';
import type { EvolveMode } from './policies/types';
import {
  encounterTable,
  formatEncounters,
  formatMetrics,
  formatPicks,
  formatSummary,
  m0Metrics,
  metricPasses,
  pickCounts,
  summarize,
} from './report';
import { runMany, type PolicyName, type RunConfig } from './runner';

interface Args {
  policy: PolicyName;
  tamer: TamerId;
  runs: number;
  seedStart: number;
  evolve: EvolveMode;
  report: 'm0' | null;
  json: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    policy: 'greedy',
    tamer: 'takato',
    runs: 1000,
    seedStart: 1,
    evolve: 'asap',
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
        if (v !== 'm0') throw new Error(`없는 보고서: ${v}`);
        args.report = v;
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
  return args;
}

function single(args: Args): void {
  const config: RunConfig = { policy: args.policy, tamerId: args.tamer, evolve: args.evolve };
  const records = runMany(config, args.runs, args.seedStart);
  const summary = summarize(records);
  const encounters = encounterTable(records);
  const picks = pickCounts(records);
  if (args.json) {
    console.log(JSON.stringify({ config, summary, encounters, picks }, null, 2));
    return;
  }
  const label = `${args.policy}${args.policy === 'greedy' ? ` (진화 ${args.evolve})` : ''}`;
  console.log(formatSummary(label, summary));
  console.log('\n## 조우별\n');
  console.log(formatEncounters(encounters));
  console.log('\n## 카드별 고른 횟수\n');
  console.log(formatPicks(picks));
  if (summary.timedOut > 0) process.exitCode = 1;
}

function reportM0(args: Args): void {
  const base = { tamerId: args.tamer } as const;
  const run = (policy: PolicyName, evolve: EvolveMode) =>
    runMany({ ...base, policy, evolve }, args.runs, args.seedStart);
  const greedyRecords = run('greedy', 'asap');
  const inputs = {
    greedy: summarize(greedyRecords),
    greedyTurn2: summarize(run('greedy', 'turn2')),
    greedyNever: summarize(run('greedy', 'never')),
    random: summarize(run('random', 'asap')),
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

const args = parseArgs(process.argv.slice(2));
const started = Date.now();
if (args.report === 'm0') reportM0(args);
else single(args);
if (!args.json) console.log(`\n(걸린 시간 ${((Date.now() - started) / 1000).toFixed(1)}초)`);
