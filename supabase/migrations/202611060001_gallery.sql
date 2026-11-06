begin;
create table public.artist_access (
 singleton boolean primary key default true check (singleton),
 user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.artist_access enable row level security;
revoke all on public.artist_access from anon, authenticated;
create function public.is_artist() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.artist_access where user_id = (select auth.uid()));
$$;
revoke all on function public.is_artist() from public;
grant execute on function public.is_artist() to anon, authenticated;
create table public.paintings (
 id uuid primary key default gen_random_uuid(),
 title text check (char_length(title)<=200), medium text check (char_length(medium)<=200),
 description text check (char_length(description)<=5000),
 width numeric(8,3) check (width>0 and width<=10000),
 height numeric(8,3) check (height>0 and height<=10000),
 depth numeric(8,3) check (depth>0 and depth<=10000),
 price_cents bigint check (price_cents>=0 and price_cents<=999999999),
 availability text not null default 'available' check (availability in ('available','sold')),
 visibility text not null default 'draft' check (visibility in ('draft','published','hidden')),
 photo_path text unique,
 created_at timestamptz not null default now(),
 constraint valid_photo_path check (photo_path is null or photo_path ~ ('^' || id::text || '/[0-9a-f-]+[.]webp$')),
 constraint publish_complete check (visibility <> 'published' or (photo_path is not null and width is not null and height is not null))
);
alter table public.paintings enable row level security;
revoke all on public.paintings from anon,authenticated;
grant select on public.paintings to anon,authenticated;
grant insert,update,delete on public.paintings to authenticated;
create policy published_read on public.paintings for select to anon,authenticated using (visibility='published');
create policy artist_read on public.paintings for select to authenticated using ((select public.is_artist()));
create policy artist_insert on public.paintings for insert to authenticated with check ((select public.is_artist()));
create policy artist_update on public.paintings for update to authenticated using ((select public.is_artist())) with check ((select public.is_artist()));
create policy artist_delete on public.paintings for delete to authenticated using ((select public.is_artist()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('paintings','paintings',false,3145728,array['image/webp']);
-- Public downloads remain authenticated by current publication state. No signed URLs or public bucket.
create policy painting_photo_read on storage.objects for select to anon,authenticated using (
 bucket_id='paintings' and ((select public.is_artist()) or exists(select 1 from public.paintings p where p.photo_path=name and p.visibility='published'))
);
create policy artist_photo_insert on storage.objects for insert to authenticated with check (bucket_id='paintings' and (select public.is_artist()));
create policy artist_photo_delete on storage.objects for delete to authenticated using (bucket_id='paintings' and (select public.is_artist()) and not exists(select 1 from public.paintings p where p.photo_path=name));
-- An attached photo must actually exist; guard direct API writes too.
create function public.check_painting_photo() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.photo_path is not null and not exists(select 1 from storage.objects where bucket_id='paintings' and name=new.photo_path) then
  raise exception 'Upload a photo before attaching it to a painting.';
 end if;
 return new;
end;
$$;
revoke all on function public.check_painting_photo() from public;
create trigger painting_photo_exists before insert or update on public.paintings for each row execute function public.check_painting_photo();
commit;
