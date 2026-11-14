// 실행기: node_modules/.bin의 명령을 "대문자 드라이브" 작업 폴더에서 띄웁니다.
// Windows에서 작업 폴더가 소문자 드라이브(`d:\…`)로 열리면
//   - vitest가 자기 모듈을 두 경로로 불러와 "failed to find the current suite"로 실패하고
//   - 개발 서버에서 Tailwind가 CSS를 만들지 못합니다 (스타일 없는 화면).
// 경로를 하나로 맞추려고 드라이브 문자를 대문자로 바꾼 폴더에서 새로 띄웁니다.
// 사용: node scripts/upper-drive.mjs <명령|스크립트.mjs> [인자...]   (예: vite, vitest, scripts/e2e/battle.mjs)
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [bin, ...args] = process.argv.slice(2);
if (!bin) {
  console.error('사용: node scripts/upper-drive.mjs <명령> [인자...]');
  process.exit(2);
}
const ENTRY = { vite: ['vite', 'bin', 'vite.js'], vitest: ['vitest', 'vitest.mjs'] };
const entry = ENTRY[bin] ?? (bin.endsWith('.mjs') ? [bin] : undefined);
if (!entry) {
  console.error(`모르는 명령: ${bin}`);
  process.exit(2);
}
const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const target = ENTRY[bin] ? join(cwd, 'node_modules', ...entry) : join(cwd, ...entry);
const result = spawnSync(process.execPath, [target, ...args], {
  cwd,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
