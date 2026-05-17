import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ArrowRight, NotebookPen, Brain, Share2, BarChart3 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/workspace");

  const features = [
    {
      icon: NotebookPen,
      title: "Smart Notes",
      desc: "Create, edit, and auto-save notes with tags and categories.",
    },
    {
      icon: Brain,
      title: "AI Insights",
      desc: "Generate summaries, action items, and suggested titles instantly.",
    },
    {
      icon: Share2,
      title: "Public Sharing",
      desc: "Share notes via a clean public link — no login required.",
    },
    {
      icon: BarChart3,
      title: "Productivity Dashboard",
      desc: "Track activity, tags, and AI usage at a glance.",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-bold text-[var(--primary)]">
          <Sparkles className="h-7 w-7" />
          Peblo Notes
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <section className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            PEBLO Full Stack Challenge
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Your collaborative{" "}
            <span className="text-[var(--primary)]">AI notes</span> workspace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            Organize ideas with tags, generate AI summaries and action items, share notes
            publicly, and track your productivity — all in one focused app.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base !px-6 !py-3">
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base !px-6 !py-3">
              Sign in
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <Icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
