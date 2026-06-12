"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { BackHomeButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { events, eventOrder, t } from "@/lib/constants";
import { formatDate, monthRange } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { EventType, RankingRecord } from "@/lib/types";

export default function AdminRankingsPage() {
  const { language } = useAuth();
  const [records, setRecords] = useState<RankingRecord[]>([]);

  useEffect(() => {
    const { start, end } = monthRange();
    void supabase
      .from("approved_rankings")
      .select("*")
      .gte("measured_at", start)
      .lt("measured_at", end)
      .order("event_type")
      .order("value", { ascending: false })
      .then(({ data }) => setRecords((data as RankingRecord[]) ?? []));
  }, []);

  return (
    <AppShell requireAdmin>
      <BackHomeButton href="/admin" label={t.backToAdminHome[language]} />
      <PageHeader title={t.rankings[language]} subtitle="approved only" />
      <section className="grid gap-4">
        {eventOrder.map((eventType) => (
          <AdminRankingGroup
            eventType={eventType}
            key={eventType}
            language={language}
            records={records
              .filter((record) => record.event_type === eventType)
              .slice(0, 10)}
          />
        ))}
      </section>
    </AppShell>
  );
}

function AdminRankingGroup({
  eventType,
  language,
  records
}: {
  eventType: EventType;
  language: "ja" | "en";
  records: RankingRecord[];
}) {
  return (
    <Card>
      <h2 className="text-lg font-black">{events[eventType][language]}</h2>
      <div className="mt-4 grid gap-2">
        {records.length ? (
          records.map((record, index) => (
            <div
              className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-lg bg-slate-50 p-3"
              key={record.id}
            >
              <span className="font-black">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-black">{record.instagram_name}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(record.measured_at)}
                </p>
              </div>
              <p className="font-black">
                {record.value}{" "}
                <span className="text-xs text-slate-500">
                  {language === "ja"
                    ? events[eventType].unitJa
                    : events[eventType].unitEn}
                </span>
              </p>
            </div>
          ))
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </div>
    </Card>
  );
}
