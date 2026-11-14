import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * 서비스 워커 만들기 (04 T1-8). 빌드 결과 파일 목록을 pwa/sw.js에 넣어 dist/sw.js로 내보냄.
 * PWA 라이브러리를 쓰지 않으려고 직접 짠 작은 플러그인입니다 (03 2절의 표에 없음).
 */
function serviceWorker(): Plugin {
  return {
    name: 'blue-card-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const publicFiles = [
        'manifest.webmanifest',
        'icon.svg',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'apple-touch-icon.png',
      ];
      const files = ['./', './index.html', ...Object.keys(bundle).map((f) => `./${f}`)];
      const precache = [...new Set([...files, ...publicFiles.map((f) => `./${f}`)])].sort();
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12);
      const source = readFileSync('pwa/sw.js', 'utf8')
        .replace('__PRECACHE__', JSON.stringify(precache))
        .replace('__VERSION__', JSON.stringify(version));
      if (source.includes('__PRECACHE__') || source.includes('__VERSION__')) {
        throw new Error('sw.js 템플릿을 채우지 못했습니다');
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  // 상대 경로: GitHub Pages(/digimon-tamers-blue-card/)와 로컬 미리보기 모두에서 열림
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
  server: { host: true },
});
