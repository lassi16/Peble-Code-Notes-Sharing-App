"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Share2,
  Sparkles,
  X,
} from "lucide-react";

interface NoteDetail {
  note_id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  archived: boolean;
  isPublic: boolean;
  shareId: string | null;
  aiSummary: string | null;
  aiActionItems: string[];
  suggestedTitle: string | null;
  updated_at: string;
}

interface NoteEditorProps {
  note: NoteDetail | null;
  onUpdate: (id: string, data: Partial<NoteDetail>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function NoteEditor({ note, onUpdate, onDelete, onRefresh }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    action_items: string[];
    suggested_title: string;
  } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(", "));
    setCategory(note.category);
    setAiResult(
      note.aiSummary
        ? {
            summary: note.aiSummary,
            action_items: note.aiActionItems,
            suggested_title: note.suggestedTitle ?? note.title,
          }
        : null
    );
  }, [note]);

  const save = useCallback(
    async (patch: { title?: string; content?: string; tags?: string[]; category?: string }) => {
      if (!note) return;
      setSaving(true);
      setSaved(false);
      try {
        await onUpdate(note.note_id, patch);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    },
    [note, onUpdate]
  );

  const scheduleSave = useCallback(
    (patch: { title?: string; content?: string; tags?: string[]; category?: string }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(patch), 800);
    },
    [save]
  );

  async function handleGenerateAi() {
    if (!note) return;
    setAiLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.note_id}/generate-summary`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        onRefresh();
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function toggleShare() {
    if (!note) return;
    const next = !note.isPublic;
    await onUpdate(note.note_id, { isPublic: next } as Partial<NoteDetail>);
    onRefresh();
  }

  async function toggleArchive() {
    if (!note) return;
    await onUpdate(note.note_id, { archived: !note.archived } as Partial<NoteDetail>);
    onRefresh();
  }

  function copyShareLink() {
    if (!note?.shareId) return;
    const url = `${window.location.origin}/shared/${note.shareId}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  if (!note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-[var(--primary)]/40" />
        <h3 className="text-lg font-semibold">Select or create a note</h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
          Your notes auto-save as you type. Use AI to generate summaries and action items.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-4">
        <input
          className="min-w-0 flex-1 bg-transparent text-xl font-bold outline-none"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave({ title: e.target.value, content, tags: parseTags(tagsInput), category });
          }}
          placeholder="Note title"
        />
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving
            </span>
          )}
          {saved && !saving && (
            <span className="flex items-center gap-1 text-xs text-[var(--accent-teal)]">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          <button type="button" onClick={toggleArchive} className="btn-secondary !py-2">
            <Archive className="h-4 w-4" />
          </button>
          <button type="button" onClick={toggleShare} className="btn-secondary !py-2">
            <Share2 className="h-4 w-4" />
            {note.isPublic ? "Public" : "Share"}
          </button>
          {note.isPublic && note.shareId && (
            <button type="button" onClick={copyShareLink} className="btn-secondary !py-2">
              {shareCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerateAi}
            disabled={aiLoading}
            className="btn-primary !py-2"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Insights
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col overflow-hidden p-4">
          <div className="mb-3 flex gap-3">
            <input
              className="input-field flex-1"
              placeholder="Tags (comma separated)"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                scheduleSave({
                  title,
                  content,
                  tags: parseTags(e.target.value),
                  category,
                });
              }}
            />
            <select
              className="input-field w-36"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                scheduleSave({ title, content, tags: parseTags(tagsInput), category: e.target.value });
              }}
            >
              {["general", "work", "personal", "ideas", "meetings"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                !preview ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--bg)]"
              }`}
            >
              <Pencil className="h-3 w-3" /> Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                preview ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--bg)]"
              }`}
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>

          {preview ? (
            <div
              className="prose prose-sm min-h-[300px] flex-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              className="min-h-[300px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-purple-200"
              placeholder="Start writing your note... (Markdown supported)"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                scheduleSave({
                  title,
                  content: e.target.value,
                  tags: parseTags(tagsInput),
                  category,
                });
              }}
            />
          )}

          {note.isPublic && note.shareId && (
            <a
              href={`/shared/${note.shareId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View public page
            </a>
          )}
        </div>

        <aside className="overflow-y-auto border-t border-[var(--border)] bg-[var(--bg)] p-4 lg:border-l lg:border-t-0">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            AI Insights
          </h3>

          {!aiResult ? (
            <p className="text-sm text-[var(--muted)]">
              Click &quot;AI Insights&quot; to generate a summary, action items, and a suggested title.
            </p>
          ) : (
            <div className="space-y-4">
              {aiResult.suggested_title && aiResult.suggested_title !== title && (
                <div className="card p-3">
                  <p className="text-xs font-medium text-[var(--muted)]">Suggested title</p>
                  <p className="mt-1 text-sm font-medium">{aiResult.suggested_title}</p>
                  <button
                    type="button"
                    className="mt-2 text-xs text-[var(--primary)] hover:underline"
                    onClick={() => {
                      setTitle(aiResult.suggested_title);
                      save({ title: aiResult.suggested_title, content, tags: parseTags(tagsInput), category });
                    }}
                  >
                    Apply title
                  </button>
                </div>
              )}

              <div className="card p-3">
                <p className="text-xs font-medium text-[var(--muted)]">Summary</p>
                <p className="mt-1 text-sm leading-relaxed">{aiResult.summary}</p>
              </div>

              {aiResult.action_items.length > 0 && (
                <div className="card p-3">
                  <p className="text-xs font-medium text-[var(--muted)]">Action items</p>
                  <ul className="mt-2 space-y-1.5">
                    {aiResult.action_items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-[var(--primary)]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onDelete(note.note_id)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            <X className="h-4 w-4" />
            Delete note
          </button>
        </aside>
      </div>
    </div>
  );
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n/g, "<br />");
}
