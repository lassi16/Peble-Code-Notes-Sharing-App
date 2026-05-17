import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseActionItems, parseTags } from "@/lib/utils";
import { format } from "date-fns";

type Params = { params: Promise<{ shareId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: { user: { select: { name: true } } },
  });

  if (!note) {
    return NextResponse.json(
      { error: "Shared note not found or is private" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    title: note.title,
    content: note.content,
    tags: parseTags(note.tags),
    category: note.category,
    author: note.user.name,
    updated_at: note.updatedAt.toISOString(),
    updated_at_formatted: format(note.updatedAt, "MMMM d, yyyy"),
    summary: note.aiSummary,
    action_items: parseActionItems(note.aiActionItems),
  });
}
