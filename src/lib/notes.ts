import type { Note } from "@/generated/prisma/client";
import type { NoteListItem } from "./types";
import { parseTags } from "./utils";

export function toNoteListItem(note: Note): NoteListItem {
  return {
    note_id: note.id,
    title: note.title,
    noteType: note.noteType === "code" ? "code" : "normal",
    codeLanguage: note.codeLanguage || "python",
    tags: parseTags(note.tags),
    category: note.category,
    archived: note.archived,
    isPublic: note.isPublic,
    shareId: note.shareId,
    updated_at: note.updatedAt.toISOString(),
  };
}

export function toNoteDetail(note: Note) {
  return {
    ...toNoteListItem(note),
    content: note.content,
    aiSummary: note.aiSummary,
    aiActionItems: note.aiActionItems
      ? JSON.parse(note.aiActionItems)
      : [],
    suggestedTitle: note.suggestedTitle,
    created_at: note.createdAt.toISOString(),
  };
}
