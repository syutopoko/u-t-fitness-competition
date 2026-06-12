"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { BackHomeButton, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { events, t } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { EventType } from "@/lib/types";

type PendingRecord = {
  id: string;
  user_id: string;
  instagram_name: string;
  event_type: EventType;
  value: number;
  unit: string;
  measured_at: string;
  comment: string | null;
  created_at: string;
};

export default function ApprovalsPage() {
  const { user, language } = useAuth();
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadRecords() {
    const { data } = await supabase
      .from("pending_records")
      .select("*")
      .order("created_at", { ascending: true });
    setRecords((data as PendingRecord[]) ?? []);
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    if (!user) return;
    setBusyId(id);
    await supabase
      .from("fitness_records")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id);
    await loadRecords();
    setBusyId(null);
  }

  return (
    <AppShell requireAdmin>
      <BackHomeButton href="/admin" label={t.backToAdminHome[language]} />
      <PageHeader title={t.pendingApprovals[language]} />
      <section className="grid gap-3">
        {records.length ? (
          records.map((record) => (
            <Card key={record.id}>
              <div className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      {record.instagram_name}
                    </p>
                    <h2 className="text-xl font-black">
                      {events[record.event_type][language]}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black">{record.value}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {language === "ja"
                        ? events[record.event_type].unitJa
                        : events[record.event_type].unitEn}
                    </p>
                  </div>
                </div>
                <div className="grid gap-1 text-sm text-slate-600">
                  <p>{formatDate(record.measured_at)}</p>
                  <p>{record.comment || "-"}</p>
                  <p>
                    {language === "ja" ? "申請日時" : "Submitted"}:{" "}
                    {formatDate(record.created_at)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    disabled={busyId === record.id}
                    onClick={() => void review(record.id, "approved")}
                    type="button"
                  >
                    {t.approve[language]}
                  </Button>
                  <Button
                    disabled={busyId === record.id}
                    onClick={() => void review(record.id, "rejected")}
                    type="button"
                    variant="danger"
                  >
                    {t.reject[language]}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </section>
    </AppShell>
  );
}
