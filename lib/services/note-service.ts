// ============================================
// Notes service
// ============================================
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./current-user";

export async function getAllNotes() {
  const user = await getCurrentUser();
  const rows = await prisma.note.findMany({
    where: { userId: user.id },
    select: { problemSlug: true, content: true },
  });
  const map: Record<string, string> = {};
  rows.forEach((r: { problemSlug: string; content: string }) => {
    map[r.problemSlug] = r.content;
  });
  return map;
}

export async function saveNote(problemSlug: string, content: string) {
  const user = await getCurrentUser();

  if (!content || !content.trim()) {
    await prisma.note.deleteMany({ where: { userId: user.id, problemSlug } });
    return null;
  }

  return prisma.note.upsert({
    where: { userId_problemSlug: { userId: user.id, problemSlug } },
    create: { userId: user.id, problemSlug, content },
    update: { content },
  });
}
