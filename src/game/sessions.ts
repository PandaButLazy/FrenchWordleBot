import type { WordleGame } from './wordle.js';

/**
 * Parties en cours, une par joueur. Stockées en mémoire : elles sont perdues
 * au redémarrage du bot (à remplacer par SQLite pour les stats/séries).
 */
const games = new Map<string, WordleGame>();

export const sessions = {
  get: (userId: string) => games.get(userId),
  set: (userId: string, game: WordleGame) => games.set(userId, game),
  delete: (userId: string) => games.delete(userId),
};
