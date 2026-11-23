import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { USE_SAMPLE } from "./config";
import { useAdmin } from "./context";
import Layout from "./Layout";

/* =========================================================
   Products.jsx  ←  ضعه في: src/admin/Products.jsx
   صفحة إدارة المنتجات  —  المسار: /admin/products
   ========================================================= */
const PER_PAGE = 8;         // عدد المنتجات في كل صفحة
const MAX_IMAGES = 5;

const CATS = [
  { key: "ساعات", icon: "watch" },
  { key: "نظارات", icon: "glasses" },
  { key: "قبعات", icon: "hat" },
  { key: "محافظ", icon: "wallet" },
];
const CAT_ICON = Object.fromEntries(CATS.map((c) => [c.key, c.icon]));

const SAMPLE = [
  { id: "1", sku: "ISD-WT001", name: "ساعة كلاسيكية فضية", desc: "تصميم فاخر وجودة عالية", cat: "ساعات", price: 12500, old: 15000, stock: 14, images: [] },
  { id: "2", sku: "ISD-GL002", name: "نظارات شمسية سوداء", desc: "حماية وأناقة في آن واحد", cat: "نظارات", price: 8900, old: 0, stock: 8, images: [] },
  { id: "3", sku: "ISD-HT003", name: "قبعة سوداء", desc: "ستايل عصري ومريح", cat: "قبعات", price: 3500, old: 0, stock: 0, images: [] },
  { id: "4", sku: "ISD-WL004", name: "محفظة جلدية بنية", desc: "جلد طبيعي بتصميم أنيق", cat: "محافظ", price: 5000, old: 6000, stock: 22, images: [] },
];

/* =========================================================
   أيقونات
   ========================================================= */
const PICONS = {
  watch: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z", "M9 7l.5-4h5L15 7", "M9 17l.5 4h5l.5-4", "M12 10v2l1.5 1"],
  glasses: ["M6 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M9 14h6", "M3 14l1-5", "M21 14l-1-5"],
  hat: ["M5 15a7 7 0 0 1 14 0", "M2 17c4 1.5 16 1.5 20 0", "M5 15h14"],
  wallet: ["M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", "M4 7l11-3v3", "M16 13h4v3h-4z"],
  box: ["M21 8l-9-5-9 5v8l9 5 9-5z", "M3 8l9 5 9-5", "M12 13v8"],
  ok: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M8 12l3 3 5-6"],
  alert: ["M12 3l10 18H2z", "M12 10v5", "M12 18h.01"],
  grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  search: ["M21 21l-4.3-4.3", "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"],
  plus: ["M12 5v14", "M5 12h14"],
  dl: ["M12 3v12", "M7 10l5 5 5-5", "M4 20h16"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  edit: ["M4 20h4L19 9l-4-4L4 16z", "M14 6l4 4"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  x: ["M6 6l12 12", "M18 6L6 18"],
  photo: ["M4 5h16v14H4z", "M4 16l5-5 4 4 3-3 4 4", "M15 9h.01"],
  chev: ["M6 9l6 6 6-6"],
  right: ["M9 6l6 6-6 6"],
  left: ["M15 6l-6 6 6 6"],
  home: ["M3 11l9-8 9 8", "M5 10v10h14V10"],
};
const PIcon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(PICONS[name] || PICONS.box).map((p, i) => <path key={i} d={p} />)}
  </svg>
);

/* =========================================================
   دوال مساعدة
   ========================================================= */
const money = (n) => n.toLocaleString("en-US") + " دج";
const IMG_RE = /^\/api\/uploads\/[a-f0-9]{24}\.(jpg|png|webp)$/;
const normalize = (r) => ({
  id: String(r.id ?? ""),
  sku: String(r.sku ?? "").slice(0, 24),
  name: String(r.name ?? "").slice(0, 80),
  desc: String(r.desc ?? "").slice(0, 150),
  cat: CAT_ICON[r.cat] ? r.cat : CATS[0].key,
  price: Number(r.price) || 0,
  old: Number(r.old) || 0,
  stock: Math.max(0, Math.floor(Number(r.stock) || 0)),
  /* لا نقبل في الواجهة إلا روابط صور الخادم (أو صور تجريبية محلية) */
  images: Array.isArray(r.images)
    ? r.images.filter((u) => typeof u === "string" && (IMG_RE.test(u) || (USE_SAMPLE && u.startsWith("data:image/")))).slice(0, MAX_IMAGES)
    : [],
});

