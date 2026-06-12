"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { t } from "@/lib/constants";
import { monthRange } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";

export default function AdminPage() {
  const { language } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    members: 0,
    thisMonthRecords: 0
  });

  useEffect(() => {
    const { start, end } = monthRange();
    void Promise.all([
      supabase
        .from("fitness_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("fitness_records")
        .select("*", { count: "exact", head: true })
        .gte("measured_at", start)
        .lt("measured_at", end)
    ]).then(([pending, members, monthRecords]) => {
      setStats({
        pending: pending.count ?? 0,
        members: members.count ?? 0,
        thisMonthRecords: monthRecords.count ?? 0
      });
    });
  }, []);

  return (
    <AppShell requireAdmin>
      <PageHeader title={t.admin[language]} subtitle="U&T Fitness" />
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.pendingApprovals[language]} value={stats.pending} />
        <Stat label={t.members[language]} value={stats.members} />
        <Stat label={t.thisMonthRecords[language]} value={stats.thisMonthRecords} />
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <LinkButton href="/admin/announcements" variant="secondary">
          {t.announcements[language]}
        </LinkButton>
        <LinkButton href="/admin/approvals">{t.pendingApprovals[language]}</LinkButton>
        <LinkButton href="/admin/rankings" variant="secondary">
          {t.rankings[language]}
        </LinkButton>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black text-ink">{value}</p>
    </Card>
  );
}
