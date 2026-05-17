import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toNoteDetail, toNoteListItem } from "@/lib/notes";
import { stringifyTags } from "@/lib/utils";
import { nanoid } from "nanoid";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
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

  return NextResponse.json({ note: toNoteDetail(note) });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = String(body.title).trim() || "Untitled";
  if (body.content !== undefined) data.content = String(body.content);
  if (body.noteType !== undefined) data.noteType = body.noteType === "code" ? "code" : "normal";
  if (body.codeLanguage !== undefined) data.codeLanguage = normalizeCodeLanguage(body.codeLanguage);
  if (body.category !== undefined) data.category = String(body.category).trim() || "general";
  if (body.archived !== undefined) data.archived = Boolean(body.archived);
  if (body.tags !== undefined) data.tags = stringifyTags(body.tags);

  if (body.isPublic !== undefined) {
    const isPublic = Boolean(body.isPublic);
    data.isPublic = isPublic;
    if (isPublic && !existing.shareId) {
      data.shareId = nanoid(12);
    }
    if (!isPublic) {
      data.isPublic = false;
    }
  }

  const note = await prisma.note.update({
    where: { id },
    data,
  });

  return NextResponse.json({ note: toNoteListItem(note) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

function normalizeCodeLanguage(value: unknown): string {
  return ["python", "cpp", "java", "html"].includes(String(value)) ? String(value) : "python";
}
