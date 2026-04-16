export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ensureNonEmptySlug(slug: string, fallback: string) {
  const s = slugify(slug || fallback);
  return s.length ? s : "event";
}

