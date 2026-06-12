"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  BackHomeButton,
  Button,
  Card,
  Field,
  inputClass,
  PageHeader
} from "@/components/ui";
import { events, eventOrder, t } from "@/lib/constants";
import { monthRange, todayInputValue } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { EventType, RecordStatus } from "@/lib/types";

export default function NewRecordPage() {
  const router = useRouter();
  const { user, language } = useAuth();
  const [measuredAt, setMeasuredAt] = useState(todayInputValue());
  const [eventType, setEventType] = useState<EventType>("push_ups");
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function decideStatus(recordValue: number): Promise<RecordStatus> {
    const { start, end } = monthRange(new Date(`${measuredAt}T00:00:00`));
    const { data } = await supabase
      .from("fitness_records")
      .select("value")
      .eq("event_type", eventType)
      .eq("status", "approved")
      .gte("measured_at", start)
      .lt("measured_at", end)
      .order("value", { ascending: false })
      .limit(3);

    const values = (data ?? []).map((row) => Number(row.value));
    if (values.length < 3) return "pending";
    return recordValue > Math.min(...values) ? "pending" : "normal";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setMessage(
        language === "ja" ? "正しい記録数値を入力してください。" : "Enter a valid value."
      );
      setLoading(false);
      return;
    }

    const status = await decideStatus(numericValue);
    const { error } = await supabase.from("fitness_records").insert({
      user_id: user.id,
      event_type: eventType,
      value: numericValue,
      unit: events[eventType].unit,
      measured_at: measuredAt,
      comment: comment || null,
      status
    });

    if (error) {
      setMessage(language === "ja" ? "保存に失敗しました。" : "Could not save.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AppShell>
      <BackHomeButton href="/dashboard" label={t.backToHome[language]} />
      <PageHeader title={t.newRecord[language]} subtitle={t.topThreeOnly[language]} />
      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label={t.measuredAt[language]}>
            <input
              className={inputClass}
              onChange={(event) => setMeasuredAt(event.target.value)}
              type="date"
              value={measuredAt}
            />
          </Field>
          <Field label={t.eventType[language]}>
            <select
              className={inputClass}
              onChange={(event) => setEventType(event.target.value as EventType)}
              value={eventType}
            >
              {eventOrder.map((key) => (
                <option key={key} value={key}>
                  {events[key][language]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${t.value[language]} (${language === "ja" ? events[eventType].unitJa : events[eventType].unitEn})`}>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setValue(event.target.value)}
              placeholder="30"
              type="number"
              value={value}
            />
          </Field>
          <Field label={t.comment[language]}>
            <textarea
              className={`${inputClass} min-h-28`}
              onChange={(event) => setComment(event.target.value)}
              value={comment}
            />
          </Field>
          {message ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {message}
            </p>
          ) : null}
          <Button disabled={loading} type="submit">
            {loading ? "..." : t.save[language]}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
