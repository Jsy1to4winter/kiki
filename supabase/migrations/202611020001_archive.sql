-- Run once in the Supabase SQL editor, then create your administrator in Auth > Users.
begin;
create table if not exists public.archive_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.archive_admins enable row level security;
-- Keep the administrator list private. Manage it only through the dashboard SQL editor.
revoke all on public.archive_admins from anon, authenticated;
create or replace function public.is_archive_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.archive_admins where user_id = auth.uid()) $$;
revoke all on function public.is_archive_admin() from public;
grant execute on function public.is_archive_admin() to anon, authenticated;

create table if not exists public.archive_profile (
  id text primary key default 'main' check (id = 'main'),
  data jsonb not null check (jsonb_typeof(data) = 'object')
);
create table if not exists public.archive_images (
  id uuid primary key default gen_random_uuid(),
  album text not null check (album in ('stamp-01','stamp-02','stamp-03','reviews')),
  storage_path text not null unique,
  name text not null default '',
  sort_order bigint generated always as identity,
  created_at timestamptz not null default now()
);
alter table public.archive_profile enable row level security;
alter table public.archive_images enable row level security;
grant select on public.archive_profile, public.archive_images to anon, authenticated;
grant insert,update,delete on public.archive_profile, public.archive_images to authenticated;
grant usage,select on sequence public.archive_images_sort_order_seq to authenticated;
create policy "Read published profile" on public.archive_profile for select to anon,authenticated using (true);
create policy "Administrators edit profile" on public.archive_profile for all to authenticated using (public.is_archive_admin()) with check (public.is_archive_admin());
create policy "Read published images" on public.archive_images for select to anon,authenticated using (true);
create policy "Administrators edit images" on public.archive_images for all to authenticated using (public.is_archive_admin()) with check (public.is_archive_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('archive-images','archive-images',true,20971520,array['image/png','image/jpeg','image/webp','image/gif','image/avif'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "Read archive image files" on storage.objects for select to anon,authenticated using (bucket_id='archive-images');
create policy "Administrators upload archive files" on storage.objects for insert to authenticated with check (bucket_id='archive-images' and public.is_archive_admin());
create policy "Administrators update archive files" on storage.objects for update to authenticated using (bucket_id='archive-images' and public.is_archive_admin()) with check (bucket_id='archive-images' and public.is_archive_admin());
create policy "Administrators delete archive files" on storage.objects for delete to authenticated using (bucket_id='archive-images' and public.is_archive_admin());
commit;
-- Replace with your Auth user UUID, then execute separately:
-- insert into public.archive_admins(user_id) values ('YOUR_AUTH_USER_UUID');
