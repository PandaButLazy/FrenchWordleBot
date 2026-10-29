import { describe, expect, it } from 'vitest';

import { normalize } from '../src/game/normalize.js';
import { renderShareable } from '../src/game/render.js';
import { WordleGame, evaluateGuess } from '../src/game/wordle.js';
import { isValidWord, randomSolution } from '../src/game/words.js';

describe('normalize', () => {
  it('retire les accents et les ligatures', () => {
    expect(normalize(' Élève ')).toBe('ELEVE');
    expect(normalize('cœur')).toBe('COEUR');
    expect(normalize('garçon')).toBe('GARCON');
  });
});

describe('evaluateGuess', () => {
  it('marque les lettres bien placées, mal placées et absentes', () => {
    expect(evaluateGuess('CHIEN', 'NICHE')).toEqual(['present', 'present', 'present', 'present', 'present']);
    expect(evaluateGuess('TABLE', 'TABLE')).toEqual(Array(5).fill('correct'));
    expect(evaluateGuess('ROUGE', 'PLAGE')).toEqual(['absent', 'absent', 'absent', 'correct', 'correct']);
  });

  it('ne compte pas une lettre en double plus de fois qu’elle n’apparaît', () => {
    // Un seul E dans la solution, déjà bien placé : les autres E sont absents
    expect(evaluateGuess('ELEVE', 'TABLE')).toEqual(['absent', 'present', 'absent', 'absent', 'correct']);
    // Deux E dans la solution dont un bien placé : un seul autre E peut être « présent »
    expect(evaluateGuess('EEEXX', 'XEXEX')).toEqual(['present', 'correct', 'absent', 'present', 'correct']);
  });
});

describe('WordleGame', () => {
  it('se termine par une victoire', () => {
    const game = new WordleGame('TABLE');
    game.play('CHIEN');
    game.play('TABLE');
    expect(game.status).toBe('won');
    expect(renderShareable(game)).toContain('2/6');
  });

  it('se termine par une défaite après 6 essais', () => {
    const game = new WordleGame('TABLE');
    for (let i = 0; i < 6; i++) game.play('CHIEN');
    expect(game.status).toBe('lost');
    expect(() => game.play('TABLE')).toThrow();
  });
});

describe('listes de mots', () => {
  it('tire des solutions valides', () => {
    for (const length of [5, 6, 7] as const) {
      const word = randomSolution(length);
      expect(word).toHaveLength(length);
      expect(isValidWord(word)).toBe(true);
    }
    expect(isValidWord('XYZWQ')).toBe(false);
  });
});
