"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Card, EmptyState, LinkButton, PageHeader, StatusPill } from "@/components/ui";
import { events, statusLabels, t } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { Announcement, BodyMeasurement, FitnessRecord } from "@/lib/types";

export default function DashboardPage() {
  const { user, profile, language } = useAuth();
  const [latestRecord, setLatestRecord] = useState<FitnessRecord | null>(null);
  const [latestBody, setLatestBody] = useState<BodyMeasurement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!user) return;

    void Promise.all([
      supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .in("language", [language, "both"])
        .order("published_at", { ascending: false })
        .limit(3)
    ]).then(([recordResult, bodyResult, announcementsResult]) => {
      setLatestRecord((recordResult.data as FitnessRecord | null) ?? null);
      setLatestBody((bodyResult.data as BodyMeasurement | null) ?? null);
      setAnnouncements((announcementsResult.data as Announcement[]) ?? []);
    });
  }, [language, user]);

  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  return (
    <AppShell>
      <PageHeader title={t.appName[language]} subtitle={t.appSubtitle[language]} />

      {profile?.role === "admin" ? (
        <LinkButton className="sm:w-fit" href="/admin">
          {t.goToAdmin[language]}
        </LinkButton>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <LinkButton href="/records/new">{t.newRecord[language]}</LinkButton>
        <LinkButton href="/charts" variant="secondary">
          {t.viewCharts[language]}
        </LinkButton>
        <LinkButton href="/rankings" variant="secondary">
          {t.viewRankings[language]}
        </LinkButton>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">{t.latestFitness[language]}</h2>
          {latestRecord ? (
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    {events[latestRecord.event_type][language]}
                  </p>
                  <p className="text-3xl font-black">
                    {latestRecord.value}{" "}
                    <span className="text-base">
                      {language === "ja"
                        ? events[latestRecord.event_type].unitJa
                        : events[latestRecord.event_type].unitEn}
                    </span>
                  </p>
                </div>
                <StatusPill
                  tone={
                    latestRecord.status === "approved"
                      ? "good"
                      : latestRecord.status === "pending"
                        ? "warn"
                        : latestRecord.status === "rejected"
                          ? "bad"
                          : "neutral"
                  }
                >
                  {statusLabels[latestRecord.status][language]}
                </StatusPill>
              </div>
              <p className="text-sm text-slate-500">
                {formatDate(latestRecord.measured_at)}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState text={t.empty[language]} />
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-black">{t.latestBody[language]}</h2>
          {latestBody ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label={t.height[language]} value={latestBody.height_cm} />
              <Metric label={t.weight[language]} value={latestBody.weight_kg} />
              <Metric
                label={t.bodyFat[language]}
                value={latestBody.body_fat_percentage}
              />
              <p className="col-span-3 text-sm text-slate-500">
                {formatDate(latestBody.measured_at)}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState text={t.empty[language]} />
            </div>
          )}
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">{t.announcements[language]}</h2>
          <a
            className="text-sm font-bold text-sport-dark"
            href={instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            {t.followInstagram[language]}
          </a>
        </div>
        <div className="mt-4 grid gap-3">
          {announcements.length ? (
            announcements.map((announcement) => (
              <article
                className="rounded-lg bg-slate-50 p-4"
                key={announcement.id}
              >
                <h3 className="font-black">{announcement.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {announcement.body}
                </p>
              </article>
            ))
          ) : (
            <EmptyState text={t.empty[language]} />
          )}
        </div>
      </Card>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value ?? "-"}</p>
    </div>
  );
}
