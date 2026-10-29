/**
 * Met un mot sous forme comparable : majuscules, sans accents ni ligatures.
 * « Élève » → « ELEVE », « cœur » → « COEUR ».
 */
export function normalize(word: string): string {
  return word
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toUpperCase();
}
