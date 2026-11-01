-- Kích hoạt gói từ webhook payOS trong MỘT transaction:
-- hoặc đơn được đánh dấu đã trả và gói được cộng ngày, hoặc không có gì thay đổi
-- (để webhook trả lỗi và payOS gửi lại). Chạy sau 0001_init.sql.

create or replace function public.activate_payment(p_order_code bigint, p_days integer, p_raw jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_sub public.subscriptions%rowtype;
  v_now timestamptz := now();
  v_base timestamptz;
  v_plan text;
begin
  if p_days is null or p_days <= 0 then
    raise exception 'activate_payment: số ngày không hợp lệ (%)', p_days;
  end if;

  -- Khóa dòng đơn để hai webhook gửi lặp cùng lúc không cộng ngày hai lần.
  select * into v_payment from public.payments where order_code = p_order_code for update;
  if not found then
    return 'not_found';
  end if;
  if v_payment.status = 'paid' then
    return 'already_paid';
  end if;

  update public.payments set status = 'paid', paid_at = v_now, raw = p_raw where id = v_payment.id;

  select * into v_sub from public.subscriptions where user_id = v_payment.user_id for update;
  if found and v_sub.expires_at > v_now then
    v_base := v_sub.expires_at;
    -- Đang còn gói năm mà mua thêm gói tháng thì vẫn giữ nhãn gói năm, chỉ cộng thêm ngày.
    v_plan := case when v_sub.plan = 'year' then 'year' else v_payment.plan end;
  else
    v_base := v_now;
    v_plan := v_payment.plan;
  end if;

  insert into public.subscriptions (user_id, plan, expires_at, updated_at)
  values (v_payment.user_id, v_plan, v_base + make_interval(days => p_days), v_now)
  on conflict (user_id) do update
    set plan = excluded.plan, expires_at = excluded.expires_at, updated_at = excluded.updated_at;

  return 'activated';
end $$;

-- Chỉ server (secret key) được gọi; khách không tự kích hoạt gói được.
revoke all on function public.activate_payment(bigint, integer, jsonb) from public, anon, authenticated;
grant execute on function public.activate_payment(bigint, integer, jsonb) to service_role;
