// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// 03 10절: core·data는 결정적이어야 하므로 시간·무작위 API를 막습니다.
const nondeterministicGlobals = [
  { name: 'Date', message: '03 5절: core·data에서는 Date를 쓰지 않습니다.' },
  { name: 'performance', message: '03 5절: core·data에서는 performance를 쓰지 않습니다.' },
];

export default tseslint.config(
  { ignores: ['node_modules/', 'dist/', 'build/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // 서비스 워커 템플릿 (빌드 때 __PRECACHE__·__VERSION__을 채움)
    files: ['pwa/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        __PRECACHE__: 'readonly',
        __VERSION__: 'readonly',
      },
    },
  },
  {
    // 개발용 Node 스크립트
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  {
    files: ['src/core/**/*.ts', 'src/data/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: '03 5절: 무작위는 state.rng만 씁니다 (src/core/rng.ts).',
        },
      ],
      'no-restricted-globals': ['error', ...nondeterministicGlobals],
      // 03 1절: 화살표 반대 방향 import 금지
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ui', '**/ui/**', '**/sim', '**/sim/**'],
              message: '03 1절: core·data는 ui·sim을 import하지 않습니다.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
