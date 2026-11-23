/* =========================================================
   ImportProducts.jsx  ←  src/Orderspart/ImportProducts.jsx
   صفحة «استيراد منتجات Flexy» — المسار: /admin/import
   تنسخ 173 منتجاً (اسم/سعر/وصف/صور) من متجر Flexy إلى متجرك.
   تتطلب أن تكون مسجلاً في المتجر (supabase) كمالك. آمنة للإعادة: لا تكرر المنتجات.
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { compressImage } from "../compressImage";
import Layout from "./Layout";
import { KIT_CSS, useToast } from "./kit";

export const GROUPS = {
  original: { label: "ساعات أصلية", category: "watches", brand: "original" },
  mid: { label: "ساعات متوسطة", category: "watches", brand: "mid" },
  glasses: { label: "نظارات جودة عادية", category: "glasses", brand: "glasses-std" },
};
const BUCKET = "product-images";

const CSS = `
.imp{max-width:720px;margin:0 auto;padding:16px;direction:rtl}
.imp h2{margin:0 0 6px}.imp p{color:#666;line-height:1.7;margin:4px 0 14px}
.imp-g{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.imp-g label{display:flex;gap:10px;align-items:center;padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;color:#111}
.imp-b{padding:13px 22px;border:0;border-radius:12px;background:#111;color:#fff;font-size:16px;cursor:pointer}
.imp-b:disabled{opacity:.5;cursor:default}
.imp-bar{height:12px;border-radius:8px;background:#eee;overflow:hidden;margin:14px 0 6px}
.imp-bar i{display:block;height:100%;background:#2e9d6a;transition:width .2s}
.imp-log{max-height:260px;overflow:auto;font-size:13px;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:10px;color:#333;direction:ltr;text-align:left}
.imp-log .e{color:#b3261e}
`;

const urlFor = (base, id) => base + (/\.(jpe?g|png|webp)$/i.test(id) ? id : id + ".webp");

async function fetchImage(base, id) {
  const tries = /\.(jpe?g|png|webp)$/i.test(id) ? [id] : [id + ".webp", id];
  for (const t of tries) {
    try {
      const r = await fetch(base + t);
      if (!r.ok) continue;
      const b = await r.blob();
      if (b.size > 0 && /^image\//.test(b.type || "image/webp")) return new File([b], t, { type: b.type || "image/webp" });
    } catch { /* try next */ }
  }
  return null;
}

export default function ImportProducts() {
  const [toast, notify] = useToast();
  const [sel, setSel] = useState({ original: true, mid: true, glasses: true });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [log, setLog] = useState([]);
  const [who, setWho] = useState("…");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setWho(data?.user?.email || "غير مسجّل")).catch(() => setWho("؟")); }, []);
  const stop = useRef(false);
  const add = (m, e) => setLog((l) => [...l.slice(-300), { m, e }]);

  async function run() {
    setBusy(true); stop.current = false; setLog([]); setDone(0);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { add("يجب تسجيل الدخول إلى المتجر أولاً (صفحة /login).", true); setBusy(false); return; }
      const res = await fetch("/import-data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("ملف import-data.json غير موجود في مجلد public");
      const data = await res.json();
      const jobs = [];
      Object.keys(GROUPS).forEach((g) => {
        if (!sel[g]) return;
        (data.groups[g] || []).forEach((p, i) => jobs.push({ g, i, p }));
      });
      setTotal(jobs.length);
      const slugs = jobs.map((j) => `grifa-${j.g}-${j.i + 1}`);
      const { data: ex, error: exErr } = await supabase.from("watches").select("slug").in("slug", slugs);
      if (exErr) throw exErr;
      const have = new Set((ex || []).map((r) => r.slug));
      let ok = 0, skip = 0, fail = 0;
      for (let k = 0; k < jobs.length; k++) {
        if (stop.current) { add("تم الإيقاف."); break; }
        const { g, p } = jobs[k]; const slug = slugs[k];
        const [name, price, bio, ids] = p;
        if (have.has(slug)) { skip++; setDone(k + 1); continue; }
        const uploaded = [];
        try {
          const urls = [];
          for (let n = 0; n < ids.length; n++) {
            const f0 = await fetchImage(data.base, ids[n]);
            if (!f0) { add(`${name}: تعذّر تحميل صورة ${n + 1}`, true); continue; }
            const f = await compressImage(f0);
            const ext = (f.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
            const path = `${GROUPS[g].brand}/${slug}-${n + 1}.${ext}`;
            const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type || undefined });
            if (upErr && !/already exists|Duplicate/i.test(String(upErr.message))) throw new Error("رفع الصورة: " + upErr.message);
            if (!upErr) uploaded.push(path);
            urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
          }
          if (!urls.length) throw new Error("لا توجد صور");
          const { data: ins, error } = await supabase.from("watches").insert({
            slug, name, bio, price: Number(price) || 0, images: urls, category: GROUPS[g].category, brand: GROUPS[g].brand,
          }).select();
          if (error) throw error;
          if (!ins || !ins.length) throw new Error("RLS: تأكد أنك مسجل كمالك");
          ok++; add(`✔ ${name}`);
        } catch (err) {
          fail++; add(`✘ ${name}: ${err.message || err}`, true);
          if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
          if (/RLS|row-level|JWT|permission/i.test(String(err.message))) { add("توقف: Supabase رفض العملية (" + (/رفع الصورة/.test(err.message) ? "رفع الصور" : "إضافة المنتج") + "). أرسل لقطة هذه الرسالة.", true); break; }
        }
        setDone(k + 1);
      }
      add(`انتهى — أُضيف ${ok} · موجود مسبقاً ${skip} · فشل ${fail}`);
      notify(fail ? "انتهى مع بعض الأخطاء" : "تم الاستيراد ✅");
    } catch (err) {
      add("خطأ: " + (err.message || err), true);
    }
    setBusy(false);
  }

  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Layout hideSearch toast={toast} need="products">
      <style>{KIT_CSS}{CSS}</style>
      <div className="imp">
        <h2>استيراد منتجات Flexy</h2>
        <p>تنسخ المنتجات (الاسم، السعر، الوصف، الصور) إلى متجرك. الصور تُضغط WebP وتُرفع إلى Supabase. يمكنك إعادة التشغيل بأمان: المنتجات الموجودة تُتجاوز.</p>
        <p>حساب المتجر المسجَّل الآن: <b dir="ltr">{who}</b> — يجب أن يكون حساب مالك المتجر نفسه الذي تضيف به المنتجات من «إضافة منتج».</p>
        <div className="imp-g">
          {Object.keys(GROUPS).map((g) => (
            <label key={g}><input type="checkbox" checked={sel[g]} disabled={busy} onChange={(e) => setSel({ ...sel, [g]: e.target.checked })} />{GROUPS[g].label}</label>
          ))}
        </div>
        <button className="imp-b" disabled={busy || !Object.values(sel).some(Boolean)} onClick={run}>{busy ? "جارٍ الاستيراد…" : "ابدأ الاستيراد"}</button>
        {busy && <button className="imp-b" style={{ marginInlineStart: 8, background: "#888" }} onClick={() => { stop.current = true; }}>إيقاف</button>}
        {total > 0 && (<><div className="imp-bar"><i style={{ width: pct + "%" }} /></div><div>{done} / {total}</div></>)}
        {log.length > 0 && <div className="imp-log">{log.map((l, i) => <div key={i} className={l.e ? "e" : ""}>{l.m}</div>)}</div>}
      </div>
    </Layout>
  );
}
