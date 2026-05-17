"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, NotebookPen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/workspace", label: "Notes", icon: NotebookPen },
    { href: "/dashboard", label: "Insights", icon: LayoutDashboard },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/workspace" className="flex items-center gap-2 font-bold text-[var(--primary)]">
          <Sparkles className="h-6 w-6" />
          <span>Peblo Notes</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                pathname.startsWith(href)
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              Hi, {userName.split(" ")[0]}
            </span>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary !px-3 !py-2"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
