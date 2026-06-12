"use client";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { BackHomeButton, Card, LinkButton, PageHeader } from "@/components/ui";
import { t } from "@/lib/constants";

export default function ProfilePage() {
  const { profile, language } = useAuth();

  return (
    <AppShell>
      <BackHomeButton href="/dashboard" label={t.backToHome[language]} />
      <PageHeader title={t.profile[language]} />
      <Card>
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-bold text-slate-500">
              {t.instagramName[language]}
            </p>
            <p className="mt-1 text-2xl font-black">{profile?.instagram_name}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">
              {t.language[language]}
            </p>
            <div className="mt-2 max-w-xs">
              <LanguageToggle />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkButton href="/records/new">{t.newRecord[language]}</LinkButton>
            <LinkButton href="/body/new" variant="secondary">
              {t.newBody[language]}
            </LinkButton>
          </div>
          {profile?.role === "admin" ? (
            <LinkButton href="/admin" variant="secondary">
              {t.admin[language]}
            </LinkButton>
          ) : null}
        </div>
      </Card>
    </AppShell>
  );
}