const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^\s*[=+\-@\t\r]/.test(s)) s = "'" + s; // يمنع حقن الصيغ في Excel
  return '"' + s.replace(/"/g, '""') + '"';
};

/* يصغّر الصورة في المتصفح (حد 900px) ويحوّلها JPEG خفيفة قبل الإرسال */
async function prepareImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("نوع الملف غير مدعوم. استعمل JPG أو PNG أو WEBP.");
  if (file.size > 10 * 1024 * 1024) throw new Error("الصورة كبيرة جداً (الحد 10 ميغابايت).");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("تعذّرت قراءة الصورة."));
      i.src = url;
    });
    const k = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * k));
    c.height = Math.max(1, Math.round(img.height * k));
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    for (const q of [0.82, 0.68, 0.5]) {
      const d = c.toDataURL("image/jpeg", q);
      if (d.length * 0.75 < 600 * 1024) return d;
    }
    throw new Error("الصورة ثقيلة، اختر صورة أصغر.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* =========================================================
   مكوّنات
   ========================================================= */
const Thumb = ({ p, size = 52 }) => (
  <span className="pth" style={{ width: size, height: size }}>
    {p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" /> : <PIcon name={CAT_ICON[p.cat]} size={size * 0.45} />}
  </span>
);

const StatusPill = ({ stock }) => (
  <span className={`pst ${stock > 0 ? "ok" : "out"}`}>
    <i />{stock > 0 ? "متوفر" : "نفد المخزون"}
  </span>
);

function Modal({ label, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ov" onClick={onClose}>
      <div className="md" style={wide ? { maxWidth: 600 } : undefined} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ProductForm({ initial, busy, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: initial ? initial.name : "", desc: initial ? initial.desc : "", cat: initial ? initial.cat : CATS[0].key,
    price: initial ? String(initial.price) : "", old: initial && initial.old ? String(initial.old) : "",
    stock: initial ? String(initial.stock) : "",
  }));
  const [imgs, setImgs] = useState(initial ? initial.images : []);
  const [err, setErr] = useState({});
  const [imgErr, setImgErr] = useState("");
  const [reading, setReading] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const addFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_IMAGES - imgs.length;
    setImgErr(""); setReading(true);
    const out = [];
    let bad = files.length > room ? `الحد الأقصى ${MAX_IMAGES} صور.` : "";
    for (const file of files.slice(0, room)) {
      try { out.push(await prepareImage(file)); } catch (x) { bad = x.message; }
    }
    setImgs((s) => [...s, ...out].slice(0, MAX_IMAGES));
    setImgErr(bad); setReading(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(), price = Number(f.price), old = f.old.trim() === "" ? 0 : Number(f.old), stock = Number(f.stock);
    const er = {};
    if (name.length < 2) er.name = "أدخل اسم المنتج";
    if (f.price.trim() === "" || !Number.isFinite(price) || price <= 0 || price > 10000000) er.price = "أدخل سعراً صحيحاً";
    if (f.old.trim() !== "" && (!Number.isFinite(old) || old <= price)) er.old = "يجب أن يكون أكبر من السعر الحالي";
    if (f.stock.trim() === "" || !Number.isInteger(stock) || stock < 0 || stock > 99999) er.stock = "أدخل عدداً صحيحاً";
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ name, desc: f.desc.trim().slice(0, 150), cat: f.cat, price: Math.round(price), old: Math.round(old), stock, images: imgs });
  };

  return (
    <Modal label={initial ? "تعديل المنتج" : "إضافة منتج جديد"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, flex: 1 }}>{initial ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
          <button type="button" className="ib" onClick={onClose} aria-label="إغلاق"><PIcon name="x" /></button>
        </div>

        <label className="fl"><span>اسم المنتج</span>
          <input className="inp" value={f.name} onChange={set("name")} maxLength={80} />
          {err.name && <small className="er" role="alert">{err.name}</small>}</label>
        <label className="fl"><span>وصف قصير (اختياري)</span>
          <input className="inp" value={f.desc} onChange={set("desc")} maxLength={150} /></label>
        <label className="fl"><span>التصنيف</span>
          <select className="inp" value={f.cat} onChange={set("cat")}>{CATS.map((c) => <option key={c.key}>{c.key}</option>)}</select></label>

        <div className="pfg">
          <label className="fl"><span>السعر (دج)</span>
            <input className="inp" dir="ltr" inputMode="numeric" value={f.price} onChange={set("price")} maxLength={9} />
            {err.price && <small className="er" role="alert">{err.price}</small>}</label>
          <label className="fl"><span>السعر قبل التخفيض</span>
            <input className="inp" dir="ltr" inputMode="numeric" value={f.old} onChange={set("old")} maxLength={9} placeholder="اختياري" />
            {err.old && <small className="er" role="alert">{err.old}</small>}</label>
          <label className="fl"><span>الكمية</span>
            <input className="inp" dir="ltr" inputMode="numeric" value={f.stock} onChange={set("stock")} maxLength={5} />
            {err.stock && <small className="er" role="alert">{err.stock}</small>}</label>
        </div>

        <div className="fl"><span>الصور <small className="muted" style={{ fontWeight: 400 }}>(حتى {MAX_IMAGES})</small></span>
          <div className="pimgs">
            {imgs.map((src, i) => (
              <div key={i} className="pimg">
                <img src={src} alt={`صورة ${i + 1}`} />
                <button type="button" aria-label="حذف الصورة" onClick={() => setImgs((s) => s.filter((_, k) => k !== i))}><PIcon name="x" size={12} /></button>
              </div>
            ))}
            {imgs.length < MAX_IMAGES && (
              <button type="button" className="padd-img" onClick={() => fileRef.current && fileRef.current.click()} disabled={reading}>
                <PIcon name="photo" size={22} />{reading ? "..." : "إضافة"}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addFiles} />
          {imgErr && <small className="er" role="alert">{imgErr}</small>}
        </div>

        <button type="submit" className="pri gold big" style={{ width: "100%", marginTop: 20 }} disabled={busy || reading}>
          {busy ? "جارٍ الحفظ..." : "حفظ المنتج"}
        </button>
      </form>
    </Modal>
  );
}

function ViewModal({ p, onClose, onEdit }) {
  const [i, setI] = useState(0);
  const disc = p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
  return (
    <Modal label="تفاصيل المنتج" onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, flex: 1 }}>{p.name}</h2>
        <button className="ib" onClick={onClose} aria-label="إغلاق"><PIcon name="x" /></button>
      </div>
      <div className="pview">
        {p.images.length ? <img src={p.images[Math.min(i, p.images.length - 1)]} alt={p.name} /> : <PIcon name={CAT_ICON[p.cat]} size={64} />}
      </div>
      {p.images.length > 1 && (
        <div className="pimgs" style={{ marginTop: 10 }}>
          {p.images.map((src, k) => (
            <button key={k} type="button" className={`pimg${k === i ? " cur" : ""}`} onClick={() => setI(k)} aria-label={`صورة ${k + 1}`}><img src={src} alt="" /></button>
          ))}
        </div>
      )}
      <div className="pkv"><span>الرمز</span><b dir="ltr">{p.sku}</b></div>
      <div className="pkv"><span>التصنيف</span><b>{p.cat}</b></div>
      <div className="pkv"><span>السعر</span><b>{money(p.price)}{disc > 0 && <small className="muted" style={{ textDecoration: "line-through", marginInlineStart: 8 }}>{money(p.old)}</small>}{disc > 0 && <small style={{ color: "#14633F", marginInlineStart: 8 }}>-{disc}%</small>}</b></div>
      <div className="pkv"><span>المخزون</span><b>{p.stock}</b></div>
      <div className="pkv"><span>الحالة</span><StatusPill stock={p.stock} /></div>
      {p.desc && <p className="muted" style={{ margin: "12px 0 0" }}>{p.desc}</p>}
      <button className="pri gold big" style={{ width: "100%", marginTop: 18 }} onClick={onEdit}>تعديل المنتج</button>
    </Modal>
  );
}

