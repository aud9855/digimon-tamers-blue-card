// 막별 전투 배경 도트 (직접 그림, 04 B1). 180×320 논리 픽셀을 화면 폭에 맞춰 늘려 씀.
// 위쪽이 무대(하늘·지평선·땅)이고, 아래는 게임 바탕색으로 자연스럽게 이어짐.
// 다시 그리기: node scripts/art/battle-bg.mjs  → src/ui/art/stage/bg-act{1,2,3}.png
/* global document -- paint()는 브라우저 안에서 돌아감 */
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { launchBrowser } from '../e2e/browser.mjs';

const OUT = process.argv[2] ?? 'src/ui/art/stage';

function paint(act) {
  const W = 180,
    H = 320;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  let seed = act * 977 + 13;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const px = (X, Y, col) => {
    x.fillStyle = col;
    x.fillRect(X | 0, Y | 0, 1, 1);
  };
  const rect = (X, Y, w, h, col) => {
    x.fillStyle = col;
    x.fillRect(X | 0, Y | 0, w | 0, h | 0);
  };
  // 띠 그라디언트 + 경계 디더링
  const bands = (y0, y1, cols) => {
    const n = cols.length,
      hgt = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const a = Math.round(y0 + i * hgt),
        b = Math.round(y0 + (i + 1) * hgt);
      rect(0, a, W, b - a, cols[i]);
      if (i < n - 1)
        for (let X = 0; X < W; X++) {
          if ((X + b) % 2 === 0) px(X, b - 1, cols[i + 1]);
          if (X % 4 === (b % 2) * 2) px(X, b - 2, cols[i + 1]);
        }
    }
  };
  const disc = (cx, cy, r, col) => {
    for (let Y = -r; Y <= r; Y++)
      for (let X = -r; X <= r; X++) if (X * X + Y * Y <= r * r + r * 0.6) px(cx + X, cy + Y, col);
  };
  const UI = '#0b1220'; // index.css body 바탕색
  const HZ = 104; // 지평선
  const GROUND = 200; // 땅 끝 → 카드 판
  const fadeBottom = (cols) => {
    bands(GROUND, GROUND + cols.length * 6, cols);
    rect(0, GROUND + cols.length * 6, W, H, UI);
  };

  if (act === 1) {
    // ── 1막: 밤 도시, 짙은 안개 ──
    bands(0, HZ, ['#070a1e', '#0b1030', '#121644', '#1a1b52', '#26205c', '#352663', '#4a2e6a']);
    for (let i = 0; i < 40; i++) px(rnd() * W, rnd() * 60, rnd() < 0.3 ? '#ffffff' : '#8f9bd6');
    disc(146, 24, 7, '#e9e4c9');
    disc(149, 22, 6, '#0b1030'); // 초승달
    // 먼 빌딩
    for (let X = -4; X < W;) {
      const w = (6 + rnd() * 12) | 0,
        h = (14 + rnd() * 34) | 0;
      rect(X, HZ - h, w, h, '#1d1f48');
      if (rnd() < 0.3) rect(X + w / 2, HZ - h - 5, 1, 5, '#1d1f48');
      for (let Y = HZ - h + 3; Y < HZ - 2; Y += 3)
        for (let k = X + 1; k < X + w - 1; k += 2)
          if (rnd() < 0.18) px(k, Y, rnd() < 0.7 ? '#6b6aa8' : '#c9a65a');
      X += w + ((rnd() * 2) | 0);
    }
    // 쌍둥이 탑
    const tower = (X, h) => {
      rect(X, HZ - h, 16, h, '#10122e');
      rect(X + 2, HZ - h - 6, 5, 6, '#10122e');
      rect(X + 9, HZ - h - 6, 5, 6, '#10122e');
      px(X + 4, HZ - h - 8, '#ff5a5a');
      px(X + 11, HZ - h - 8, '#ff5a5a');
      for (let Y = HZ - h + 4; Y < HZ - 2; Y += 3)
        for (let k = X + 2; k < X + 15; k += 2) if (rnd() < 0.35) px(k, Y, '#f3d27a');
    };
    tower(22, 70);
    // 가까운 빌딩
    for (let X = 44; X < W;) {
      const w = (10 + rnd() * 16) | 0,
        h = (22 + rnd() * 40) | 0;
      rect(X, HZ - h, w, h, '#12143a');
      rect(X, HZ - h, w, 1, '#2a2c66');
      for (let Y = HZ - h + 3; Y < HZ - 2; Y += 4)
        for (let k = X + 2; k < X + w - 2; k += 3)
          if (rnd() < 0.32) rect(k, Y, 2, 2, rnd() < 0.75 ? '#f3d27a' : '#8fd0ff');
      X += w + ((rnd() * 3) | 0);
    }
    // 땅: 아스팔트 + 원근 차선
    bands(HZ, GROUND, ['#1b1c3a', '#191a35', '#171830', '#15162b', '#131427']);
    for (let Y = HZ + 2; Y < GROUND; Y++) {
      const t = (Y - HZ) / (GROUND - HZ),
        half = 6 + t * 70;
      px(90 - half, Y, '#2b2d55');
      px(90 + half, Y, '#2b2d55');
      if (((Y - HZ) >> 2) % 2 === 0) {
        const w = (1 + t * 2) | 0;
        rect(90 - (w >> 1), Y, w, 1, '#56577e');
      }
    }
    for (const X of [8, 172]) {
      rect(X, HZ - 26, 1, 30, '#2b2d55');
      rect(X - 2, HZ - 27, 5, 1, '#2b2d55');
      disc(X, HZ - 25, 2, '#ffe7a3');
    }
    // 안개
    // 안개: 4×4 규칙 디더 + 부드러운 물결 농도 (잡점 대신 가로 띠)
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const fog = (y0, y1, col, p, ph) => {
      const mid = (y0 + y1) / 2,
        half = (y1 - y0) / 2;
      for (let Y = y0; Y < y1; Y++)
        for (let X = 0; X < W; X++) {
          const wave = 0.55 + 0.45 * Math.sin(X * 0.045 + ph + Math.sin(Y * 0.3) * 0.6);
          const edge = 1 - Math.abs(Y - mid) / half;
          const d = p * wave * Math.min(1, edge * 1.6);
          if (d * 16 > BAYER[(Y % 4) * 4 + (X % 4)] + 0.5) px(X, Y, col);
        }
    };
    fog(HZ - 26, HZ + 6, '#5a5a92', 0.55, 0);
    fog(HZ - 12, HZ + 18, '#8e8fc2', 0.45, 2);
    fog(HZ + 4, HZ + 30, '#b9badf', 0.3, 4);
    fog(HZ + 34, HZ + 60, '#4a4b7c', 0.3, 1);
    fadeBottom(['#121328', '#101226', '#0e1224', '#0c1122']);
  }
  if (act === 2) {
    // ── 2막: 디지털 월드, 데이터 하늘과 모래 언덕 ──
    bands(0, HZ, ['#0e2a3a', '#123446', '#174152', '#1d505f', '#26626c', '#357878', '#4b8f84']);
    for (let k = -6; k <= 6; k++)
      for (let Y = 0; Y < HZ - 10; Y += 2) px(90 + k * 14 * (1 + Y / 60), Y, '#2f6d78');
    for (let Y = 6; Y < HZ - 12; Y += 10) for (let X = 0; X < W; X += 2) px(X, Y, '#24596a');
    for (let i = 0; i < 9; i++) {
      const X = (8 + rnd() * 164) | 0,
        top = (rnd() * 30) | 0,
        len = (20 + rnd() * 40) | 0;
      for (let Y = top; Y < top + len; Y++)
        if (Y % 3 !== 0) px(X, Y, Y > top + len - 4 ? '#e8fff8' : '#7fe8d0');
    }
    const cube = (X, Y, s) => {
      rect(X, Y, s, s, '#9fe6d6');
      rect(X, Y + s - 1, s, 1, '#4b9a8e');
      rect(X + s - 1, Y, 1, s, '#4b9a8e');
      rect(X, Y, s, 1, '#e8fff8');
    };
    cube(30, 30, 6);
    cube(38, 38, 3);
    cube(132, 18, 8);
    cube(144, 30, 4);
    cube(112, 52, 3);
    for (let X = 0; X < W; X++) {
      const h = (10 + Math.sin(X * 0.05) * 6 + Math.sin(X * 0.13 + 1) * 4) | 0;
      rect(X, HZ - h, 1, h, '#3d6b6a');
    }
    for (let X = 0; X < W; X++) {
      const h =
        (4 + Math.sin(X * 0.09 + 2) * 4 + (X > 120 && X < 150 ? 10 - Math.abs(X - 135) * 0.6 : 0)) |
        0;
      if (h > 0) rect(X, HZ - h, 1, h, '#2e5654');
    }
    // 땅: 지평선 쪽은 하늘빛이 섞인 옅은 모래, 앞으로 올수록 어둡고 차가운 색 → 하늘·땅·카드 판이 이어지게
    bands(HZ, GROUND, [
      '#7f9a86',
      '#8b9a7c',
      '#8d9070',
      '#857f62',
      '#786f56',
      '#69604c',
      '#585344',
      '#47463d',
      '#373a38',
    ]);
    // 원근 데이터 격자 (하늘 격자가 땅으로 이어짐)
    for (let k = -9; k <= 9; k++)
      for (let Y = HZ + 1; Y < GROUND; Y++) {
        const t = (Y - HZ) / (GROUND - HZ);
        if (Y % 2 === 0) px(90 + k * (6 + t * 26), Y, '#5f7c70');
      }
    for (const Y of [HZ + 4, HZ + 10, HZ + 19, HZ + 32, HZ + 50, HZ + 74])
      for (let X = 0; X < W; X += 2) px(X, Y, '#62806f');
    // 모래 물결
    for (let layer = 0; layer < 4; layer++) {
      const base = HZ + 14 + layer * 21;
      for (let X = 0; X < W; X++) {
        const y = (base + Math.sin(X * 0.04 + layer * 1.7) * 4) | 0;
        px(X, y, layer < 2 ? '#a9ae8c' : '#8a8468');
        px(X, y + 1, '#3f4038');
      }
    }
    // 지평선 아지랑이 (하늘과 땅을 섞음)
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let Y = HZ - 18; Y < HZ + 16; Y++)
      for (let X = 0; X < W; X++) {
        const d = 1 - Math.abs(Y - HZ + 1) / 17;
        if (d * 0.75 * 16 > BAYER[(Y % 4) * 4 + (X % 4)] + 0.5) px(X, Y, '#93b7a2');
      }
    // 땅에 비친 데이터 빛
    for (let i = 0; i < 6; i++) {
      const X = (10 + rnd() * 160) | 0,
        top = (HZ + 6 + rnd() * 40) | 0,
        len = (6 + rnd() * 14) | 0;
      for (let Y = top; Y < top + len; Y += 2) px(X, Y, '#7fe8d0');
    }
    fadeBottom(['#2c312f', '#232829', '#1a2026', '#141a24', '#0f1522', '#0c1121']);
  }
  if (act === 3) {
    // ── 3막: 디 리퍼 침공, 붉은 덩어리 ──
    bands(0, HZ, ['#12040a', '#1e060e', '#2c0912', '#3c0c18', '#4f101e', '#661626', '#7d1e2e']);
    const blobs = [];
    for (let i = 0; i < 16; i++)
      blobs.push([(rnd() * W) | 0, (rnd() * 34) | 0, (8 + rnd() * 14) | 0]);
    for (const [X, Y, r] of blobs) disc(X, Y, r, '#5e0d1d');
    for (const [X, Y, r] of blobs) disc(X - 2, Y - 2, r - 3, '#8e1830');
    for (const [X, Y, r] of blobs) disc(X - 4, Y - 4, Math.max(1, r - 9), '#c23048');
    for (const [X, Y, r] of blobs) if (r > 12) px(X - 6, Y - 7, '#ff8a9a');
    for (let i = 0; i < 10; i++) {
      const X = (rnd() * W) | 0,
        top = (30 + rnd() * 10) | 0,
        len = (8 + rnd() * 26) | 0;
      for (let Y = top; Y < top + len; Y++) {
        px(X, Y, '#7a1428');
        if (Y < top + len - 3) px(X + 1, Y, '#5e0d1d');
      }
      disc(X, top + len, 1, '#a8243c');
    }
    for (let X = -3; X < W;) {
      const w = (8 + rnd() * 16) | 0,
        h = (16 + rnd() * 42) | 0;
      rect(X, HZ - h, w, h, '#140509');
      const cut = (rnd() * 6) | 0;
      for (let k = 0; k < cut; k++) px(X + w - 1 - k, HZ - h + k, '#3c0c18');
      for (let Y = HZ - h + 4; Y < HZ - 2; Y += 4)
        for (let k = X + 2; k < X + w - 2; k += 3) if (rnd() < 0.12) px(k, Y, '#ff6a5a');
      X += w + ((rnd() * 4) | 0);
    }
    for (let i = 0; i < 7; i++) {
      const X = (rnd() * W) | 0;
      disc(X, HZ - 4 - ((rnd() * 14) | 0), (5 + rnd() * 6) | 0, '#7a1428');
      disc(X - 1, HZ - 6 - ((rnd() * 12) | 0), 3, '#b02a42');
    }
    bands(HZ, GROUND, ['#24080e', '#200710', '#1c060d', '#18050b', '#14050a']);
    for (let i = 0; i < 9; i++) {
      const X = (rnd() * W) | 0,
        Y = (HZ + 8 + rnd() * 80) | 0,
        w = (10 + rnd() * 24) | 0;
      for (let k = 0; k < w; k++) {
        px(X + k, Y, '#6b1222');
        if (k > 2 && k < w - 2) px(X + k, Y + 1, '#4a0c18');
      }
      px(X + 3, Y, '#d84a5e');
    }
    for (let i = 0; i < 30; i++)
      px(rnd() * W, HZ + rnd() * 90, rnd() < 0.5 ? '#ff7a8a' : '#a8243c');
    fadeBottom(['#110509', '#0f0710', '#0d0d1a', '#0c1020']);
  }
  return c.toDataURL('image/png');
}

const b = await launchBrowser({ width: 400, height: 400 });
try {
  for (const act of [1, 2, 3]) {
    const url = await b.eval(`(${paint.toString()})(${act})`);
    writeFileSync(`${OUT}/bg-act${act}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('ok');
} finally {
  await b.close();
}
