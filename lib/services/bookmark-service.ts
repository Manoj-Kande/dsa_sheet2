// ============================================
// Bookmarks service
// ============================================
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./current-user";

export async function getAllBookmarks() {
  const user = await getCurrentUser();
  const rows = await prisma.bookmark.findMany({
    where: { userId: user.id },
    select: { problemSlug: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r: { problemSlug: string }) => r.problemSlug);
}

export async function toggleBookmark(problemSlug: string) {
  const user = await getCurrentUser();
  const existing = await prisma.bookmark.findUnique({
    where: { userId_problemSlug: { userId: user.id, problemSlug } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.bookmark.create({ data: { userId: user.id, problemSlug } });
  return true;
}
