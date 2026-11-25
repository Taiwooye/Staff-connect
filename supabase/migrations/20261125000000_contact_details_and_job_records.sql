-- Company records for safety and dispute handling, written by the StaffConnect
-- mobile app. Users can only see and change their own rows; StaffConnect staff
-- read everything from the Supabase dashboard (service role bypasses RLS).

create table public.contact_details (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('client', 'provider')),
  full_name text not null check (length(full_name) between 2 and 120),
  phone text check (length(phone) <= 20),
  state text not null check (length(state) between 1 and 60),
  area text not null check (length(area) between 1 and 80),
  address text not null check (length(address) between 6 and 200),
  landmark text check (length(landmark) <= 200),
  updated_at timestamptz not null default now()
);

alter table public.contact_details enable row level security;
revoke all on table public.contact_details from anon, authenticated;
grant select, insert, update on table public.contact_details to authenticated;

create policy "Users can read their own contact details"
  on public.contact_details for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own contact details"
  on public.contact_details for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own contact details"
  on public.contact_details for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.job_records (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (length(id) between 1 and 64),
  kind text not null check (kind in ('booking', 'pro_job')),
  service_id text not null check (length(service_id) between 1 and 60),
  status text not null check (length(status) between 1 and 30),
  area text not null check (length(area) <= 80),
  address text not null check (length(address) <= 200),
  landmark text check (length(landmark) <= 200),
  scheduled_for text check (length(scheduled_for) <= 80),
  hours numeric check (hours >= 0 and hours <= 24),
  amount integer check (amount >= 0),
  payment text check (payment in ('cash', 'transfer')),
  client_name text check (length(client_name) <= 120),
  pro_name text check (length(pro_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index job_records_created_at_idx on public.job_records (created_at desc);

alter table public.job_records enable row level security;
revoke all on table public.job_records from anon, authenticated;
grant select, insert, update on table public.job_records to authenticated;

create policy "Users can read their own job records"
  on public.job_records for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own job records"
  on public.job_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own job records"
  on public.job_records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
