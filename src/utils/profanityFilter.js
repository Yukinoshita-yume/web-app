import wash from 'washyourmouthoutwithsoap';

/**
 * Filter profanity from input text.
 * Keeps the first letter of each bad word and replaces the rest with '*'.
 * @param {string} text - The text to filter
 * @param {string} locale - Language code (default: 'en')
 * @returns {string} - Cleaned text with profanity masked
 */
export function filterProfanity(text, locale = 'en') {
  if (!text || typeof text !== 'string') return text;
  if (!wash.words(locale)) return text;

  const badWords = wash.words(locale);
  let filtered = text;

  for (const word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, (match) => {
      // 保留首字母，其余用*
      const first = match.charAt(0);
      const masked = first + '*'.repeat(match.length - 1);
      return masked;
    });
  }

  return filtered;
}

/**
 * Check if text contains profanity
 * @param {string} text - The text to check
 * @param {string} locale - Language code (default: 'en')
 * @returns {boolean} - True if profanity is detected
 */
export function containsProfanity(text, locale = 'en') {
  if (!text || typeof text !== 'string') return false;
  return wash.check(locale, text);
}
