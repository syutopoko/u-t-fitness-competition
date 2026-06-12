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
import { t } from "@/lib/constants";
import { todayInputValue } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";

export default function NewBodyPage() {
  const router = useRouter();
  const { user, language } = useAuth();
  const [measuredAt, setMeasuredAt] = useState(todayInputValue());
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function optionalNumber(value: string) {
    return value ? Number(value) : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("body_measurements").insert({
      user_id: user.id,
      measured_at: measuredAt,
      height_cm: optionalNumber(heightCm),
      weight_kg: optionalNumber(weightKg),
      body_fat_percentage: optionalNumber(bodyFat),
      comment: comment || null
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
      <PageHeader
        title={t.newBody[language]}
        subtitle={
          language === "ja"
            ? "InBodyDial連携は使わず、MVPでは手入力で保存します。"
            : "This MVP stores body data manually without InBodyDial integration."
        }
      />
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
          <Field label={t.height[language]}>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setHeightCm(event.target.value)}
              type="number"
              value={heightCm}
            />
          </Field>
          <Field label={t.weight[language]}>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setWeightKg(event.target.value)}
              type="number"
              value={weightKg}
            />
          </Field>
          <Field label={t.bodyFat[language]}>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setBodyFat(event.target.value)}
              type="number"
              value={bodyFat}
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
