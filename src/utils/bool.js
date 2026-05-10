/**
 * Strict boolean coercion for React Native / Expo Native Bridge
 * Rules:
 * 1. Must return a literal boolean
 * 2. Must handle "true" (string) correctly
 * 3. Must never leak undefined/null/string to native layer
 */
export function toBool(value) {
  return value === true || value === 'true';
}
