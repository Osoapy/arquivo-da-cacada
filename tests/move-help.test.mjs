import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { englishMoves } from '../dist/i18n.js';
import { basicHelp, startingHelp, playbookHelp } from '../dist/move-help.js';

const playbooks = JSON.parse(readFileSync(new URL('../dist/playbooks.json', import.meta.url), 'utf8'));
assert.equal(basicHelp.length, 5);
for (const [name, book] of Object.entries(playbooks)) {
  assert.equal(playbookHelp[name]?.length, book.moves.length, `${name}: descrição por movimento`);
  assert.equal(englishMoves[name]?.length, book.moves.length, `${name}: nome em inglês por movimento`);
  for (const [pt, en] of playbookHelp[name]) assert.ok(pt && en, `${name}: dois idiomas`);
}
for (const entries of Object.values(startingHelp)) {
  for (const [ptName, pt, enName, en] of entries) assert.ok(ptName && pt && enName && en);
}
