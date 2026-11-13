// 모든 카드·칩의 설명 글을 docs/balance/card-texts.md로 출력합니다 (04 T0-9).
// 02 9절의 표와 눈으로 대조하기 위한 것입니다. 실행: npm run card-texts
import { mkdirSync, writeFileSync } from 'node:fs';
import { describeCard, describeChip } from '../src/core/index';
import { getCards, getChips } from '../src/data/index';

const lines: string[] = [
  '# 카드·칩 설명 글',
  '',
  '> `npm run card-texts`로 만든 파일입니다. 손으로 고치지 않습니다.',
  '> 02 문서 9절의 표와 대조합니다.',
  '',
  '## 카드',
  '',
  '| id | 이름 | 비용 | 기본 | 강화 |',
  '| :--- | :--- | :---: | :--- | :--- |',
];
for (const card of getCards()) {
  const cost =
    card.base.cost === card.upgraded.cost
      ? `${card.base.cost}`
      : `${card.base.cost} / ${card.upgraded.cost}`;
  lines.push(
    `| \`${card.id}\` | ${card.name} | ${cost} | ${describeCard(card.id, false)} | ${describeCard(card.id, true)} |`,
  );
}
lines.push('', '## 디아크 칩', '', '| id | 이름 | 설명 |', '| :--- | :--- | :--- |');
for (const chip of getChips()) {
  lines.push(`| \`${chip.id}\` | ${chip.name} | ${describeChip(chip.id)} |`);
}
lines.push('');

mkdirSync('docs/balance', { recursive: true });
writeFileSync('docs/balance/card-texts.md', lines.join('\n'), 'utf8');
console.log('docs/balance/card-texts.md');
