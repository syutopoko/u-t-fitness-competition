"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { BackHomeButton, Card, EmptyState, PageHeader } from "@/components/ui";
import { events, eventOrder, t } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { BodyMeasurement, EventType, FitnessRecord } from "@/lib/types";

export default function ChartsPage() {
  const { user, language } = useAuth();
  const [records, setRecords] = useState<FitnessRecord[]>([]);
  const [bodyRows, setBodyRows] = useState<BodyMeasurement[]>([]);

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: true }),
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: true })
    ]).then(([recordResult, bodyResult]) => {
      setRecords((recordResult.data as FitnessRecord[]) ?? []);
      setBodyRows((bodyResult.data as BodyMeasurement[]) ?? []);
    });
  }, [user]);

  return (
    <AppShell>
      <BackHomeButton href="/dashboard" label={t.backToHome[language]} />
      <PageHeader title={t.charts[language]} subtitle={t.appSubtitle[language]} />
      <section className="grid gap-4">
        {eventOrder.map((eventType) => (
          <FitnessChart
            eventType={eventType}
            key={eventType}
            language={language}
            records={records.filter((record) => record.event_type === eventType)}
          />
        ))}
        <BodyChart bodyRows={bodyRows} language={language} />
      </section>
    </AppShell>
  );
}

function FitnessChart({
  eventType,
  language,
  records
}: {
  eventType: EventType;
  language: "ja" | "en";
  records: FitnessRecord[];
}) {
  const data = useMemo(
    () =>
      records.map((record) => ({
        date: record.measured_at.slice(5),
        value: Number(record.value)
      })),
    [records]
  );

  return (
    <Card>
      <h2 className="text-lg font-black">{events[eventType][language]}</h2>
      <div className="mt-4 h-64">
        {data.length ? (
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ left: -18, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis dataKey="date" fontSize={12} tickMargin={8} />
              <YAxis fontSize={12} tickMargin={8} />
              <Tooltip />
              <Line
                activeDot={{ r: 6 }}
                dataKey="value"
                dot={{ r: 4 }}
                stroke="#15a36d"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </div>
    </Card>
  );
}

function BodyChart({
  bodyRows,
  language
}: {
  bodyRows: BodyMeasurement[];
  language: "ja" | "en";
}) {
  const data = useMemo(
    () =>
      bodyRows.map((row) => ({
        date: row.measured_at.slice(5),
        weight: row.weight_kg == null ? null : Number(row.weight_kg),
        bodyFat:
          row.body_fat_percentage == null
            ? null
            : Number(row.body_fat_percentage)
      })),
    [bodyRows]
  );

  return (
    <Card>
      <h2 className="text-lg font-black">
        {language === "ja" ? "体重・体脂肪率" : "Weight and Body Fat"}
      </h2>
      <div className="mt-4 h-72">
        {data.length ? (
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ left: -18, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis dataKey="date" fontSize={12} tickMargin={8} />
              <YAxis fontSize={12} tickMargin={8} />
              <Tooltip />
              <Line
                connectNulls
                dataKey="weight"
                name={t.weight[language]}
                stroke="#1976d2"
                strokeWidth={3}
                type="monotone"
              />
              <Line
                connectNulls
                dataKey="bodyFat"
                name={t.bodyFat[language]}
                stroke="#ff6b57"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </div>
    </Card>
  );
}
