"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { t } from "@/lib/constants";
import { useAuth } from "./auth-provider";
import { LanguageToggle } from "./language-toggle";

const memberLinks = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/records/new", key: "records" },
  { href: "/charts", key: "charts" },
  { href: "/rankings", key: "rankings" },
  { href: "/profile", key: "profile" }
] as const;

const adminLinks = [
  { href: "/admin", key: "admin" },
  { href: "/admin/approvals", key: "pendingApprovals" },
  { href: "/admin/announcements", key: "announcements" },
  { href: "/admin/members", key: "members" },
  { href: "/admin/rankings", key: "rankings" }
] as const;

export function AppShell({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { loading, user, profile, language, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!loading && requireAdmin && profile && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, profile, requireAdmin, router]);

  if (loading || !user || (requireAdmin && profile?.role !== "admin")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-field px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sport-mint border-t-sport-dark" />
      </main>
    );
  }

  const links = requireAdmin ? adminLinks : memberLinks;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-field to-sport-light pb-24 text-ink">
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href={profile?.role === "admin" ? "/admin" : "/dashboard"}>
            <div className="text-xs font-black uppercase tracking-normal text-sport-dark">
              {t.appName[language]}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              {profile?.instagram_name ? profile.instagram_name : ""}
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              onClick={() => {
                void signOut().then(() => router.replace("/login"));
              }}
              type="button"
            >
              {t.logout[language]}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <nav className="hidden md:block">
          <div className="sticky top-20 grid gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-sport-green text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {t[link.key][language]}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="grid gap-5">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white md:hidden">
        <div className="grid grid-cols-5">
          {links.slice(0, 5).map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                className={`flex min-h-16 items-center justify-center px-1 text-center text-[11px] font-bold ${
                  active ? "text-sport-dark" : "text-slate-500"
                }`}
                href={link.href}
                key={link.href}
              >
                {t[link.key][language]}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
