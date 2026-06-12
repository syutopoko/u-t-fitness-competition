"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { BackHomeButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { events, eventOrder, t } from "@/lib/constants";
import { formatDate, monthRange } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { EventType, RankingRecord } from "@/lib/types";

const medals = ["#f5b942", "#b7c2d4", "#d98b4a"];

export default function RankingsPage() {
  const { language } = useAuth();
  const [records, setRecords] = useState<RankingRecord[]>([]);

  useEffect(() => {
    const { start, end } = monthRange();
    void supabase
      .from("approved_rankings")
      .select("*")
      .gte("measured_at", start)
      .lt("measured_at", end)
      .order("value", { ascending: false })
      .then(({ data }) => setRecords((data as RankingRecord[]) ?? []));
  }, []);

  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  return (
    <AppShell>
      <BackHomeButton href="/dashboard" label={t.backToHome[language]} />
      <PageHeader
        title={t.rankings[language]}
        subtitle={t.topThreeOnly[language]}
        action={
          <a
            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-sport-dark ring-1 ring-sky-100"
            href={instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
        }
      />
      <section className="grid gap-4">
        {eventOrder.map((eventType) => (
          <RankingGroup
            eventType={eventType}
            key={eventType}
            language={language}
            records={records
              .filter((record) => record.event_type === eventType)
              .slice(0, 3)}
          />
        ))}
      </section>
    </AppShell>
  );
}

function RankingGroup({
  eventType,
  language,
  records
}: {
  eventType: EventType;
  language: "ja" | "en";
  records: RankingRecord[];
}) {
  const sorted = useMemo(
    () => [...records].sort((a, b) => Number(b.value) - Number(a.value)),
    [records]
  );

  return (
    <Card>
      <h2 className="text-lg font-black">{events[eventType][language]}</h2>
      <div className="mt-4 grid gap-3">
        {sorted.length ? (
          sorted.map((record, index) => (
            <article
              className="flex items-center gap-3 rounded-lg bg-slate-50 p-4"
              key={record.id}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                style={{ backgroundColor: medals[index] }}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black">
                  {record.instagram_name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(record.measured_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{record.value}</p>
                <p className="text-xs font-bold text-slate-500">
                  {language === "ja"
                    ? events[eventType].unitJa
                    : events[eventType].unitEn}
                </p>
              </div>
            </article>
          ))
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </div>
    </Card>
  );
}
