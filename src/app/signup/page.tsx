import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/workspace");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-6">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-[var(--primary)]">
        <Sparkles className="h-6 w-6" />
        Peblo Notes
      </Link>
      <AuthForm mode="signup" />
    </div>
  );
}
