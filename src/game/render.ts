import type { LetterState, WordleGame } from './wordle.js';

const SQUARES: Record<LetterState, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
};

/** Grille avec les lettres, visible uniquement par le joueur. */
export function renderBoard(game: WordleGame): string {
  const lines = game.guesses.map(
    ({ guess, states }) => `${states.map((s) => SQUARES[s]).join('')}  \`${guess.split('').join(' ')}\``,
  );
  for (let i = game.guesses.length; i < game.maxAttempts; i++) {
    lines.push('⬜'.repeat(game.length));
  }

  const absent = game.absentLetters();
  if (absent.length > 0) lines.push('', `Lettres absentes : ${absent.join(' ')}`);

  return lines.join('\n');
}

/** Grille sans les lettres, pour partager le résultat sans spoiler. */
export function renderShareable(game: WordleGame): string {
  const score = game.status === 'won' ? game.guesses.length : 'X';
  const grid = game.guesses.map(({ states }) => states.map((s) => SQUARES[s]).join('')).join('\n');
  return `Wordle FR (${game.length} lettres) ${score}/${game.maxAttempts}\n${grid}`;
}
