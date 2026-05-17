import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar userName={user.name} />
      <main>{children}</main>
    </div>
  );
}
