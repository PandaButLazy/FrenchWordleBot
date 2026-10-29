import { readFileSync } from 'node:fs';

import { normalize } from './normalize.js';

const DATA_DIR = new URL('../../data/', import.meta.url);

export const SUPPORTED_LENGTHS = [5, 6, 7] as const;
export type WordLength = (typeof SUPPORTED_LENGTHS)[number];

interface WordList {
  solutions: string[];
  valid: Set<string>;
}

function readList(file: string): string[] {
  return readFileSync(new URL(file, DATA_DIR), 'utf8')
    .split('\n')
    .map(normalize)
    .filter(Boolean);
}

const lists = new Map<WordLength, WordList>(
  SUPPORTED_LENGTHS.map((length) => {
    const solutions = readList(`solutions-${length}.txt`);
    const valid = new Set([...readList(`valides-${length}.txt`), ...solutions]);
    return [length, { solutions, valid }];
  }),
);

export function randomSolution(length: WordLength): string {
  const { solutions } = lists.get(length)!;
  return solutions[Math.floor(Math.random() * solutions.length)];
}

export function isValidWord(word: string): boolean {
  return lists.get(word.length as WordLength)?.valid.has(word) ?? false;
}
