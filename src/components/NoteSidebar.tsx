"use client";

import { formatDistanceToNow } from "date-fns";
import { Archive, Plus, Search, Tag } from "lucide-react";
import type { NoteListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES = ["general", "work", "personal", "ideas", "meetings"];

interface NoteSidebarProps {
  notes: NoteListItem[];
  selectedId: string | null;
  search: string;
  tagFilter: string;
  categoryFilter: string;
  showArchived: boolean;
  onSearchChange: (v: string) => void;
  onTagFilterChange: (v: string) => void;
  onCategoryFilterChange: (v: string) => void;
  onShowArchivedChange: (v: boolean) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  allTags: string[];
}

export function NoteSidebar({
  notes,
  selectedId,
  search,
  tagFilter,
  categoryFilter,
  showArchived,
  onSearchChange,
  onTagFilterChange,
  onCategoryFilterChange,
  onShowArchivedChange,
  onSelect,
  onCreate,
  allTags,
}: NoteSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] md:w-80 lg:w-96">
      <div className="space-y-3 border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">My Notes</h2>
          <button type="button" onClick={onCreate} className="btn-primary !px-3 !py-2">
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input-field pl-9"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="input-field"
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onTagFilterChange("")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition",
                !tagFilter
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              All tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagFilterChange(tagFilter === tag ? "" : tag)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition",
                  tagFilter === tag
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onShowArchivedChange(!showArchived)}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
            showArchived
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "text-[var(--muted)] hover:bg-[var(--bg)]"
          )}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Showing archived" : "Show archived"}
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {notes.length === 0 ? (
          <li className="p-4 text-center text-sm text-[var(--muted)]">
            No notes found. Create one to get started.
          </li>
        ) : (
          notes.map((note) => (
            <li key={note.note_id}>
              <button
                type="button"
                onClick={() => onSelect(note.note_id)}
                className={cn(
                  "mb-1 w-full rounded-xl p-3 text-left transition",
                  selectedId === note.note_id
                    ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30"
                    : "hover:bg-[var(--bg)]"
                )}
              >
                <p className="truncate font-medium">{note.title}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[var(--bg)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
