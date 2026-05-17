"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NoteEditor } from "./NoteEditor";
import { NoteSidebar } from "./NoteSidebar";
import type { NoteListItem } from "@/lib/types";

interface NoteDetail extends NoteListItem {
  content: string;
  aiSummary: string | null;
  aiActionItems: string[];
  suggestedTitle: string | null;
}

export function WorkspaceClient() {
  const searchParams = useSearchParams();
  const noteFromUrl = searchParams.get("note");

  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(noteFromUrl);
  const [selectedNote, setSelectedNote] = useState<NoteDetail | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noteFromUrl) setSelectedId(noteFromUrl);
  }, [noteFromUrl]);

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (tagFilter) params.set("tag", tagFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    params.set("archived", String(showArchived));

    const res = await fetch(`/api/notes?${params}`);
    const data = await res.json();
    if (res.ok) setNotes(data.notes);
    setLoading(false);
  }, [search, tagFilter, categoryFilter, showArchived]);

  const fetchNote = useCallback(async (id: string) => {
    const res = await fetch(`/api/notes/${id}`);
    const data = await res.json();
    if (res.ok) setSelectedNote(data.note);
  }, []);

  const handleCreate = useCallback(async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "", tags: [] }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchNotes();
      setSelectedId(data.note.note_id);
    }
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (selectedId) fetchNote(selectedId);
    else setSelectedNote(null);
  }, [selectedId, fetchNote]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreate();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCreate]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  async function handleUpdate(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await fetchNotes();
    if (selectedId === id) await fetchNote(id);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setSelectedId(null);
    setSelectedNote(null);
    await fetchNotes();
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--muted)]">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <NoteSidebar
        notes={notes}
        selectedId={selectedId}
        search={search}
        tagFilter={tagFilter}
        categoryFilter={categoryFilter}
        showArchived={showArchived}
        onSearchChange={setSearch}
        onTagFilterChange={setTagFilter}
        onCategoryFilterChange={setCategoryFilter}
        onShowArchivedChange={setShowArchived}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        allTags={allTags}
      />
      <NoteEditor
        note={selectedNote}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onRefresh={() => {
          fetchNotes();
          if (selectedId) fetchNote(selectedId);
        }}
      />
    </div>
  );
}
