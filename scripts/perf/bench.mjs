// 성능 측정 (휴대폰에서 느껴지는 것): 첫 화면, 카드 끌기, 턴 끝 연출 재생.
// 배포판과 같은 빌드(확인용 훅만 켬)를 node_modules/.perf-dist에 만들고, 헤드리스 브라우저에서
// CPU를 THROTTLE배(기본 4) 느리게 해 메인 스레드 시간을 잽니다. 규칙이 아니라 화면 속도를 봄.
// 실행: npm run perf
import { build, preview } from 'vite';
import { launchBrowser, sleep } from '../e2e/browser.mjs';

const THROTTLE = Number(process.env.THROTTLE ?? 4);
const OUT = 'node_modules/.perf-dist';
process.env.VITE_DEBUG_HOOKS = '1';
await build({ logLevel: 'error', build: { outDir: OUT, emptyOutDir: true } });
const server = await preview({
  preview: { port: 0, host: '127.0.0.1' },
  build: { outDir: OUT },
  logLevel: 'error',
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const b = await launchBrowser({ width: 360, height: 640 });
await b.send('Performance.enable');

const KEYS = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration'];
const metrics = async () =>
  Object.fromEntries(
    (await b.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]),
  );
const acc = {};
function add(name, a, z) {
  const r = (acc[name] ??= { runs: 0 });
  r.runs++;
  for (const k of KEYS) r[k] = (r[k] ?? 0) + (z[k] - a[k]) * 1000;
}
async function waitPlayback() {
  for (let i = 0; i < 400; i++) {
    if (!(await b.eval(`!!document.querySelector('[data-testid="playback"]')`))) return;
    await sleep(25);
  }
}

// 0) 첫 화면: 버튼이 보일 때까지 (첫 번째는 캐시 없음)
await b.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
const startup = [];
for (let i = 0; i < 4; i++) {
  const t0 = Date.now();
  await b.send('Page.navigate', { url: `${origin}/?r=${i}` });
  for (let k = 0; k < 400; k++) {
    await sleep(20);
    if (await b.eval(`document.querySelectorAll('#root button').length > 0`).catch(() => false))
      break;
  }
  startup.push(Date.now() - t0);
}
await b.send('Emulation.setCPUThrottlingRate', { rate: 1 });

for (const seed of [1, 4, 9]) {
  await b.goto(`${origin}/?debug=bot&seed=${seed}&actions=120&phase=battle`);
  await sleep(1200);
  await b.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  for (let turn = 0; turn < 3; turn++) {
    if ((await b.eval('window.__game().phase')) !== 'battle') break;
    // 1) 끌기: 낼 수 있는 카드 하나를 위로 끌었다가 다시 손패로 내려 놓음(취소)
    const uid = await b.eval(
      `(() => { const a = window.__bot(); return a.type === 'playCard' ? a.cardUid : null })()`,
    );
    if (uid !== null) {
      await sleep(600);
      const r = await b.rect(`[data-card-uid="${uid}"]`);
      const a = await metrics();
      await b.mouse('mousePressed', r.x, r.y);
      for (let i = 1; i <= 40; i++) {
        await b.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: r.x + (i % 7),
          y: r.y - i * 4,
          button: 'left',
          buttons: 1,
        });
      }
      for (let i = 40; i >= 0; i--) {
        await b.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: r.x,
          y: r.y - i * 4,
          button: 'left',
          buttons: 1,
        });
      }
      await b.mouse('mouseReleased', r.x, r.y);
      await sleep(300);
      const z = await metrics();
      add('카드 끌기(81번 움직임)', a, z);
    }
    // 봇 행동을 턴 끝 전까지 (재생 건너뜀)
    for (let i = 0; i < 12; i++) {
      const t = await b.eval('window.__bot().type');
      if (t === 'endTurn' || (await b.eval('window.__game().phase')) !== 'battle') break;
      await b.eval('window.__dispatch(window.__bot())');
    }
    if ((await b.eval('window.__game().phase')) !== 'battle') break;
    await sleep(500);
    // 2) 턴 끝 연출 재생 (보통 속도)
    const a = await metrics();
    await b.tap('[data-testid="end-turn"]');
    await waitPlayback();
    const z = await metrics();
    add('턴 끝 연출 재생', a, z);
    await sleep(500);
  }
  await b.send('Emulation.setCPUThrottlingRate', { rate: 1 });
}
console.log(`CPU ${THROTTLE}배 느리게, 메인 스레드 시간(ms, 한 번 평균)`);
console.log(`첫 화면(버튼 보일 때까지, 벽시계): ${startup.join(' / ')}`);
for (const [name, r] of Object.entries(acc)) {
  const avg = (k) => (r[k] / r.runs).toFixed(0);
  console.log(
    `${name}: 전체 ${avg('TaskDuration')} · 스크립트 ${avg('ScriptDuration')} · 레이아웃 ${avg('LayoutDuration')} · 스타일 ${avg('RecalcStyleDuration')} (${r.runs}번)`,
  );
}
if (b.errors.length) console.log('errors', b.errors);
await b.close();
server.httpServer.close();
process.exit(0);
