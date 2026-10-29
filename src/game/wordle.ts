export type LetterState = 'correct' | 'present' | 'absent';

export interface GuessResult {
  guess: string;
  states: LetterState[];
}

/**
 * Compare un essai à la solution (déjà normalisés, même longueur).
 * Gère les lettres en double : une lettre n'est marquée « présente »
 * que s'il en reste une occurrence non utilisée dans la solution.
 */
export function evaluateGuess(guess: string, solution: string): LetterState[] {
  if (guess.length !== solution.length) {
    throw new Error('L’essai et la solution doivent avoir la même longueur');
  }

  const states: LetterState[] = new Array(guess.length).fill('absent');
  const remaining = new Map<string, number>();

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      states[i] = 'correct';
    } else {
      remaining.set(solution[i], (remaining.get(solution[i]) ?? 0) + 1);
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (states[i] === 'correct') continue;
    const count = remaining.get(guess[i]) ?? 0;
    if (count > 0) {
      states[i] = 'present';
      remaining.set(guess[i], count - 1);
    }
  }

  return states;
}

export const MAX_ATTEMPTS = 6;

export type GameStatus = 'playing' | 'won' | 'lost';

export class WordleGame {
  readonly guesses: GuessResult[] = [];
  status: GameStatus = 'playing';

  constructor(
    readonly solution: string,
    readonly maxAttempts: number = MAX_ATTEMPTS,
  ) {}

  get length(): number {
    return this.solution.length;
  }

  get attemptsLeft(): number {
    return this.maxAttempts - this.guesses.length;
  }

  /** Enregistre un essai déjà normalisé et validé. */
  play(guess: string): GuessResult {
    if (this.status !== 'playing') throw new Error('La partie est terminée');

    const result = { guess, states: evaluateGuess(guess, this.solution) };
    this.guesses.push(result);

    if (guess === this.solution) this.status = 'won';
    else if (this.attemptsLeft === 0) this.status = 'lost';

    return result;
  }

  /** Lettres essayées qui ne sont pas dans la solution. */
  absentLetters(): string[] {
    const inSolution = new Set(this.solution);
    const letters = new Set<string>();
    for (const { guess } of this.guesses) {
      for (const letter of guess) if (!inSolution.has(letter)) letters.add(letter);
    }
    return [...letters].sort();
  }
}
