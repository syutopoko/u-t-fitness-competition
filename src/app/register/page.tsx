"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Button, Card, Field, inputClass } from "@/components/ui";
import {
  instagramNameToEmail,
  normalizeInstagramName,
  validateInstagramName
} from "@/lib/auth";
import { t } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { language, refreshProfile } = useAuth();
  const [instagramName, setInstagramName] = useState("");
  const [password, setPassword] = useState("");
  const [followConfirmed, setFollowConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!followConfirmed) {
      setError(t.followConfirmError[language]);
      return;
    }

    const validationError = validateInstagramName(instagramName, language);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password.length < 6) {
      setError(
        language === "ja"
          ? "パスワードは6文字以上にしてください。"
          : "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);
    const normalized = normalizeInstagramName(instagramName);
    const { data, error: authError } = await supabase.auth.signUp({
      email: instagramNameToEmail(normalized),
      password
    });

    if (authError || !data.user) {
      setError(
        language === "ja"
          ? "登録できませんでした。名前が既に使われている可能性があります。"
          : "Could not register. The name may already be used."
      );
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      instagram_name: normalized,
      role: "member",
      preferred_language: language
    });

    if (profileError) {
      setError(
        language === "ja"
          ? "プロフィール作成に失敗しました。Supabaseのメール確認設定を確認してください。"
          : "Profile creation failed. Check Supabase email confirmation settings."
      );
      setLoading(false);
      return;
    }

    await refreshProfile();
    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-field px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-sport-dark">
              {t.appSubtitle[language]}
            </p>
            <h1 className="mt-2 text-3xl font-black text-ink">
              {t.register[language]}
            </h1>
          </div>
          <LanguageToggle />
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label={t.instagramName[language]}>
            <input
              autoComplete="username"
              className={inputClass}
              inputMode="text"
              onChange={(event) => setInstagramName(event.target.value)}
              placeholder="ut_member"
              value={instagramName}
            />
          </Field>
          <Field label={t.password[language]}>
            <input
              autoComplete="new-password"
              className={inputClass}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </Field>
          <section className="grid gap-4 rounded-lg border border-sport-light bg-sport-light/70 p-4">
            <div className="grid gap-2">
              <h2 className="text-base font-black text-ink">
                {t.followInstagram[language]}
              </h2>
              <p className="text-sm font-semibold leading-6 text-slate-700">
                {t.registerFollowRequired[language]}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {t.registerFollowInstructions[language]}
              </p>
            </div>
            <a
              className="flex min-h-12 items-center justify-center rounded-lg bg-white px-5 py-3 text-center text-sm font-black text-sport-dark shadow-sm ring-1 ring-sky-100 transition hover:bg-slate-50"
              href={instagramUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t.openInstagramFollow[language]}
            </a>
            <label className="flex items-start gap-3 rounded-lg bg-white p-3 text-sm font-bold leading-6 text-ink ring-1 ring-sky-100">
              <input
                checked={followConfirmed}
                className="mt-1 h-5 w-5 shrink-0 accent-sport-dark"
                onChange={(event) => setFollowConfirmed(event.target.checked)}
                type="checkbox"
              />
              <span>{t.followConfirmed[language]}</span>
            </label>
          </section>
          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <Button
            disabled={loading || !password || !followConfirmed}
            type="submit"
          >
            {loading ? "..." : t.register[language]}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {language === "ja" ? "登録済みの方は" : "Already registered?"}{" "}
          <Link className="font-bold text-sport-dark" href="/login">
            {t.login[language]}
          </Link>
        </p>
      </Card>
    </main>
  );
}
