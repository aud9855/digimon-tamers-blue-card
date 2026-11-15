// 전투 화면에서 쓰는 pixelfx 효과 모음 (03 2절, 04 V1).
// 효과 코드는 https://github.com/patch-gg/pixelfx (커밋 5294518) 에서 ./pixelfx 아래로 손대지 않고 복사했습니다.
// MIT License, Copyright (c) 2026 Patch, Copyright (c) 2026 Hugo Duprez (./pixelfx/LICENSE·NOTICE.md).
import { createFrame, clearFrame, createFx, composite, PAL } from './pixelfx/core/index.js';
import * as hitSpark from './pixelfx/fx/impacts/hit-spark.js';
import * as critHit from './pixelfx/fx/impacts/crit-hit.js';
import * as bluntHit from './pixelfx/fx/impacts/blunt-hit.js';
import * as parry from './pixelfx/fx/impacts/parry.js';
import * as holyPillar from './pixelfx/fx/holy/holy-pillar.js';
import * as collectBurst from './pixelfx/fx/pickups/collect-burst.js';
import * as poof from './pixelfx/fx/spawn/poof.js';
import * as darkExplosion from './pixelfx/fx/shadow/dark-explosion.js';

export const FX_MODULES = {
  hitSpark,
  critHit,
  bluntHit,
  parry,
  holyPillar,
  collectBurst,
  poof,
  darkExplosion,
};

export { createFrame, clearFrame, createFx, composite, PAL };
