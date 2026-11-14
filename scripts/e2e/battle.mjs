// 자동 확인 (04 T1-9): 화면 폭 360px에서 전투 하나를 화면 조작만으로 끝까지 해 봄.
// 개발 서버를 띄우고, greedy 봇이 고른 행동을 카드·적·버튼을 눌러 실행합니다.
// 실행: npm run e2e
import { createServer } from 'vite';
import { launchBrowser, sleep } from './browser.mjs';

const WIDTH = 360;
const HEIGHT = 640;
const SEEDS = [1, 7];
const MAX_STEPS = 400;

function fail(message) {
  console.error(`실패: ${message}`);
  process.exitCode = 1;
}

const server = await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await launchBrowser({ width: WIDTH, height: HEIGHT });

try {
  for (const seed of SEEDS) {
    await browser.goto(`${origin}/?debug=battle&seed=${seed}&steps=0`);
    if ((await browser.eval('window.__game().phase')) !== 'battle') {
      fail(`시드 ${seed}: 전투로 시작하지 않음`);
      continue;
    }
    // 연출은 빠르게
    await browser.tap('[data-testid="speed"]');

    let steps = 0;
    let overflow = 0;
    while (steps < MAX_STEPS) {
      // 재생이 끝날 때까지 기다림
      for (let i = 0; i < 100; i++) {
        if (!(await browser.eval(`!!document.querySelector('[data-testid="playback"]')`))) break;
        await sleep(50);
      }
      if ((await browser.eval('window.__game().phase')) !== 'battle') break;
      // 가로로 넘치는 곳이 없어야 함 (03 9.2 기준 폭 360px)
      overflow = Math.max(overflow, await browser.eval('document.documentElement.scrollWidth'));

      const action = await browser.eval('window.__bot()');
      const before = await browser.eval('JSON.stringify(window.__game())');
      if (action.type === 'playCard') {
        await browser.tap(`[data-card-uid="${action.cardUid}"]`);
        if (action.targetIndex === undefined) await browser.tap('[data-testid="play-zone"]');
        else await browser.tap(`button[data-enemy-index="${action.targetIndex}"]`);
      } else if (action.type === 'evolve') {
        await browser.tap('[data-testid="evolve"]');
        if (await browser.eval(`document.body.innerText.includes('한 번 더')`)) {
          await browser.tap('[data-testid="evolve"]');
        }
      } else if (action.type === 'endTurn') {
        await browser.tap('[data-testid="end-turn"]');
      } else {
        fail(`시드 ${seed}: 전투 중에 예상하지 못한 행동 ${action.type}`);
        break;
      }
      for (let i = 0; i < 100; i++) {
        if (!(await browser.eval(`!!document.querySelector('[data-testid="playback"]')`))) break;
        await sleep(50);
      }
      if ((await browser.eval('JSON.stringify(window.__game())')) === before) {
        fail(`시드 ${seed}: 화면 조작이 반영되지 않음 ${JSON.stringify(action)}`);
        break;
      }
      steps++;
    }

    const phase = await browser.eval('window.__game().phase');
    if (!['reward', 'runWon', 'runLost'].includes(phase)) {
      fail(`시드 ${seed}: 전투가 끝나지 않음 (국면 ${phase}, 조작 ${steps}번)`);
    } else if (overflow > WIDTH) {
      fail(`시드 ${seed}: 화면이 가로로 넘침 (${overflow}px)`);
    } else {
      console.log(`시드 ${seed}: 전투 끝 (${phase}), 화면 조작 ${steps}번, 폭 ${overflow}px`);
    }
  }
  if (browser.errors.length > 0) fail(`페이지 오류: ${browser.errors.join(' / ')}`);
} finally {
  await browser.close();
  await server.close();
}
