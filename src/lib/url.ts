/** Returns the base URL for the app, with a hardcoded fallback so SMS links
 *  never render as "undefined/..." even if NEXT_PUBLIC_BASE_URL is missing. */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tagyourproject.com'
}
