import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateNoteInsights } from "@/lib/ai";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (!note.content.trim()) {
    return NextResponse.json(
      { error: "Add some content before generating AI insights" },
      { status: 400 }
    );
  }

  try {
    const ai = await generateNoteInsights(note.content, note.title);

    const updated = await prisma.note.update({
      where: { id },
      data: {
        aiSummary: ai.summary,
        aiActionItems: JSON.stringify(ai.action_items),
        suggestedTitle: ai.suggested_title,
      },
    });

    await prisma.aiUsage.create({
      data: { userId: user.id, noteId: id, type: "summary" },
    });

    return NextResponse.json({
      summary: ai.summary,
      action_items: ai.action_items,
      suggested_title: ai.suggested_title,
      note_id: updated.id,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
