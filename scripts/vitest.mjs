// npm test 실행기.
// Windows에서 작업 폴더가 소문자 드라이브(`d:\…`)로 열리면 vitest가 자기 모듈을
// 두 경로로 따로 불러와 "failed to find the current suite"로 실패합니다.
// 드라이브 문자를 대문자로 맞춘 폴더에서 vitest를 새로 띄워 경로를 하나로 만듭니다.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const vitestBin = join(cwd, 'node_modules', 'vitest', 'vitest.mjs');
const result = spawnSync(process.execPath, [vitestBin, ...process.argv.slice(2)], {
  cwd,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
