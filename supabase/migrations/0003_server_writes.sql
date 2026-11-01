-- Chỉ server ghi lá bài và lời thoại (bất biến 1: tên lá chỉ đến từ kết quả rút trên server).
-- Trước đây khách đăng nhập có thể dùng publishable key chèn thẳng lá tùy ý hoặc tin nhắn role 'nguyet'.

drop policy if exists "reading_cards: tạo của mình" on public.reading_cards;
drop policy if exists "messages: tạo của mình" on public.messages;
revoke insert, update on public.reading_cards from anon, authenticated;
revoke insert, update on public.messages from anon, authenticated;

-- Khách chỉ sửa được ghi chú và "điều đó đã xảy ra chưa"; status, summary, advice… do server ghi.
revoke update on public.readings from anon, authenticated;
grant update (note, happened) on public.readings to authenticated;
