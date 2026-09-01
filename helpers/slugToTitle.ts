export const slugToTitle = (slug: string): string => {
  return slug
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, char => char.toUpperCase());
}