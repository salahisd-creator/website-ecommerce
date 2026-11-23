-- =====================================================================
-- حماية قاعدة بيانات Supabase (شغّله مرة واحدة في: Supabase > SQL Editor)
-- الفكرة: الجميع يقرأ المنتجات، ولكن الإضافة والتعديل والحذف لبريد المالك فقط.
-- بدون هذه القواعد، أي زائر يستطيع من الكونسول حذف منتجاتك لأن مفتاح anon علني.
-- =====================================================================
-- ملاحظة: البريد المكتوب أدناه (cheribetsalaheddine@gmail.com) هو بريد المالك في useAdmin.jsx. إن غيّرته غيّره هنا أيضاً.


-- ---------- جدول المنتجات ----------
alter table public.watches enable row level security;

drop policy if exists "watches_read"   on public.watches;
drop policy if exists "watches_insert" on public.watches;
drop policy if exists "watches_update" on public.watches;
drop policy if exists "watches_delete" on public.watches;

create policy "watches_read"   on public.watches for select using (true);
create policy "watches_insert" on public.watches for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');
create policy "watches_update" on public.watches for update to authenticated
  using      ((auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');
create policy "watches_delete" on public.watches for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');

-- ---------- صور المنتجات (bucket: product-images) ----------
drop policy if exists "images_read"   on storage.objects;
drop policy if exists "images_insert" on storage.objects;
drop policy if exists "images_update" on storage.objects;
drop policy if exists "images_delete" on storage.objects;

create policy "images_read"   on storage.objects for select using (bucket_id = 'product-images');
create policy "images_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');
create policy "images_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');
create policy "images_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'cheribetsalaheddine@gmail.com');

-- ---------- بعد التشغيل (من لوحة Supabase، ليس SQL) ----------
-- 1) Authentication > Providers > Email:  فعّل "Confirm email"
--    (حتى لا يستطيع أحد التسجيل ببريدك قبل تأكيده).
-- 2) Authentication > Sign In / Providers:  أوقف "Allow new users to sign up"
--    (متجرك لا يحتاج حسابات زبائن؛ الدخول لك وحدك).
