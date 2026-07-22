// Single source of truth for the path this site is served under —
// imported by next.config.ts and by anything rendering a content-driven
// asset path (plain <img>/<video> src from steps.json), since Next.js only
// auto-prefixes basePath onto next/link, next/image, and next/font — not
// arbitrary string paths coming from data.
export const BASE_PATH = "/hlr";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
