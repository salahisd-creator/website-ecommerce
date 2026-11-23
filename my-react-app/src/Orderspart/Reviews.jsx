/* =========================================================
   Reviews.jsx  ←  src/Orderspart/Reviews.jsx
   صفحة «آراء الزبائن» — المسار: /admin/reviews
   إضافة وتعديل وحذف وترتيب. الأمثلة التجريبية تظهر هنا فقط ولا تُنشر للزوار.
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { Confirm, KIT_CSS, Modal, Toggle, useToast } from "./kit";
import { Icon } from "./ui";
import { compressImage } from "../compressImage";

const toDataUrl = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

const RERR = { invalid_name: "الاسم حرفان على الأقل.", invalid_rating: "التقييم من 1 إلى 5.", invalid_text: "اكتب نص التقييم (3 أحرف على الأقل).", too_many_items: "وصلت للحد الأقصى من التقييمات.", bad_image: "الصورة غير صالحة أو كبيرة جداً (الحد 700KB)." };
const errText = (e) => (e instanceof HttpError ? RERR[e.code] || `تعذّر التنفيذ (الرمز ${e.status}).` : "تعذّر الوصول إلى الخادم.");
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

function Form({ initial, onClose, onSave, busy }) {
  const [f, setF] = useState({ name: initial ? initial.name : "", city: initial ? initial.city : "", rating: initial ? initial.rating : 5, text: initial ? initial.text : "" });
  const [real, setReal] = useState(false);
  const [img, setImg] = useState(initial && initial.image ? { url: initial.image, old: true } : null); // { url, data?, old? }
  const [er, setEr] = useState("");
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      let data = null;
      for (const [max, q] of [[1000, 0.78], [800, 0.65], [640, 0.55]]) { const d = await toDataUrl(await compressImage(file, { max, quality: q })); if (d.length < 480000) { data = d; break; } }
      if (!data) return setEr("الصورة كبيرة جداً، اختر صورة أصغر.");
      setEr(""); setImg({ url: data, data });
    } catch { setEr("تعذّر قراءة الصورة."); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setEr(RERR.invalid_name);
    if (f.text.trim().length < 3) return setEr(RERR.invalid_text);
    setEr("");
    onSave({ name: f.name.trim(), city: f.city.trim(), rating: Number(f.rating), text: f.text.trim(), real: initial && initial.demo ? real : undefined, ...(img && img.data ? { image: img.data } : !img && initial && initial.image ? { image: "" } : {}) });
  };
  return (
    <Modal label={initial ? "تعديل التقييم" : "إضافة تقييم"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <label className="fl"><span>اسم الزبون</span><input className="inp" value={f.name} onChange={set("name")} maxLength={60} /></label>
        <div className="kfg">
          <label className="fl"><span>المدينة (اختياري)</span><input className="inp" value={f.city} onChange={set("city")} maxLength={40} /></label>
          <label className="fl"><span>التقييم</span>
            <select className="inp" value={f.rating} onChange={set("rating")}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{stars(n)}</option>)}</select></label>
        </div>
        <label className="fl"><span>نص التقييم</span><textarea className="inp" rows={4} value={f.text} onChange={set("text")} maxLength={400} /></label>
        <div className="fl"><span>صورة مع التقييم (اختياري): لقطة رسالة الزبون أو صورته مع المنتج</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {img ? <img src={img.url} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} /> : null}
            <label className="chip" style={{ cursor: "pointer" }}>{img ? "تغيير الصورة" : "إرفاق صورة"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} style={{ display: "none" }} /></label>
            {img ? <button type="button" className="chip" onClick={() => setImg(null)}>إزالة</button> : null}
          </div></div>
        {initial && initial.demo && (
          <label className="kck"><input type="checkbox" checked={real} onChange={(e) => setReal(e.target.checked)} />
            <span>أؤكد أن هذا تقييم <b>حقيقي</b> من زبون فعلي (يلزم لنشره للزوار)</span></label>
        )}
        {er && <small className="er" role="alert">{er}</small>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="pri gold big" style={{ flex: 1 }} disabled={busy}>{busy ? "..." : "حفظ"}</button>
          <button type="button" className="chip" onClick={onClose} disabled={busy}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Reviews() {
  const { lock } = useAdmin();
  const [toast, notify] = useToast();
  const mounted = useRef(true);
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null);   // null | {} (جديد) | review
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api("/admin/reviews").then((d) => { if (mounted.current) setList(Array.isArray(d.reviews) ? d.reviews : []); })
    .catch((e) => { if (!mounted.current) return; if (e instanceof AuthError) lock(); else notify("تعذّر تحميل التقييمات."); });
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; /* eslint-disable-next-line */ }, []);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); await load(); if (mounted.current && okMsg) notify(okMsg); return true; }
    catch (x) { if (x instanceof AuthError) lock(); else notify(errText(x)); return false; }
    finally { if (mounted.current) setBusy(false); }
  };

  const save = async (b) => {
    const ok = await run(() => (form.id
      ? api(`/admin/reviews/${form.id}`, { method: "PATCH", body: JSON.stringify({ ...b, ...(b.real ? { published: true } : {}) }) })
      : api("/admin/reviews", { method: "POST", body: JSON.stringify(b) })), "تم الحفظ");
    if (ok && mounted.current) setForm(null);
  };
  const togglePub = (r, on) => {
    if (r.demo) { notify("هذا مثال تجريبي. عدّله وأكّد أنه تقييم حقيقي لتنشره."); return; }
    run(() => api(`/admin/reviews/${r.id}`, { method: "PATCH", body: JSON.stringify({ published: on }) }), on ? "نُشر في المتجر" : "أُخفي عن الزوار");
  };
  const move = (r, dir) => run(() => api("/admin/reviews/move", { method: "POST", body: JSON.stringify({ id: r.id, dir }) }));
  const remove = async () => { const ok = await run(() => api(`/admin/reviews/${del.id}`, { method: "DELETE" }), "تم الحذف"); if (ok && mounted.current) setDel(null); };

  const pubCount = (list || []).filter((r) => r.published && !r.demo).length;

  return (
    <Layout hideSearch toast={toast} need="reviews">
      <style>{KIT_CSS}{CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>آراء الزبائن</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />آراء الزبائن</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>تظهر في الصفحة الرئيسية للمتجر عند وجود تقييم منشور واحد على الأقل ({pubCount} منشور حالياً).</div>
        </div>
        <button className="kadd" onClick={() => setForm({})}><Icon name="plus" size={18} />إضافة تقييم</button>
      </div>

      <div className="knote" style={{ marginBottom: 14 }}>
        الأمثلة التجريبية (شارة «مثال») للتجربة فقط وتبقى مخفية عن الزوار. عرض آراء مختلقة على أنها حقيقية <b>يضلّل الزبائن</b> ويخالف قواعد فيسبوك وتيك توك. عندما تصلك آراء حقيقية: أضفها أو حوّل المثال إلى تقييم حقيقي بتعديله وتأكيد ذلك.
      </div>

      {!list ? <div className="knote">جارٍ التحميل...</div> : !list.length ? <div className="knote">لا توجد تقييمات بعد. اضغط «إضافة تقييم».</div> : (
        <div className="rvl">
          {list.map((r, i) => (
            <article className="rvi" key={r.id}>
              <div className="rvh">
                <b>{r.name}</b>{r.city ? <span className="muted"> · {r.city}</span> : null}
                {r.demo ? <span className="kbd gold">مثال للتجربة — لا يظهر للزوار</span> : r.published ? <span className="kbd ok">منشور</span> : <span className="kbd off">مخفي</span>}
                <span className="rvs" aria-label={`${r.rating}/5`}>{stars(r.rating)}</span>
              </div>
              <p>{r.text}</p>
              {r.image ? <img src={r.image} alt="" loading="lazy" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} /> : null}
              <div className="rvb">
                <label className="rvt"><Toggle on={!!r.published && !r.demo} onChange={(v) => togglePub(r, v)} label="نشر" disabled={busy} /><span>نشر</span></label>
                <span style={{ flex: 1 }} />
                <button className="kab s" aria-label="أعلى" disabled={busy || i === 0} onClick={() => move(r, "up")}><Icon name="chev" size={16} /></button>
                <button className="kab s" aria-label="أسفل" disabled={busy || i === list.length - 1} onClick={() => move(r, "down")} style={{ transform: "rotate(180deg)" }}><Icon name="chev" size={16} /></button>
                <button className="kab e" aria-label="تعديل" disabled={busy} onClick={() => setForm(r)}><Icon name="edit" size={16} /></button>
                <button className="kab d" aria-label="حذف" disabled={busy} onClick={() => setDel(r)}><Icon name="trash" size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {form && <Form initial={form.id ? form : null} busy={busy} onClose={() => setForm(null)} onSave={save} />}
      {del && <Confirm title="حذف التقييم؟" text={`سيُحذف تقييم «${del.name}» نهائياً.`} busy={busy} onYes={remove} onNo={() => setDel(null)} />}
    </Layout>
  );
}

const CSS = `
.rvl{display:grid;gap:12px}
.rvi{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;box-shadow:var(--shadow)}
.rvh{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.rvs{margin-inline-start:auto;color:#C9A227;letter-spacing:2px;direction:ltr}
.rvi p{margin:8px 0 12px;line-height:1.8}
.rvb{display:flex;gap:8px;align-items:center}
.rvt{display:flex;gap:8px;align-items:center;font-weight:600;font-size:14px}
`;
