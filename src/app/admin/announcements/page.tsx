"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import {
  BackHomeButton,
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  PageHeader
} from "@/components/ui";
import { t } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { Announcement } from "@/lib/types";

type AnnouncementForm = {
  title: string;
  body: string;
  language: "ja" | "en" | "both";
  is_published: boolean;
  published_at: string;
};

const emptyForm: AnnouncementForm = {
  title: "",
  body: "",
  language: "both",
  is_published: true,
  published_at: new Date().toISOString().slice(0, 16)
};

export default function AnnouncementsPage() {
  const { user, language } = useAuth();
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  async function loadAnnouncements() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false });
    setAnnouncements((data as Announcement[]) ?? []);
  }

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  async function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await supabase.from("announcements").insert({
      ...form,
      published_at: new Date(form.published_at).toISOString(),
      created_by: user?.id ?? null
    });
    setForm(emptyForm);
    await loadAnnouncements();
  }

  async function updateAnnouncement(
    id: string,
    patch: Partial<AnnouncementForm>
  ) {
    await supabase.from("announcements").update(patch).eq("id", id);
    await loadAnnouncements();
  }

  async function deleteAnnouncement(id: string) {
    await supabase.from("announcements").delete().eq("id", id);
    await loadAnnouncements();
  }

  return (
    <AppShell requireAdmin>
      <BackHomeButton href="/admin" label={t.backToAdminHome[language]} />
      <PageHeader title={t.announcements[language]} />
      <Card>
        <form className="grid gap-4" onSubmit={createAnnouncement}>
          <Field label={t.title[language]}>
            <input
              className={inputClass}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              value={form.title}
            />
          </Field>
          <Field label={t.bodyText[language]}>
            <textarea
              className={`${inputClass} min-h-28`}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              value={form.body}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.language[language]}>
              <select
                className={inputClass}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    language: event.target.value as "ja" | "en" | "both"
                  }))
                }
                value={form.language}
              >
                <option value="both">both</option>
                <option value="ja">ja</option>
                <option value="en">en</option>
              </select>
            </Field>
            <Field label={language === "ja" ? "公開状態" : "Visibility"}>
              <select
                className={inputClass}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_published: event.target.value === "true"
                  }))
                }
                value={String(form.is_published)}
              >
                <option value="true">{t.publish[language]}</option>
                <option value="false">{t.unpublish[language]}</option>
              </select>
            </Field>
            <Field label={language === "ja" ? "公開日" : "Publish date"}>
              <input
                className={inputClass}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published_at: event.target.value
                  }))
                }
                type="datetime-local"
                value={form.published_at}
              />
            </Field>
          </div>
          <Button disabled={!form.title || !form.body} type="submit">
            {t.create[language]}
          </Button>
        </form>
      </Card>

      <section className="grid gap-3">
        {announcements.length ? (
          announcements.map((announcement) => (
            <AnnouncementEditor
              announcement={announcement}
              key={announcement.id}
              language={language}
              onDelete={() => void deleteAnnouncement(announcement.id)}
              onSave={(patch) => void updateAnnouncement(announcement.id, patch)}
            />
          ))
        ) : (
          <EmptyState text={t.empty[language]} />
        )}
      </section>
    </AppShell>
  );
}

function AnnouncementEditor({
  announcement,
  language,
  onDelete,
  onSave
}: {
  announcement: Announcement;
  language: "ja" | "en";
  onDelete: () => void;
  onSave: (patch: Partial<AnnouncementForm>) => void;
}) {
  const [draft, setDraft] = useState<AnnouncementForm>({
    title: announcement.title,
    body: announcement.body,
    language: announcement.language,
    is_published: announcement.is_published,
    published_at: announcement.published_at.slice(0, 16)
  });

  return (
    <Card>
      <div className="grid gap-3">
        <input
          className={inputClass}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          value={draft.title}
        />
        <textarea
          className={`${inputClass} min-h-24`}
          onChange={(event) =>
            setDraft((current) => ({ ...current, body: event.target.value }))
          }
          value={draft.body}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className={inputClass}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                language: event.target.value as "ja" | "en" | "both"
              }))
            }
            value={draft.language}
          >
            <option value="both">both</option>
            <option value="ja">ja</option>
            <option value="en">en</option>
          </select>
          <select
            className={inputClass}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                is_published: event.target.value === "true"
              }))
            }
            value={String(draft.is_published)}
          >
            <option value="true">{t.publish[language]}</option>
            <option value="false">{t.unpublish[language]}</option>
          </select>
          <input
            className={inputClass}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                published_at: event.target.value
              }))
            }
            type="datetime-local"
            value={draft.published_at}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() =>
              onSave({
                ...draft,
                published_at: new Date(draft.published_at).toISOString()
              })
            }
            type="button"
          >
            {t.save[language]}
          </Button>
          <Button onClick={onDelete} type="button" variant="danger">
            {t.delete[language]}
          </Button>
        </div>
      </div>
    </Card>
  );
}
