/* =========================================================
   StoreProducts.jsx  ←  src/Orderspart/StoreProducts.jsx
   «المنتجات» في لوحة الإدارة: جدول بكل منتجات المتجر (Supabase) مصنّفة حسب الفئة،
   مع تحديد عناصر، إضافة منتج كامل (شرح + عدة صور)، تعديل، حذف، وتعديل السعر للمحدد.
   تتطلب تسجيل الدخول بحساب المتجر (المالك) من /login.
   ========================================================= */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage } from "../compressImage";
import Layout from "./Layout";

const BUCKET = "product-images";
const MAX_IMAGES = 6;
const CATS = [
  { key: "watches", label: "ساعات", brands: ["rolex", "patek", "omega", "ap", "cartier", "tissot", "boss"] },
  { key: "glasses", label: "نظارات", brands: ["cartier", "louisvuiton", "maybach", "balmain", "bottega", "gazal", "lorobiana", "brunello", "zenga", "carira"] },
  { key: "caps", label: "قبعات", brands: ["burberry", "hermes", "prada"] },
  { key: "bags", label: "حقائب", brands: ["louisvuiton"] },
];
const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.key, c.label]));
CAT_LABEL.hats = "قبعات"; CAT_LABEL.wallets = "محافظ";

const toPath = (u) => decodeURIComponent((String(u).split(`/${BUCKET}/`)[1] || "").split("?")[0]);
const priceNum = (v) => Number(String(v == null ? "" : v).replace(/[^\d]/g, "")) || 0;
const clean = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "") || "item";
const folder = (s) => String(s || "misc").replace(/[^a-zA-Z0-9_-]/g, "_") || "misc";
const PRESET_COLORS = [["أسود", "#111111"], ["ذهبي", "#D4AF37"], ["فضي", "#C0C0C0"], ["أبيض", "#FFFFFF"], ["أزرق", "#1F4E8C"], ["أخضر", "#1E7B4F"], ["بني", "#6B4226"], ["أحمر", "#B3261E"], ["وردي", "#E58BB0"], ["رمادي", "#7A7F87"]];
const fixColors = (v) => (Array.isArray(v) ? v : []).filter((c) => c && typeof c.name === "string" && /^#[0-9a-fA-F]{6}$/.test(c.hex || "")).map((c) => ({ name: c.name.slice(0, 24), hex: c.hex }));
const fmt = (n) => Number(n || 0).toLocaleString("en-US");

const CSS = `
.sp{max-width:1100px;margin:0 auto;padding:4px 0 60px;direction:rtl;color:var(--ink)}
.sp-tabs{display:flex;gap:8px;margin:0 0 14px;flex-wrap:wrap}
.sp-tabs a{padding:9px 16px;border-radius:999px;border:1px solid var(--line);text-decoration:none;color:inherit;font-weight:bold;font-size:14px}
.sp-tabs a.on{background:var(--gold);color:#111;border-color:var(--gold)}
.sp-top{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center}
.sp-top input,.sp select,.sp-f input,.sp-f select,.sp-f textarea{padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--soft);color:var(--ink);font:inherit;box-sizing:border-box}
.sp-top input{flex:1;min-width:170px}
.sp-btn{padding:11px 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:bold;cursor:pointer}
.sp-btn.pri{background:var(--gold);color:#111;border-color:var(--gold)}
.sp-btn.red{background:#c0392b;color:#fff;border-color:#c0392b}
.sp-btn:disabled{opacity:.5;cursor:default}
.sp-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.sp-chip{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}
.sp-chip.on{background:var(--gold);color:#111;border-color:var(--gold);font-weight:bold}
.sp-note{padding:12px 14px;border-radius:12px;background:var(--sel);border:1px solid var(--gold);margin-bottom:12px;line-height:1.7;font-size:14px}
.sp-note.bad{border-color:#c0392b}
.sp-bulk{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;border-radius:14px;background:var(--sel);border:1px solid var(--gold);margin-bottom:12px}
.sp-bulk input{width:120px;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit}
.sp-colors{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--soft);display:grid;gap:10px}
.sp-cl,.sp-cp{display:flex;gap:8px;flex-wrap:wrap}
.sp-cc,.sp-pc{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13px}
.sp-pc{cursor:pointer}.sp-pc:hover{border-color:var(--gold)}
.sp-cc i,.sp-pc i{width:16px;height:16px;border-radius:50%;border:1px solid rgba(128,128,128,.5);display:inline-block}
.sp-cc button{border:0;background:none;color:inherit;cursor:pointer;font-size:16px;line-height:1;padding:0}
.sp-hint{font-size:13px;opacity:.7}
.sp-ca{display:flex;gap:8px;align-items:center}
.sp-ca input[type=color]{width:44px;height:42px;padding:2px;flex:none;cursor:pointer}
.sp-ca input:not([type=color]){flex:1;min-width:0}
.sp-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.sp-t{width:100%;border-collapse:collapse;min-width:720px}
.sp-t th{background:var(--soft);padding:12px 10px;text-align:right;font-size:13px;color:var(--mut);white-space:nowrap;position:sticky;top:0}
.sp-t td{padding:10px;border-top:1px solid var(--line);vertical-align:middle;font-size:14px}
.sp-t tr.sel td{background:var(--sel)}
.sp-t img{width:56px;height:56px;border-radius:10px;object-fit:cover;background:var(--soft);display:block}
.sp-t .nm{font-weight:bold;max-width:280px;word-break:break-word}
.sp-t .zero{color:#c0392b;font-weight:bold}
.sp-t input[type=checkbox]{width:18px;height:18px;cursor:pointer}
.sp-ic{padding:7px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;font:inherit;margin-inline-start:6px}
.sp-ic.d{color:#c0392b;border-color:#c0392b}
.sp-ov{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;padding:20px 12px;overflow:auto}
.sp-modal{background:var(--card);color:var(--ink);border-radius:20px;max-width:640px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);direction:rtl}
.sp-modal h2{margin:0 0 14px;font-size:21px}
.sp-f{display:flex;flex-direction:column;gap:6px}
.sp-f label{font-size:13px;color:var(--mut);margin-top:8px;font-weight:bold}
.sp-f textarea{min-height:130px;resize:vertical}
.sp-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sp-imgs{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0}
.sp-im{position:relative;width:92px;height:92px;border-radius:12px;overflow:hidden;border:2px solid var(--line)}
.sp-im.main{border-color:var(--gold)}
.sp-im img{width:100%;height:100%;object-fit:cover;display:block}
.sp-im button{position:absolute;border:0;cursor:pointer;font:inherit}
.sp-im .x{top:4px;left:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff}
.sp-im .m{bottom:0;left:0;right:0;padding:3px;background:rgba(0,0,0,.65);color:#fff;font-size:11px}
.sp-im .b{bottom:0;left:0;right:0;padding:3px;background:var(--gold);color:#111;font-size:11px;text-align:center;font-weight:bold}
.sp-acts{display:flex;gap:10px;margin-top:16px;justify-content:flex-start}
.sp-msg{margin-top:8px;font-weight:bold}
`;

function ProductModal({ initial, onClose, onSaved }) {
  const edit = !!initial;
  const [name, setName] = useState(initial ? initial.name || "" : "");
  const [bio, setBio] = useState(initial ? initial.bio || "" : "");
  const [price, setPrice] = useState(initial ? String(priceNum(initial.price) || "") : "28000");
  const [category, setCategory] = useState(initial ? initial.category || "watches" : "watches");
  const [brand, setBrand] = useState(initial ? initial.brand || "" : CATS[0].brands[0]);
  const [items, setItems] = useState(() => (initial ? (initial.images || []).filter(Boolean).map((url, i) => ({ id: `old-${i}`, url })) : []));
  const [colors, setColors] = useState(() => fixColors(initial && initial.colors));
  const [cName, setCName] = useState("");
  const [cHex, setCHex] = useState("#D4AF37");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const addColor = (n, h) => {
    const name = (n || cName).trim().slice(0, 24); const hex = h || cHex;
    if (!name) return setErr("اكتب اسم اللون أولاً.");
    if (colors.length >= 12 || colors.some((c) => c.name === name)) return;
    setErr(""); setColors([...colors, { name, hex }]); setCName("");
  };

  const brands = (CATS.find((c) => c.key === category) || { brands: [] }).brands;

  useEffect(() => () => items.forEach((it) => it.file && URL.revokeObjectURL(it.url)), []); // eslint-disable-line

  const pick = (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    const room = MAX_IMAGES - items.length;
    if (files.length > room) setErr(`الحد الأقصى ${MAX_IMAGES} صور.`);
    setItems([...items, ...files.slice(0, Math.max(room, 0)).map((f, i) => ({ id: `n-${Date.now()}-${i}`, file: f, url: URL.createObjectURL(f) }))]);
  };
  const drop = (i) => { if (items[i].file) URL.revokeObjectURL(items[i].url); setItems(items.filter((_, k) => k !== i)); };
  const main = (i) => setItems([items[i], ...items.filter((_, k) => k !== i)]);

  async function save() {
    setErr("");
    const p = Math.round(Number(price));
    if (name.trim().length < 2) return setErr("اكتب اسم المنتج.");
    if (!(p > 0)) return setErr("اكتب سعراً أكبر من 0.");
    if (items.length === 0) return setErr("أضف صورة واحدة على الأقل.");
    const b = (brand || category).trim().toLowerCase();
    setBusy(true);
    const uploaded = [];
    let colorWarn = false;
    try {
      const urls = [];
      for (const [i, it] of items.entries()) {
        if (!it.file) { urls.push(it.url); continue; }
        const file = await compressImage(it.file);
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${folder(b)}/${Date.now()}-${i}.${ext}`;
        const { error: ue } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
        if (ue) throw ue;
        uploaded.push(path);
        urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      }
      if (edit) {
        const base = { name: name.trim(), bio: bio.trim(), price: p, category, brand: b, images: urls };
        let { data, error } = await supabase.from("watches").update({ ...base, colors }).eq("id", initial.id).select();
        if (error && /colors/i.test(error.message || "")) { if (colors.length) colorWarn = true; ({ data, error } = await supabase.from("watches").update(base).eq("id", initial.id).select()); }
        if (error) throw error;
        if (!data || !data.length) throw new Error("لم يُحفظ شيء: الصلاحية مرفوضة. سجّل الدخول بحساب المالك من /login.");
        const keep = new Set(urls);
        const gone = (initial.images || []).filter((u) => !keep.has(u)).map(toPath).filter(Boolean);
        if (gone.length) await supabase.storage.from(BUCKET).remove(gone);
      } else {
        const slug = `${clean(b)}-${clean(name)}-${Date.now()}`.slice(0, 110);
        const base = { slug, name: name.trim(), bio: bio.trim(), price: p, images: urls, category, brand: b };
        let { data, error } = await supabase.from("watches").insert({ ...base, colors }).select();
        if (error && /colors/i.test(error.message || "")) { if (colors.length) colorWarn = true; ({ data, error } = await supabase.from("watches").insert(base).select()); }
        if (error) throw error;
        if (!data || !data.length) throw new Error("لم يُضف شيء: الصلاحية مرفوضة. سجّل الدخول بحساب المالك من /login.");
      }
      onSaved((edit ? "تم حفظ التعديل ✓" : "تمت إضافة المنتج ✓") + (colorWarn ? " — لكن الألوان لم تُحفظ: شغّل أمر SQL الخاص بعمود الألوان في Supabase ثم أعد الحفظ." : ""));
    } catch (e) {
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      setErr("فشل الحفظ: " + (e.message || e));
      setBusy(false);
    }
  }

  return (
    <div className="sp-ov" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="sp-modal sp-f">
        <h2>{edit ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>

        <label>اسم المنتج *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="مثال: ROLEX SUBMARINER" />

        <label>الشرح الكامل (الوصف والمواصفات)</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={3000} placeholder={"اكتب هنا وصف المنتج، الجودة، اللون، المقاس، الضمان...\nيمكنك الكتابة في أسطر متعددة."} />

        <div className="sp-row2">
          <div className="sp-f"><label>السعر (دج) *</label><input value={price} inputMode="numeric" onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} /></div>
          <div className="sp-f"><label>الفئة *</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); const c = CATS.find((x) => x.key === e.target.value); setBrand((c && c.brands[0]) || e.target.value); }}>
              {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              {!CATS.some((c) => c.key === category) ? <option value={category}>{CAT_LABEL[category] || category}</option> : null}
            </select>
          </div>
        </div>

        <label>العلامة / القسم (يحدد الصفحة التي يظهر فيها المنتج)</label>
        <input list="sp-brands" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="rolex" dir="ltr" />
        <datalist id="sp-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>

        <label>ألوان المنتج (اختياري) — يختار منها الزبون عند الطلب</label>
        <div className="sp-colors">
          <div className="sp-cl">
            {colors.map((c, i) => (
              <span key={c.name} className="sp-cc"><i style={{ background: c.hex }} />{c.name}<button type="button" aria-label={"حذف " + c.name} onClick={() => setColors(colors.filter((_, k) => k !== i))}>×</button></span>
            ))}
            {colors.length === 0 ? <span className="sp-hint">لا توجد ألوان — سيطلب الزبون المنتج كما هو.</span> : null}
          </div>
          <div className="sp-cp">
            {PRESET_COLORS.filter(([n]) => !colors.some((c) => c.name === n)).map(([n, h]) => <button type="button" key={n} className="sp-pc" title={n} onClick={() => addColor(n, h)}><i style={{ background: h }} />{n}</button>)}
          </div>
          <div className="sp-ca">
            <input type="color" value={cHex} onChange={(e) => setCHex(e.target.value)} aria-label="اختر لوناً" />
            <input value={cName} onChange={(e) => setCName(e.target.value)} maxLength={24} placeholder="اسم لون مخصص (مثال: كحلي)" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} />
            <button type="button" className="sp-btn" onClick={() => addColor()}>+ إضافة</button>
          </div>
        </div>

        <label>الصور (حتى {MAX_IMAGES}) — الأولى هي الرئيسية</label>
        <div className="sp-imgs">
          {items.map((it, i) => (
            <div key={it.id} className={`sp-im ${i === 0 ? "main" : ""}`}>
              <img src={it.url} alt="" />
              <button type="button" className="x" aria-label="حذف الصورة" onClick={() => drop(i)}>×</button>
              {i === 0 ? <span className="b" style={{ position: "absolute" }}>رئيسية</span> : <button type="button" className="m" onClick={() => main(i)}>اجعلها رئيسية</button>}
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple disabled={busy || items.length >= MAX_IMAGES} onChange={pick} />

        {err ? <div className="sp-note bad" role="alert" style={{ marginTop: 10 }}>{err}</div> : null}
        <div className="sp-acts">
          <button type="button" className="sp-btn pri" onClick={save} disabled={busy}>{busy ? "جارٍ الحفظ..." : edit ? "💾 حفظ التعديل" : "➕ إضافة المنتج"}</button>
          <button type="button" className="sp-btn" onClick={onClose} disabled={busy}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function StoreProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [noPrice, setNoPrice] = useState(false);
  const [who, setWho] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [bulk, setBulk] = useState("28000");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState(null); // null | {} (add) | row (edit)
  const [shown, setShown] = useState(50);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("watches").select("id,slug,name,price,images,bio,category,brand").order("id", { ascending: false });
    if (error) setErr("تعذّر تحميل المنتجات: " + error.message); else { setErr(""); setRows(data || []); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setWho((data && data.user && data.user.email) || "")).catch(() => setWho("")); }, []);

  const counts = useMemo(() => { const c = { all: rows.length }; rows.forEach((r) => { c[r.category] = (c[r.category] || 0) + 1; }); return c; }, [rows]);
  const catKeys = useMemo(() => [...CATS.map((c) => c.key), ...Object.keys(counts).filter((k) => k !== "all" && !CATS.some((c) => c.key === k))], [counts]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => (cat === "all" || r.category === cat) && (!noPrice || priceNum(r.price) <= 0) && (!s || (r.name || "").toLowerCase().includes(s) || (r.brand || "").toLowerCase().includes(s)));
  }, [rows, q, cat, noPrice]);
  const zero = useMemo(() => rows.filter((r) => priceNum(r.price) <= 0).length, [rows]);
  const visible = list.slice(0, shown);
  const allOn = visible.length > 0 && visible.every((r) => sel.has(r.id));
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSel((s) => { const n = new Set(s); if (allOn) visible.forEach((r) => n.delete(r.id)); else visible.forEach((r) => n.add(r.id)); return n; });
  const picked = rows.filter((r) => sel.has(r.id));

  const backup = (arr) => {
    const blob = new Blob([JSON.stringify(arr.map((r) => ({ id: r.id, slug: r.slug, name: r.name, price: r.price, category: r.category, brand: r.brand, bio: r.bio, images: r.images })), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `products-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  async function applyPrice() {
    const v = Math.round(Number(bulk));
    const target = picked.length ? picked : list;
    if (!(v > 0) || v > 10000000) return setMsg("اكتب سعراً صحيحاً.");
    if (!target.length) return setMsg("لا توجد منتجات.");
    if (!window.confirm(`سيصبح سعر ${target.length} منتج ${fmt(v)} دج.\nستُحفظ نسخة احتياطية على جهازك أولاً.\nمتابعة؟`)) return;
    setBusy(true); setMsg("");
    try {
      backup(target);
      const { data, error } = await supabase.from("watches").update({ price: v }).in("id", target.map((r) => r.id)).select("id");
      if (error) throw error;
      if (!data || !data.length) throw new Error("الصلاحية مرفوضة. سجّل الدخول بحساب المالك من /login.");
      setMsg(`تم: سعر ${data.length} منتج صار ${fmt(v)} دج ✓`);
      await load();
    } catch (e) { setMsg("فشل: " + (e.message || e)); }
    setBusy(false);
  }

  async function removeRows(target) {
    if (!target.length) return;
    if (!window.confirm(`حذف ${target.length} منتج نهائياً مع صورها؟ لا يمكن التراجع.\n(ستُحفظ نسخة احتياطية على جهازك أولاً)`)) return;
    setBusy(true); setMsg("");
    try {
      backup(target);
      const { data, error } = await supabase.from("watches").delete().in("id", target.map((r) => r.id)).select("id");
      if (error) throw error;
      if (!data || !data.length) throw new Error("الصلاحية مرفوضة. سجّل الدخول بحساب المالك من /login.");
      const gone = new Set(data.map((d) => d.id));
      const paths = target.filter((r) => gone.has(r.id)).flatMap((r) => (r.images || []).map(toPath)).filter(Boolean);
      if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
      setSel(new Set());
      setMsg(`تم حذف ${data.length} منتج ✓`);
      await load();
    } catch (e) { setMsg("فشل الحذف: " + (e.message || e)); }
    setBusy(false);
  }

  return (
    <Layout hideSearch>
      <style>{CSS}</style>
      <div className="sp">
        <div className="sp-tabs">
          <Link to="/admin/products" className="on">منتجات المتجر</Link>
          <Link to="/admin/products/list">المخزون والقائمة الداخلية</Link>
        </div>

        {who === "" ? <div className="sp-note">لإضافة المنتجات أو تعديلها أو حذفها سجّل الدخول بحساب المتجر (المالك) من <Link to="/login" style={{ color: "inherit", fontWeight: "bold" }}>صفحة تسجيل الدخول</Link> ثم ارجع هنا.</div> : null}

        <div className="sp-top">
          <input placeholder="ابحث بالاسم أو العلامة..." value={q} onChange={(e) => { setQ(e.target.value); setShown(50); }} />
          <button type="button" className="sp-btn pri" onClick={() => setModal({})}>+ إضافة منتج</button>
        </div>

        <div className="sp-chips">
          <button type="button" className={`sp-chip ${cat === "all" ? "on" : ""}`} onClick={() => { setCat("all"); setShown(50); }}>الكل ({counts.all || 0})</button>
          {catKeys.map((k) => <button type="button" key={k} className={`sp-chip ${cat === k ? "on" : ""}`} onClick={() => { setCat(k); setShown(50); }}>{CAT_LABEL[k] || k} ({counts[k] || 0})</button>)}
          {zero > 0 ? <button type="button" className={`sp-chip ${noPrice ? "on" : ""}`} onClick={() => setNoPrice(!noPrice)}>⚠️ بدون سعر ({zero})</button> : null}
        </div>

        <div className="sp-bulk">
          <b>{picked.length ? `المحدد: ${picked.length}` : `بدون تحديد: يطبَّق على المعروض (${list.length})`}</b>
          <input value={bulk} onChange={(e) => setBulk(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" aria-label="السعر" />
          <button type="button" className="sp-btn" disabled={busy || loading || !list.length} onClick={applyPrice}>تعديل السعر</button>
          <button type="button" className="sp-btn red" disabled={busy || !picked.length} onClick={() => removeRows(picked)}>حذف المحدد</button>
          {picked.length ? <button type="button" className="sp-btn" onClick={() => setSel(new Set())}>إلغاء التحديد</button> : null}
          {msg ? <div className="sp-msg" style={{ flexBasis: "100%" }}>{msg}</div> : null}
        </div>

        {err ? <div className="sp-note bad">{err}</div> : null}
        {loading ? <p>جارٍ التحميل...</p> : <p style={{ color: "var(--mut)", fontSize: 14, margin: "0 0 8px" }}>{list.length} منتج</p>}

        <div className="sp-wrap">
          <table className="sp-t">
            <thead><tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="تحديد الكل" /></th>
              <th>الصورة</th><th>الاسم</th><th>الفئة</th><th>العلامة</th><th>السعر</th><th>إجراءات</th>
            </tr></thead>
            <tbody>
              {visible.map((w) => (
                <tr key={w.id} className={sel.has(w.id) ? "sel" : ""}>
                  <td><input type="checkbox" checked={sel.has(w.id)} onChange={() => toggle(w.id)} aria-label="تحديد" /></td>
                  <td><img src={(w.images || [])[0] || ""} alt="" loading="lazy" decoding="async" /></td>
                  <td className="nm">{w.name}</td>
                  <td>{CAT_LABEL[w.category] || w.category || "-"}</td>
                  <td dir="ltr" style={{ textAlign: "right" }}>{w.brand || "-"}</td>
                  <td className={priceNum(w.price) > 0 ? "" : "zero"}>{priceNum(w.price) > 0 ? `${fmt(priceNum(w.price))} دج` : "بدون سعر ⚠️"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button type="button" className="sp-ic" onClick={() => setModal(w)}>✏️ تعديل</button>
                    <button type="button" className="sp-ic d" disabled={busy} onClick={() => removeRows([w])} aria-label="حذف">🗑</button>
                  </td>
                </tr>
              ))}
              {!loading && !visible.length ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "var(--mut)" }}>لا توجد منتجات في هذا التصنيف.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {list.length > shown ? <div style={{ textAlign: "center", marginTop: 12 }}><button type="button" className="sp-btn" onClick={() => setShown(shown + 50)}>عرض المزيد</button></div> : null}
      </div>

      {modal ? <ProductModal key={modal.id || "new"} initial={modal.id ? modal : null} onClose={() => setModal(null)} onSaved={(m) => { setModal(null); setMsg(m); load(); }} /> : null}
    </Layout>
  );
}
