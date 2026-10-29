// Génère data/valides-N.txt (mots acceptés comme essais) à partir du paquet
// an-array-of-french-words, et vérifie que chaque solution y figure.
// Usage : npm run words
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const words = require('an-array-of-french-words');
const dataDir = new URL('../data/', import.meta.url);

const LENGTHS = [5, 6, 7];

// Même normalisation que src/game/normalize.ts
const normalize = (word) =>
  word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .toUpperCase();

for (const length of LENGTHS) {
  const valid = new Set();
  for (const word of words) {
    // On ignore les noms propres et sigles
    if (word !== word.toLowerCase()) continue;
    const normalized = normalize(word);
    if (normalized.length === length && /^[A-Z]+$/.test(normalized)) valid.add(normalized);
  }

  const solutionsFile = new URL(`solutions-${length}.txt`, dataDir);
  const solutions = readFileSync(solutionsFile, 'utf8')
    .split('\n')
    .map((line) => normalize(line.trim()))
    .filter(Boolean);
  for (const solution of solutions) {
    if (solution.length !== length) throw new Error(`${solution} n'a pas ${length} lettres`);
    valid.add(solution);
  }

  writeFileSync(new URL(`valides-${length}.txt`, dataDir), [...valid].sort().join('\n') + '\n');
  console.log(`${length} lettres : ${valid.size} mots valides, ${solutions.length} solutions`);
}

for (const file of readdirSync(dataDir)) {
  const match = /^solutions-(\d+)\.txt$/.exec(file);
  if (match && !LENGTHS.includes(Number(match[1]))) {
    console.warn(`Attention : ${file} ignoré, ajoute ${match[1]} à LENGTHS`);
  }
}
