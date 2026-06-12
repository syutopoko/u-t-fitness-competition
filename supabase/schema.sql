create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  instagram_name text unique not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  preferred_language text not null default 'ja' check (preferred_language in ('ja', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instagram_name_format check (instagram_name ~ '^[a-z0-9_.]+$')
);

create table if not exists public.fitness_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'push_ups',
      'grip_strength',
      'sit_ups',
      'sit_and_reach',
      'dead_hang'
    )
  ),
  value numeric not null check (value > 0),
  unit text not null,
  measured_at date not null,
  comment text,
  status text not null default 'normal' check (status in ('normal', 'pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  measured_at date not null,
  height_cm numeric check (height_cm is null or height_cm > 0),
  weight_kg numeric check (weight_kg is null or weight_kg > 0),
  body_fat_percentage numeric check (
    body_fat_percentage is null
    or (body_fat_percentage >= 0 and body_fat_percentage <= 100)
  ),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  language text not null default 'both' check (language in ('ja', 'en', 'both')),
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_instagram_name_idx on public.profiles (instagram_name);
create index if not exists fitness_records_user_id_idx on public.fitness_records (user_id);
create index if not exists fitness_records_ranking_idx on public.fitness_records (event_type, status, measured_at, value desc);
create index if not exists body_measurements_user_id_idx on public.body_measurements (user_id, measured_at desc);
create index if not exists announcements_public_idx on public.announcements (is_published, language, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists fitness_records_set_updated_at on public.fitness_records;
create trigger fitness_records_set_updated_at
before update on public.fitness_records
for each row execute function public.set_updated_at();

drop trigger if exists body_measurements_set_updated_at on public.body_measurements;
create trigger body_measurements_set_updated_at
before update on public.body_measurements
for each row execute function public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create or replace function public.prevent_member_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin(auth.uid()) then
    raise exception 'Only admins can change profile roles.';
  end if;

  new.instagram_name = lower(new.instagram_name);
  return new;
end;
$$;

drop trigger if exists profiles_prevent_member_role_change on public.profiles;
create trigger profiles_prevent_member_role_change
before update on public.profiles
for each row execute function public.prevent_member_role_change();

create or replace view public.approved_rankings
with (security_invoker = false)
as
select
  fr.id,
  fr.user_id,
  p.instagram_name,
  fr.event_type,
  fr.value,
  fr.unit,
  fr.measured_at,
  fr.created_at
from public.fitness_records fr
join public.profiles p on p.id = fr.user_id
where fr.status = 'approved';

create or replace view public.pending_records
with (security_invoker = false)
as
select
  fr.id,
  fr.user_id,
  p.instagram_name,
  fr.event_type,
  fr.value,
  fr.unit,
  fr.measured_at,
  fr.comment,
  fr.created_at
from public.fitness_records fr
join public.profiles p on p.id = fr.user_id
where fr.status = 'pending'
  and public.is_admin(auth.uid());

alter table public.profiles enable row level security;
alter table public.fitness_records enable row level security;
alter table public.body_measurements enable row level security;
alter table public.announcements enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own_member on public.profiles;
create policy profiles_insert_own_member
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'member'
  and instagram_name = lower(instagram_name)
);

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists fitness_records_select_allowed on public.fitness_records;
create policy fitness_records_select_allowed
on public.fitness_records
for select
to authenticated
using (
  user_id = auth.uid()
  or status = 'approved'
  or public.is_admin()
);

drop policy if exists fitness_records_insert_own on public.fitness_records;
create policy fitness_records_insert_own
on public.fitness_records
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status in ('normal', 'pending')
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists fitness_records_update_own_limited on public.fitness_records;
create policy fitness_records_update_own_limited
on public.fitness_records
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and status in ('normal', 'pending', 'rejected')
  and reviewed_by is null
);

drop policy if exists fitness_records_admin_all on public.fitness_records;
create policy fitness_records_admin_all
on public.fitness_records
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists body_measurements_select_own_or_admin on public.body_measurements;
create policy body_measurements_select_own_or_admin
on public.body_measurements
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists body_measurements_insert_own on public.body_measurements;
create policy body_measurements_insert_own
on public.body_measurements
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists body_measurements_update_own_or_admin on public.body_measurements;
create policy body_measurements_update_own_or_admin
on public.body_measurements
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists announcements_select_public_or_admin on public.announcements;
create policy announcements_select_public_or_admin
on public.announcements
for select
to authenticated
using (
  (is_published = true and published_at <= now())
  or public.is_admin()
);

drop policy if exists announcements_admin_insert on public.announcements;
create policy announcements_admin_insert
on public.announcements
for insert
to authenticated
with check (public.is_admin());

drop policy if exists announcements_admin_update on public.announcements;
create policy announcements_admin_update
on public.announcements
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists announcements_admin_delete on public.announcements;
create policy announcements_admin_delete
on public.announcements
for delete
to authenticated
using (public.is_admin());

drop policy if exists app_settings_select_public_or_admin on public.app_settings;
create policy app_settings_select_public_or_admin
on public.app_settings
for select
to authenticated
using (key like 'public_%' or public.is_admin());

drop policy if exists app_settings_admin_all on public.app_settings;
create policy app_settings_admin_all
on public.app_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.approved_rankings to authenticated;
grant select on public.pending_records to authenticated;
grant all on public.profiles to authenticated;
grant all on public.fitness_records to authenticated;
grant all on public.body_measurements to authenticated;
grant all on public.announcements to authenticated;
grant all on public.app_settings to authenticated;
