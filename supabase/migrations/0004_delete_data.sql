-- Quyền xóa dữ liệu: khách xóa được từng phiên hoặc toàn bộ phiên, bộ nhớ và hồ sơ của mình.
-- Giữ lại: payments (kế toán), subscriptions (gói đã mua), reading_usage (đếm hạn mức).

-- Đếm lượt trải bài tách khỏi readings, để xóa phiên không làm "hồi" hạn mức tháng.
-- Chỉ có thời điểm, không chứa câu hỏi hay lá bài.
create table public.reading_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index reading_usage_user_created_idx on public.reading_usage (user_id, created_at desc);
alter table public.reading_usage enable row level security;
create policy "reading_usage: xem của mình" on public.reading_usage for select using (auth.uid() = user_id);
revoke insert, update, delete on public.reading_usage from anon, authenticated;

insert into public.reading_usage (user_id, created_at)
select user_id, created_at from public.readings;

-- Xóa phiên kéo theo reading_cards và messages (on delete cascade).
create policy "readings: xóa của mình" on public.readings for delete using (auth.uid() = user_id);
create policy "user_memory: xóa của mình" on public.user_memory for delete using (auth.uid() = user_id);
create policy "profiles: xóa của mình" on public.profiles for delete using (auth.uid() = id);
