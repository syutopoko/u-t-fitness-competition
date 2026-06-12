"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  BackHomeButton,
  Card,
  EmptyState,
  PageHeader,
  StatusPill
} from "@/components/ui";
import { t } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { supabase } from "@/lib/supabase/client";
import type { BodyMeasurement, Profile } from "@/lib/types";

type MemberWithBody = Profile & {
  latestBody?: BodyMeasurement;
};

export default function MembersPage() {
  const { language } = useAuth();
  const [members, setMembers] = useState<MemberWithBody[]>([]);

  useEffect(() => {
    void Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("body_measurements")
        .select("*")
        .order("measured_at", { ascending: false })
    ]).then(([profilesResult, bodyResult]) => {
      const latestByUser = new Map<string, BodyMeasurement>();
      ((bodyResult.data as BodyMeasurement[]) ?? []).forEach((row) => {
        if (!latestByUser.has(row.user_id)) {
          latestByUser.set(row.user_id, row);
        }
      });
      setMembers(
        ((profilesResult.data as Profile[]) ?? []).map((profile) => ({
          ...profile,
          latestBody: latestByUser.get(profile.id)
        }))
      );
    });
  }, []);

  return (
    <AppShell requireAdmin>
      <BackHomeButton href="/admin" label={t.backToAdminHome[language]} />
      <PageHeader title={t.members[language]} />
      <section className="grid gap-3">
        {members.length ? (
          members.map((member) => (
            <Card key={member.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-black">
                    {member.instagram_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(member.created_at)}
                  </p>
                  {member.latestBody ? (
                    <div className="mt-2 grid gap-1 text-sm font-semibold text-slate-600">
                      <p>
                        {t.latestBodyShort[language]}:{" "}
                        {formatDate(member.latestBody.measured_at)}
                      </p>
                      <p>
                        {member.latestBody.height_cm ?? "-"}cm /{" "}
                        {member.latestBody.weight_kg ?? "-"}kg /{" "}
                        {member.latestBody.body_fat_percentage ?? "-"}%
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      {t.latestBodyShort[language]}: -
                    </p>
                  )}
                </div>
                <StatusPill tone={member.role === "admin" ? "good" : "neutral"}>
                  {member.role}
                </StatusPill>
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
