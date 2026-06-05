/** Returns the base URL for the app, with a hardcoded fallback so SMS links
 *  never render as "undefined/..." even if env vars are missing.
 *  Checks NEXT_PUBLIC_APP_URL first (set in Netlify), then NEXT_PUBLIC_BASE_URL,
 *  then falls back to the production domain. */
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.tagyourproject.com'
  )
}
