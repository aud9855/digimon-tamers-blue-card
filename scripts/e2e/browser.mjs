// 브라우저 자동 조작 (Chrome DevTools Protocol). 새 라이브러리 없이 Node 내장 WebSocket만 씀.
// Edge(Windows) 또는 Chrome/Chromium(Linux CI)을 헤드리스로 띄웁니다. CHROME_PATH로 바꿀 수 있음.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowser() {
  const path = CANDIDATES.find((p) => p && existsSync(p));
  if (!path) throw new Error('Chrome이나 Edge를 찾지 못했습니다. CHROME_PATH를 정해 주세요.');
  return path;
}

/** 헤드리스 브라우저를 띄우고 첫 페이지를 다루는 도구를 돌려줌 */
export async function launchBrowser({ width = 360, height = 640 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'blue-card-e2e-'));
  const proc = spawn(findBrowser(), [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    // 포트 0: 비어 있는 포트를 브라우저가 고르고, stderr에 주소를 알려 줌
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);

  // "DevTools listening on ws://127.0.0.1:PORT/devtools/browser/..." 줄에서 포트를 읽음
  let output = '';
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`브라우저가 30초 안에 뜨지 않았습니다.\n${output}`)),
      30_000,
    );
    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//);
      if (match) {
        clearTimeout(timer);
        resolve(Number(match[1]));
      }
    };
    proc.stderr.on('data', onData);
    proc.stdout.on('data', onData);
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`브라우저가 바로 끝났습니다 (코드 ${code}).\n${output}`));
    });
  });

  let page;
  for (let i = 0; i < 100 && !page; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      page = targets.find((t) => t.type === 'page');
    } catch {
      // 아직 뜨는 중
    }
    if (!page) await sleep(100);
  }
  if (!page) throw new Error(`브라우저 페이지에 연결하지 못했습니다.\n${output}`);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push(d.exception?.description ?? d.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
  });

  const api = {
    errors,
    send,
    async goto(url) {
      await send('Page.navigate', { url });
      for (let i = 0; i < 100; i++) {
        await sleep(100);
        const ready = await api.eval('document.readyState === "complete" && !!window.__game');
        if (ready) return;
      }
      throw new Error('페이지가 준비되지 않았습니다: ' + url);
    },
    async eval(expression) {
      const r = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }
      return r.result.value;
    },
    async rect(selector) {
      return api.eval(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      })()`);
    },
    async mouse(type, x, y) {
      await send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1,
      });
    },
    /** 요소 가운데를 눌렀다 뗌 */
    async tap(selector) {
      const r = await api.rect(selector);
      if (!r) throw new Error('없는 요소: ' + selector);
      await api.mouse('mousePressed', r.x, r.y);
      await sleep(40);
      await api.mouse('mouseReleased', r.x, r.y);
      await sleep(120);
    },
    async close() {
      try {
        ws.close();
      } catch {
        // 이미 닫힘
      }
      proc.kill();
      await sleep(300);
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        // 브라우저가 늦게 닫히면 남을 수 있음
      }
    },
  };
  return api;
}
