import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SharedNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-6 text-center">
      <Sparkles className="mb-4 h-12 w-12 text-[var(--primary)]" />
      <h1 className="text-2xl font-bold">Note not found</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
        This shared note may have been made private or the link is invalid.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Go to Peblo Notes
      </Link>
    </div>
  );
}