/* =========================================================
   الصفحة
   ========================================================= */
export default function Products() {
  const { lock: onLock } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // {type:'form'|'view'|'del', id?}
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [newOrders, setNewOrders] = useState(0);
  const mounted = useRef(true);
  const toastTimer = useRef(null);
  const sampleId = useRef(100);

  const notify = (t) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(async () => {
    if (USE_SAMPLE) { setProducts(SAMPLE.map(normalize)); setLoading(false); return; }
    try {
      const data = await api("/admin/products");
      if (!mounted.current) return;
      setProducts((Array.isArray(data && data.products) ? data.products : []).map(normalize).filter((p) => p.id));
      setLoadError("");
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { onLock(); return; }
      setLoadError(e instanceof HttpError ? `تعذّر تحميل المنتجات (الرمز ${e.status}).` : "تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [onLock]);

  useEffect(() => {
    mounted.current = true;
    load();
    if (!USE_SAMPLE) { // عدد الطلبيات الجديدة لشارة الجرس فقط
      api("/admin/orders").then((d) => {
        if (mounted.current && d && Array.isArray(d.orders)) setNewOrders(d.orders.filter((o) => o && o.status === "new").length);
      }).catch(() => {});
    }
    return () => { mounted.current = false; clearTimeout(toastTimer.current); };
  }, [load]);

  useEffect(() => { setPage(1); }, [cat, status, query]);

  const counts = useMemo(() => ({
    total: products.length,
    ok: products.filter((p) => p.stock > 0).length,
    out: products.filter((p) => p.stock === 0).length,
  }), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) =>
      (cat === "all" || p.cat === cat) &&
      (status === "all" || (status === "ok" ? p.stock > 0 : p.stock === 0)) &&
      (!q || (p.name + " " + p.sku + " " + p.desc).toLowerCase().includes(q)));
  }, [products, cat, status, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const target = modal && modal.id ? products.find((p) => p.id === modal.id) : null;

  const save = async (body, id) => {
    setSaving(true);
    try {
      if (USE_SAMPLE) {
        const rec = { ...body, id: id || String(sampleId.current++), sku: id ? products.find((p) => p.id === id).sku : "ISD-NEW" + sampleId.current };
        setProducts((s) => (id ? s.map((p) => (p.id === id ? rec : p)) : [...s, rec]));
      } else {
        await api(id ? `/admin/products/${encodeURIComponent(id)}` : "/admin/products", { method: id ? "PATCH" : "POST", body: JSON.stringify(body) });
        await load();
      }
      if (!mounted.current) return;
      setModal(null);
      notify(id ? "تم حفظ التعديل" : "أُضيف المنتج");
    } catch (e) {
      if (e instanceof AuthError) onLock();
      else notify(e instanceof HttpError && e.status === 413 ? "حجم الصور كبير جداً." : e instanceof HttpError && e.status === 400 ? "بيانات غير صالحة. راجع الحقول والصور." : "تعذّر الحفظ. تحقق من الخادم.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const remove = async (id) => {
    setSaving(true);
    try {
      if (USE_SAMPLE) setProducts((s) => s.filter((p) => p.id !== id));
      else { await api(`/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" }); await load(); }
      if (!mounted.current) return;
      setModal(null);
      notify("تم حذف المنتج");
    } catch (e) {
      if (e instanceof AuthError) onLock(); else notify("تعذّر الحذف. تحقق من الخادم.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const exportCSV = () => {
    const head = ["الرمز", "الاسم", "التصنيف", "السعر", "المخزون", "الحالة"];
    const data = filtered.map((p) => [p.sku, p.name, p.cat, p.price, p.stock, p.stock > 0 ? "متوفر" : "نفد المخزون"]);
    const csv = "﻿" + [head, ...data].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = "products.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const pageNums = useMemo(() => {
    const from = Math.max(1, Math.min(cur - 1, pages - 2)), to = Math.min(pages, from + 2);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [cur, pages]);

  return (
    <Layout
      newCount={newOrders} hideSearch toast={toast}
      overlays={(
        <>
          {modal && modal.type === "form" && (modal.id ? !!target : true) && (
            <ProductForm key={modal.id || "new"} initial={target} busy={saving} onClose={() => !saving && setModal(null)} onSave={(b) => save(b, modal.id)} />
          )}
          {modal && modal.type === "view" && target && (
            <ViewModal p={target} onClose={() => setModal(null)} onEdit={() => setModal({ type: "form", id: target.id })} />
          )}
          {modal && modal.type === "del" && target && (
            <Modal label="حذف المنتج" onClose={() => !saving && setModal(null)}>
              <h2 style={{ margin: 0, fontSize: 20 }}>حذف المنتج؟</h2>
              <p className="muted" style={{ margin: "10px 0 18px" }}>سيُحذف «{target.name}» مع صوره نهائياً، ولا يمكن التراجع.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="pri big" style={{ flex: 1, background: "#A32D2D", color: "#fff" }} disabled={saving} onClick={() => remove(target.id)}>{saving ? "جارٍ الحذف..." : "تأكيد الحذف"}</button>
                <button className="chip" disabled={saving} onClick={() => setModal(null)}>إلغاء</button>
              </div>
            </Modal>
          )}
        </>
      )}
    >
      <style>{PCSS}</style>
      <div className="crumb"><PIcon name="home" size={14} /><Link to="/admin" style={{ color: "inherit" }}>لوحة التحكم</Link><span>/</span><span>إدارة المنتجات</span></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Link to="/admin/products" style={{ padding: "9px 16px", borderRadius: 999, border: "1px solid rgba(128,128,128,.4)", textDecoration: "none", color: "inherit", fontWeight: "bold", fontSize: 14 }}>منتجات المتجر (تعديل وحذف)</Link>
        <Link to="/admin/products/list" style={{ padding: "9px 16px", borderRadius: 999, background: "#E3C677", color: "#111", textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>المخزون والقائمة الداخلية</Link>
      </div>

      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />إدارة المنتجات</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>إدارة وتنظيم جميع منتجات متجرك.</div>
        </div>
      </div>

      <section className="pcs">
        <div className="pc"><span className="pci" style={{ background: "#FFF1CC", color: "#B07A00" }}><PIcon name="box" size={24} /></span><span><span className="pcl">إجمالي المنتجات</span><b className="pcn">{counts.total}</b></span></div>
        <div className="pc"><span className="pci" style={{ background: "#DDF3E8", color: "#14633F" }}><PIcon name="ok" size={24} /></span><span><span className="pcl">المنتجات المتوفرة</span><b className="pcn">{counts.ok}</b></span></div>
        <button className={`pc${status === "out" ? " on" : ""}`} aria-pressed={status === "out"} onClick={() => setStatus(status === "out" ? "all" : "out")}>
          <span className="pci" style={{ background: "#FBE0DE", color: "#9B2C25" }}><PIcon name="alert" size={24} /></span><span><span className="pcl">نفدت الكمية</span><b className="pcn">{counts.out}</b></span></button>
        <div className="pc"><span className="pci" style={{ background: "#DCEBFF", color: "#1D4A8A" }}><PIcon name="grid" size={24} /></span><span><span className="pcl">التصنيفات</span><b className="pcn">{CATS.length}</b></span></div>
      </section>

      <section className="ptb">
        <button className="padd" onClick={() => setModal({ type: "form" })}><PIcon name="plus" />إضافة منتج جديد</button>
        <label className="psr"><PIcon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} maxLength={60} aria-label="بحث" placeholder="ابحث عن اسم المنتج أو الرمز..." /></label>
        <select className="psl" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="التصنيف">
          <option value="all">كل التصنيفات</option>{CATS.map((c) => <option key={c.key}>{c.key}</option>)}
        </select>
        <select className="psl" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="الحالة">
          <option value="all">كل الحالات</option><option value="ok">متوفر</option><option value="out">نفد المخزون</option>
        </select>
        <button className="pex" onClick={exportCSV}><PIcon name="dl" />تصدير</button>
      </section>

      <section className="ptbl">
        <div className="prw hd">
          <span className="c-pr">المنتج</span><span className="c-sku">رمز المنتج</span><span className="c-cat">التصنيف</span>
          <span className="c-pri">السعر</span><span className="c-stk">المخزون</span><span className="c-st">الحالة</span><span className="c-ac">الإجراءات</span>
        </div>
        {loading && <div className="empty">جارٍ تحميل المنتجات...</div>}
        {!loading && loadError && (
          <div className="empty"><b>{loadError}</b>
            <div className="muted" style={{ margin: "6px 0 12px" }}>شغّل الخادم (node server.js) وتأكد من إعداد proxy في package.json.</div>
            <button className="pri" onClick={load}>إعادة المحاولة</button></div>
        )}
        {!loading && !loadError && rows.length === 0 && (
          <div className="empty"><b>{products.length ? "لا توجد منتجات مطابقة" : "لا توجد منتجات بعد"}</b>
            {!products.length && <div style={{ marginTop: 12 }}><button className="padd" style={{ margin: "0 auto" }} onClick={() => setModal({ type: "form" })}><PIcon name="plus" />أضف أول منتج</button></div>}</div>
        )}
        {rows.map((p) => (
          <div key={p.id} className="prw">
            <div className="c-pr pprod"><Thumb p={p} />
              <div style={{ minWidth: 0 }}><div className="pnm">{p.name}</div>{p.desc && <div className="muted pds">{p.desc}</div>}</div></div>
            <span className="c-sku muted" dir="ltr" style={{ textAlign: "right" }}>{p.sku}</span>
            <span className="c-cat pcat"><PIcon name={CAT_ICON[p.cat]} size={18} />{p.cat}</span>
            <div className="c-pri"><b>{p.price.toLocaleString("en-US")}</b> <span className="muted">دج</span>
              {p.old > p.price && <div className="muted" style={{ textDecoration: "line-through", fontSize: 12 }}>{p.old.toLocaleString("en-US")}</div>}</div>
            <b className="c-stk">{p.stock}</b>
            <div className="c-st"><StatusPill stock={p.stock} /></div>
            <div className="c-ac pact">
              <button className="pab v" onClick={() => setModal({ type: "view", id: p.id })} aria-label={`عرض ${p.name}`}><PIcon name="eye" size={17} /></button>
              <button className="pab e" onClick={() => setModal({ type: "form", id: p.id })} aria-label={`تعديل ${p.name}`}><PIcon name="edit" size={17} /></button>
              <button className="pab d" onClick={() => setModal({ type: "del", id: p.id })} aria-label={`حذف ${p.name}`}><PIcon name="trash" size={17} /></button>
            </div>
          </div>
        ))}
        {filtered.length > 0 && (
          <div className="ppg">
            <span className="muted">عرض {(cur - 1) * PER_PAGE + 1}-{Math.min(filtered.length, cur * PER_PAGE)} من {filtered.length}</span>
            {pages > 1 && (
              <span className="pnav">
                <button disabled={cur <= 1} onClick={() => setPage(1)} aria-label="الأولى">«</button>
                <button disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="السابقة"><PIcon name="right" size={14} /></button>
                {pageNums.map((n) => <button key={n} className={n === cur ? "on" : ""} aria-current={n === cur ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>)}
                <button disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="التالية"><PIcon name="left" size={14} /></button>
                <button disabled={cur >= pages} onClick={() => setPage(pages)} aria-label="الأخيرة">»</button>
              </span>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}

/* =========================================================
   التنسيق (يعتمد على متغيرات الألوان في admin-Orders.jsx)
   ========================================================= */
const PCSS = `
.pcs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pc{display:flex;align-items:center;gap:14px;width:100%;text-align:right;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);cursor:default}
button.pc{cursor:pointer}.pc.on{border-color:var(--gold)}
.pci{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;flex:none}
.pcl{display:block;font-size:13.5px;color:var(--mut);font-weight:600}
.pcn{display:block;font-size:30px;font-weight:800;line-height:1.15}
.ptb{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.psr{flex:1;min-width:200px;display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0 16px;min-height:46px;color:var(--mut)}
.psr input{border:0;outline:0;background:transparent;flex:1;min-width:0;font-size:14px}
.psl{min-height:46px;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:0 12px;font-size:14px;font-weight:600;cursor:pointer}
.padd,.pex{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;min-height:46px;padding:0 18px;font-weight:700;font-size:14px;cursor:pointer}
.adm .padd{background:var(--gold);color:#16181F}
.adm .pex{background:var(--navy);color:#fff}
.adm[data-theme=dark] .pex{background:#2A2F3D}
.ptbl{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden}
.prw{display:grid;grid-template-columns:minmax(0,2.3fr) 112px 120px 112px 76px 132px 124px;gap:12px;align-items:center;padding:12px 18px;border-top:1px solid var(--line2);font-size:14.5px}
.prw.hd{background:var(--soft);border-top:0;font-size:13px;font-weight:700;color:var(--mut);padding-top:13px;padding-bottom:13px}
.prw:not(.hd):hover{background:var(--hov)}
.pprod{display:flex;align-items:center;gap:12px;min-width:0}
.pth{border-radius:12px;background:var(--soft);display:grid;place-items:center;flex:none;overflow:hidden;color:var(--mut);border:1px solid var(--line2)}
.pth img{width:100%;height:100%;object-fit:cover}
.pnm{font-weight:700}.pds{font-size:12.5px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pcat{display:flex;align-items:center;gap:8px;color:var(--mut);font-weight:600}
.pst{display:inline-flex;align-items:center;gap:8px;border-radius:99px;padding:5px 14px;font-size:13px;font-weight:700;white-space:nowrap}
.pst i{width:9px;height:9px;border-radius:50%;display:inline-block}
.pst.ok{background:#DDF3E8;color:#14633F}.pst.ok i{background:#2DBE7E}
.pst.out{background:#FBE0DE;color:#9B2C25}.pst.out i{background:#E5534B}
.adm[data-theme=dark] .pst.ok{background:#173B2A;color:#7FD8A8}
.adm[data-theme=dark] .pst.out{background:#3D1F1D;color:#F09A94}
.pact{display:flex;gap:6px;justify-content:flex-start}
.pab{width:36px;height:36px;border-radius:10px;border:0;display:grid;place-items:center;cursor:pointer;padding:0}
.adm .pab.v{background:var(--navy);color:#fff}.adm .pab.e{background:var(--gold);color:#16181F}.adm .pab.d{background:#F9D4D0;color:#9B2C25}
.adm[data-theme=dark] .pab.v{background:#2A2F3D}
.pab:hover{filter:brightness(.94)}
.ppg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 18px;border-top:1px solid var(--line2);font-size:13.5px;flex-wrap:wrap}
.pnav{display:flex;gap:6px}
.pnav button{min-width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:var(--card);cursor:pointer;font-weight:700;display:grid;place-items:center}
.adm .pnav button.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.adm[data-theme=dark] .pnav button.on{background:var(--gold);color:#16181F;border-color:var(--gold)}
.pnav button:disabled{opacity:.4;cursor:not-allowed}
.pfg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.pimgs{display:flex;gap:10px;flex-wrap:wrap}
.pimg{width:84px;height:84px;border-radius:12px;position:relative;overflow:hidden;border:2px solid var(--line);padding:0;background:var(--soft)}
.pimg.cur{border-color:var(--gold)}
.pimg img{width:100%;height:100%;object-fit:cover;display:block}
.adm .pimg>button{position:absolute;top:4px;inset-inline-start:4px;width:22px;height:22px;border-radius:50%;border:0;background:rgba(22,24,31,.85);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.padd-img{width:84px;height:84px;border-radius:12px;border:1.5px dashed var(--mut);background:var(--card);color:var(--mut);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px}
.pview{height:240px;border-radius:14px;background:var(--soft);display:grid;place-items:center;margin-top:14px;overflow:hidden;color:var(--mut)}
.pview img{width:100%;height:100%;object-fit:contain}
.pkv{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line2)}.pkv>span{color:var(--mut)}
@media(max-width:1180px){
  .pcs{grid-template-columns:repeat(2,1fr)}
  .prw{grid-template-columns:minmax(0,2fr) 100px 100px 66px 124px 120px}
  .c-sku{display:none}
}
@media(max-width:860px){
  .prw.hd{display:none}
  .prw{grid-template-columns:1fr auto;grid-template-areas:"pr pr" "cat pri" "stk st" "ac ac";gap:8px 12px;margin:10px;border:1px solid var(--line2);border-radius:16px}
  .c-pr{grid-area:pr}.c-cat{grid-area:cat}.c-pri{grid-area:pri;text-align:left}.c-stk{grid-area:stk}.c-st{grid-area:st;justify-self:end}.c-ac{grid-area:ac}
  .c-stk::before{content:"المخزون: ";font-weight:400;color:var(--mut)}
  .pact{justify-content:flex-end}
  .pfg{grid-template-columns:1fr}
  .ptb .padd{width:100%}
}
`;
