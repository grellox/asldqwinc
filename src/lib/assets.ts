/**
 * Resolves a file from `public/` against the deploy base path, so links keep
 * working under GitHub Pages (`/syloop/`) and on a local dev server alike.
 */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
