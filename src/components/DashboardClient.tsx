"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  FileText,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import type { InsightsData } from "@/lib/types";

export function DashboardClient() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => {
        setInsights(data);
        setLoading(false);
      });
  }, []);

  if (loading || !insights) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-[var(--muted)]">Loading insights...</p>
      </div>
    );
  }

  const maxActivity = Math.max(...insights.weeklyActivity.map((d) => d.count), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Productivity Insights</h1>
        <p className="text-sm text-[var(--muted)]">
          Overview of your notes activity and AI usage
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total notes"
          value={insights.totalNotes}
          sub={`${insights.archivedNotes} archived`}
        />
        <StatCard
          icon={Sparkles}
          label="AI generations"
          value={insights.aiUsageStats.totalGenerations}
          sub={`${insights.aiUsageStats.thisWeek} this week`}
        />
        <StatCard
          icon={Tag}
          label="Unique tags"
          value={insights.mostUsedTags.length}
          sub="Across active notes"
        />
        <StatCard
          icon={TrendingUp}
          label="Last AI use"
          value={
            insights.aiUsageStats.lastGeneration
              ? formatDistanceToNow(new Date(insights.aiUsageStats.lastGeneration), {
                  addSuffix: true,
                })
              : "Never"
          }
          sub="Most recent generation"
          small
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
            Weekly activity
          </h2>
          <div className="flex h-40 items-end justify-between gap-2">
            {insights.weeklyActivity.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[var(--primary)] transition-all"
                  style={{
                    height: `${Math.max((day.count / maxActivity) * 100, 4)}%`,
                    minHeight: day.count > 0 ? "8px" : "4px",
                  }}
                />
                <span className="text-xs text-[var(--muted)]">{day.day}</span>
                <span className="text-xs font-medium">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Tag className="h-5 w-5 text-[var(--primary)]" />
            Most used tags
          </h2>
          {insights.mostUsedTags.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No tags yet. Add tags to your notes.</p>
          ) : (
            <ul className="space-y-3">
              {insights.mostUsedTags.map(({ tag, count }) => (
                <li key={tag} className="flex items-center justify-between">
                  <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)]">
                    {tag}
                  </span>
                  <span className="text-sm text-[var(--muted)]">{count} notes</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold">Recently edited notes</h2>
        {insights.recentlyEdited.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No notes yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {insights.recentlyEdited.map((note) => (
              <li key={note.note_id}>
                <Link
                  href={`/workspace?note=${note.note_id}`}
                  className="flex items-center justify-between py-3 transition hover:text-[var(--primary)]"
                >
                  <span className="font-medium">{note.title}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
        <Icon className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className={`mt-1 font-bold ${small ? "text-lg" : "text-3xl"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{sub}</p>
    </div>
  );
}
