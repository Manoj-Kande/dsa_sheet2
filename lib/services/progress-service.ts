// ============================================
// Progress service — status updates + streak maintenance
// ============================================
import { prisma } from "@/lib/prisma";
import { ProblemStatus } from "@prisma/client";
import { getCurrentUser } from "./current-user";

function toDateOnly(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function getAllProgress() {
  const user = await getCurrentUser();
  const rows = await prisma.userProgress.findMany({
    where: { userId: user.id },
    select: { problemSlug: true, status: true, solvedAt: true },
  });
  // Return as a map for fast client-side lookup, mirroring the old
  // localStorage shape so the frontend logic barely has to change.
  const map: Record<string, ProblemStatus> = {};
  rows.forEach((r: { problemSlug: string; status: ProblemStatus; solvedAt: Date | null }) => {
    map[r.problemSlug] = r.status;
  });
  return map;
}

export async function setProgressStatus(problemSlug: string, status: ProblemStatus | null) {
  const user = await getCurrentUser();

  if (status === null) {
    await prisma.userProgress.deleteMany({
      where: { userId: user.id, problemSlug },
    });
    return null;
  }

  const result = await prisma.userProgress.upsert({
    where: { userId_problemSlug: { userId: user.id, problemSlug } },
    create: {
      userId: user.id,
      problemSlug,
      status,
      solvedAt: status === "SOLVED" ? new Date() : null,
      attemptCount: 1,
    },
    update: {
      status,
      solvedAt: status === "SOLVED" ? new Date() : null,
      attemptCount: { increment: 1 },
    },
  });

  if (status === "SOLVED") {
    await touchStreak(user.id);
  }

  return result;
}

async function touchStreak(userId: string) {
  const today = toDateOnly(new Date());
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const existing = await prisma.userStreak.findUnique({ where: { userId } });

  if (!existing) {
    await prisma.userStreak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalSolved: 1 },
    });
    return;
  }

  const last = existing.lastActiveDate ? toDateOnly(existing.lastActiveDate) : null;
  let nextCurrent = existing.currentStreak;

  if (!last || last.getTime() === today.getTime()) {
    // already counted today — no streak change, just bump totalSolved
  } else if (last.getTime() === yesterday.getTime()) {
    nextCurrent = existing.currentStreak + 1;
  } else {
    nextCurrent = 1;
  }

  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: nextCurrent,
      longestStreak: Math.max(existing.longestStreak, nextCurrent),
      lastActiveDate: today,
      totalSolved: { increment: 1 },
    },
  });
}

export async function getStreak() {
  const user = await getCurrentUser();
  const streak = await prisma.userStreak.findUnique({ where: { userId: user.id } });
  return (
    streak ?? { currentStreak: 0, longestStreak: 0, lastActiveDate: null, totalSolved: 0 }
  );
}
