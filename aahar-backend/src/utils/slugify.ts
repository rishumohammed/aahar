export const slugify = (text: string): string =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const uniqueSlug = async (
  prisma: any, model: "restaurant" | "hotel", base: string
): Promise<string> => {
  let slug = slugify(base);
  let count = 0;
  while (true) {
    const candidate = count === 0 ? slug : `${slug}-${count}`;
    const exists = await (prisma as any)[model].findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    count++;
  }
};
