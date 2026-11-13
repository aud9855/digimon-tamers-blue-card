import { describe, expect, it } from 'vitest';
import * as core from '../../src/core/index';

// T0-1: 테스트 실행 환경과 core import 경로가 동작하는지만 확인합니다.
describe('프로젝트 뼈대', () => {
  it('core 모듈을 불러올 수 있다', () => {
    expect(core).toBeTypeOf('object');
  });
});
