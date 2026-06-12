"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { instagramNameToEmail, validateInstagramName } from "@/lib/auth";
import { t } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { language, refreshProfile } = useAuth();
  const [instagramName, setInstagramName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateInstagramName(instagramName, language);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: instagramNameToEmail(instagramName),
      password
    });

    if (authError) {
      setError(
        language === "ja"
          ? "名前またはパスワードが正しくありません。"
          : "Name or password is incorrect."
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
              {t.appName[language]}
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
              autoComplete="current-password"
              className={inputClass}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </Field>
          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <Button disabled={loading || !password} type="submit">
            {loading ? "..." : t.login[language]}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {language === "ja" ? "初めての方は" : "New here?"}{" "}
          <Link className="font-bold text-sport-dark" href="/register">
            {t.register[language]}
          </Link>
        </p>
      </Card>
    </main>
  );
}
