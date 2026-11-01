-- Ngôi nhà trong rừng — schema khởi tạo
-- Chạy trong Supabase: SQL Editor -> dán toàn bộ file -> Run.

create extension if not exists pgcrypto;

-- Hồ sơ người dùng ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  address_style text not null default 'ta-cau' check (address_style in ('ta-cau', 'minh-ban', 'chi-em')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Gói trả phí: mỗi người một dòng, gia hạn bằng cách lùi expires_at -------------
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('month', 'year')),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- Thanh toán payOS -------------------------------------------------------------
create table public.payments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_code bigint not null unique,
  plan text not null check (plan in ('month', 'year')),
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  checkout_url text,
  raw jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Phiên đọc bài ---------------------------------------------------------------
create table public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null check (char_length(question) <= 500),
  topic text not null check (topic in ('tinh_cam', 'cong_viec', 'tai_chinh', 'ban_than')),
  spread text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'stopped')),
  summary text,
  advice text,
  note text check (char_length(note) <= 2000),
  happened boolean,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index readings_user_created_idx on public.readings (user_id, created_at desc);

create table public.reading_cards (
  reading_id uuid not null references public.readings (id) on delete cascade,
  position smallint not null,
  card_id smallint not null check (card_id between 0 and 77),
  reversed boolean not null,
  clarifier boolean not null default false,
  primary key (reading_id, position)
);

create table public.messages (
  id bigint generated always as identity primary key,
  reading_id uuid not null references public.readings (id) on delete cascade,
  role text not null check (role in ('nguyet', 'user')),
  tag text,
  text text not null,
  created_at timestamptz not null default now()
);
create index messages_reading_idx on public.messages (reading_id, id);

-- Bộ nhớ dài hạn (dùng khi gắn AI) ---------------------------------------------
create table public.user_memory (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  do_not_mention text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.readings enable row level security;
alter table public.reading_cards enable row level security;
alter table public.messages enable row level security;
alter table public.user_memory enable row level security;

create policy "profiles: xem của mình" on public.profiles for select using (auth.uid() = id);
create policy "profiles: sửa của mình" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Gói và thanh toán chỉ được đọc; chỉ server (secret key) mới ghi.
create policy "subscriptions: xem của mình" on public.subscriptions for select using (auth.uid() = user_id);
create policy "payments: xem của mình" on public.payments for select using (auth.uid() = user_id);

create policy "readings: xem của mình" on public.readings for select using (auth.uid() = user_id);
create policy "readings: tạo của mình" on public.readings for insert with check (auth.uid() = user_id);
create policy "readings: sửa của mình" on public.readings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reading_cards: xem của mình" on public.reading_cards for select
  using (exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid()));
create policy "reading_cards: tạo của mình" on public.reading_cards for insert
  with check (exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid()));

create policy "messages: xem của mình" on public.messages for select
  using (exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid()));
create policy "messages: tạo của mình" on public.messages for insert
  with check (exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid()));

create policy "user_memory: xem của mình" on public.user_memory for select using (auth.uid() = user_id);
