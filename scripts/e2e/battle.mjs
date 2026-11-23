// 자동 확인 (04 T1-9): 화면 폭 360px에서 전투 하나를 화면 조작만으로 끝까지 해 봄.
// 높이는 640px과 낮은 화면 568px 두 가지. 턴 끝 버튼이 화면 안에 있는지, 적 칸 여러 점을 누르면 그 적이 잡히는지도 봄.
// 개발 서버를 띄우고, greedy 봇이 고른 행동을 카드·적·버튼을 눌러 실행합니다.
// 실행: npm run e2e
import { createServer } from 'vite';
import { launchBrowser, sleep } from './browser.mjs';

const WIDTH = 360;
const HEIGHTS = [640, 568];
const SEEDS = [1, 7];
const MAX_STEPS = 400;
// 화면이 바뀐 직후 누르기를 잠깐 막는 시간(src/ui/inputGuard.ts의 INPUT_LOCK_MS)보다 조금 길게 기다림
const SETTLE_MS = 450;

function fail(message) {
  console.error(`실패: ${message}`);
  process.exitCode = 1;
}

const server = await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;
// 적 칸의 가운데·아래쪽·왼쪽 점을 눌렀을 때 그 적 버튼이 잡히는지 (다른 요소가 덮지 않는지)
const HIT_CHECK = `(() => {
  const bad = [];
  for (const el of document.querySelectorAll('button[data-enemy-index]')) {
    const r = el.getBoundingClientRect();
    const i = el.dataset.enemyIndex;
    const pts = [[r.x + r.width / 2, r.y + r.height / 2], [r.x + r.width / 2, r.bottom - 3], [r.x + 4, r.y + r.height / 2]];
    for (const [x, y] of pts) {
      const hit = document.elementFromPoint(x, y)?.closest('[data-enemy-index]');
      if (!hit || hit.dataset.enemyIndex !== i) bad.push(i + '@' + Math.round(x) + ',' + Math.round(y));
    }
  }
  const end = document.querySelector('[data-testid="end-turn"]');
  if (end && end.getBoundingClientRect().bottom > window.innerHeight) bad.push('턴 끝 버튼이 화면 밖');
  return bad;
})()`;

for (const HEIGHT of HEIGHTS) {
  const browser = await launchBrowser({ width: WIDTH, height: HEIGHT });

  try {
    for (const seed of SEEDS) {
      await browser.goto(`${origin}/?debug=battle&seed=${seed}&steps=0`);
      if ((await browser.eval('window.__game().phase')) !== 'battle') {
        fail(`시드 ${seed}: 전투로 시작하지 않음`);
        continue;
      }
      await sleep(SETTLE_MS);
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
        await sleep(SETTLE_MS);
        // 가로로 넘치는 곳이 없어야 함 (03 9.2 기준 폭 360px)
        overflow = Math.max(overflow, await browser.eval('document.documentElement.scrollWidth'));
        const bad = await browser.eval(HIT_CHECK);
        if (bad.length > 0) {
          fail(`시드 ${seed}, 높이 ${HEIGHT}: 누를 수 없는 곳 ${bad.join(' ')}`);
          break;
        }

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
        console.log(
          `시드 ${seed}, 높이 ${HEIGHT}: 전투 끝 (${phase}), 화면 조작 ${steps}번, 폭 ${overflow}px`,
        );
      }
    }
    // 변이 고르기 화면 (02 15.1): 3장과 건너뛰기가 화면 안에 있고, 고르면 덱 정보 줄에 보임
    await browser.goto(`${origin}/?debug=bot&seed=1&actions=0&phase=mutation`);
    if ((await browser.eval('window.__game().phase')) !== 'mutation') {
      fail('변이 국면으로 시작하지 않음');
    } else {
      await sleep(SETTLE_MS);
      const cards = await browser.eval(`document.querySelectorAll('[data-mutation]').length`);
      const width = await browser.eval('document.documentElement.scrollWidth');
      const skipInside = await browser.eval(`(() => {
        const r = document.querySelector('[data-testid="skip-mutation"]')?.getBoundingClientRect();
        return !!r && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
      })()`);
      if (cards !== 3) fail(`변이 카드가 3장이 아님 (${cards})`);
      if (width > WIDTH) fail(`변이 화면이 가로로 넘침 (${width}px)`);
      if (!skipInside) fail('건너뛰기 단추가 화면 밖');
      await browser.tap('[data-mutation="0"]');
      await sleep(SETTLE_MS);
      const chosen = await browser.eval('window.__game().run.mutation');
      const shown = await browser.eval(`!!document.querySelector('[data-testid="run-mutation"]')`);
      if (!chosen || !shown) fail(`변이를 고른 뒤 상태·표시가 맞지 않음 (${chosen}, ${shown})`);
      else console.log(`높이 ${HEIGHT}: 변이 화면 확인 (${chosen}), 폭 ${width}px`);
    }
    if (browser.errors.length > 0) fail(`페이지 오류: ${browser.errors.join(' / ')}`);
  } finally {
    await browser.close();
  }
}
await server.close();
