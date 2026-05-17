import { format } from "date-fns";
import { Sparkles, Tag, User } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renderCodeBlock, renderMarkdown } from "@/lib/markdown";
import { parseActionItems, parseTags } from "@/lib/utils";

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: { user: { select: { name: true } } },
  });

  if (!note) notFound();

  const tags = parseTags(note.tags);
  const actionItems = parseActionItems(note.aiActionItems);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-5">
          <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          <span className="font-bold text-[var(--primary)]">Peblo Notes</span>
          <span className="ml-2 rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">
            Shared note
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">{note.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {note.user.name}
          </span>
          <span>Updated {format(note.updatedAt, "MMMM d, yyyy")}</span>
          <span className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs capitalize">
            {note.category}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {note.content ? (
          <div
            className="prose prose-sm card mt-8 p-6 leading-relaxed dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html:
                note.noteType === "code"
                  ? renderCodeBlock(note.content, note.codeLanguage)
                  : renderMarkdown(note.content),
            }}
          />
        ) : (
          <div className="card mt-8 p-6 text-sm text-[var(--muted)]">No content</div>
        )}

        {note.aiSummary && (
          <section className="card mt-6 p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              AI Summary
            </h2>
            <p className="text-sm leading-relaxed">{note.aiSummary}</p>
            {actionItems.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-sm font-medium text-[var(--muted)]">
                  Action items
                </h3>
                <ul className="space-y-1.5">
                  {actionItems.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-[var(--primary)]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </article>
    </div>
  );
}
