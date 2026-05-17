import { NextResponse } from "next/server";
import { format, subDays, startOfDay } from "date-fns";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toNoteListItem } from "@/lib/notes";
import { parseTags } from "@/lib/utils";
import type { InsightsData } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notes, archivedCount, aiUsages, recentAi] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id, archived: false },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.note.count({
      where: { userId: user.id, archived: true },
    }),
    prisma.aiUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiUsage.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tagCounts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of parseTags(note.tags)) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const mostUsedTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const weekStart = startOfDay(subDays(new Date(), 6));
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const next = startOfDay(subDays(new Date(), 5 - i));
    const count = notes.filter(
      (n) => n.updatedAt >= day && n.updatedAt < next
    ).length;
    return { day: format(day, "EEE"), count };
  });

  const thisWeekAi = aiUsages.filter((u) => u.createdAt >= weekStart).length;

  const insights: InsightsData = {
    totalNotes: notes.length,
    archivedNotes: archivedCount,
    recentlyEdited: notes.slice(0, 5).map(toNoteListItem),
    mostUsedTags,
    aiUsageStats: {
      totalGenerations: aiUsages.length,
      thisWeek: thisWeekAi,
      lastGeneration: recentAi?.createdAt.toISOString() ?? null,
    },
    weeklyActivity,
  };

  return NextResponse.json(insights);
}
