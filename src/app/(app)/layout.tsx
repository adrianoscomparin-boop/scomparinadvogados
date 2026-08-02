import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, papel")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6"
        style={{ background: "linear-gradient(135deg, #6b3010 0%, #8a4518 50%, #6b3010 100%)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9922a] text-sm font-bold text-[#1a0800]">
            SA
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-bold tracking-wide text-[#fff8e8]">SCOMPARIN ADVOGADOS</span>
            <span className="text-[10px] tracking-[0.2em] text-[#ffdc96]/80">GESTÃO FINANCEIRA E PROCESSUAL</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[#fff3d0] sm:inline">{profile?.nome ?? user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-[#ffdc96]/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#fff3d0] hover:bg-white/20"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-white sm:block">
          <NavLinks />
        </aside>
        <main className="flex-1 bg-[var(--background)] p-4 sm:p-6">{children}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-white sm:hidden">
        <NavLinks horizontal />
      </nav>
      <div className="h-14 sm:hidden" />
    </div>
  );
}
