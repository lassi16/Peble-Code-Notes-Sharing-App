import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toNoteListItem } from "@/lib/notes";
import { stringifyTags } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const tag = searchParams.get("tag")?.toLowerCase();
  const category = searchParams.get("category");
  const archived = searchParams.get("archived") === "true";
  const sort = searchParams.get("sort") ?? "updated";

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      archived,
      ...(category ? { category } : {}),
    },
    orderBy: { updatedAt: sort === "created" ? "asc" : "desc" },
  });

  let filtered = notes.map(toNoteListItem);

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        notes
          .find((raw) => raw.id === n.note_id)
          ?.content.toLowerCase()
          .includes(q)
    );
  }

  if (tag) {
    filtered = filtered.filter((n) => n.tags.includes(tag));
  }

  return NextResponse.json({ notes: filtered });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tags = body.tags ? stringifyTags(body.tags) : "[]";

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      title: body.title?.trim() || "Untitled",
      content: body.content ?? "",
      tags,
      category: body.category?.trim() || "general",
    },
  });

  return NextResponse.json({ note: toNoteListItem(note) }, { status: 201 });
}
