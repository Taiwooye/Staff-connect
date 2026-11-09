create table public.account_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('client', 'provider')),
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.account_profiles enable row level security;
revoke all on table public.account_profiles from anon, authenticated;
grant select on table public.account_profiles to authenticated;

create policy "Users can read their own account type"
  on public.account_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create function public.handle_new_staffconnect_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_account_type text := new.raw_user_meta_data ->> 'account_type';
  selected_display_name text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
begin
  if selected_account_type is null
    or selected_account_type not in ('client', 'provider') then
    raise exception 'A valid StaffConnect account type is required';
  end if;

  if selected_display_name is null then
    raise exception 'A display name is required';
  end if;

  insert into public.account_profiles (id, account_type, display_name)
  values (new.id, selected_account_type, selected_display_name);

  return new;
end;
$$;

revoke all on function public.handle_new_staffconnect_user() from public, anon, authenticated;

create trigger on_auth_user_created_staffconnect
  after insert on auth.users
  for each row execute procedure public.handle_new_staffconnect_user();

create table public.saved_professionals (
  user_id uuid not null references public.account_profiles (id) on delete cascade,
  professional_id text not null check (length(professional_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

alter table public.saved_professionals enable row level security;
revoke all on table public.saved_professionals from anon, authenticated;
grant select, insert, delete on table public.saved_professionals to authenticated;

create policy "Clients can read their saved professionals"
  on public.saved_professionals
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.account_profiles
      where id = (select auth.uid())
        and account_type = 'client'
    )
  );

create policy "Clients can save professionals"
  on public.saved_professionals
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.account_profiles
      where id = (select auth.uid())
        and account_type = 'client'
    )
  );

create policy "Clients can remove their saved professionals"
  on public.saved_professionals
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.account_profiles
      where id = (select auth.uid())
        and account_type = 'client'
    )
  );
