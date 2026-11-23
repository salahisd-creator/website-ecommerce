import React, { useState } from 'react';
import { usePrefs } from './prefs';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { compressImage } from './compressImage';
 
export const cardStyles= `.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  direction: rtl;
}
.buy-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: var(--c-k);
  color: var(--c-g1);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter .2s, transform .15s;
}
.buy-btn:hover { filter: brightness(1.25); }
.buy-btn:active { transform: scale(.98); }
.fav-btn {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--c-k);
  border-radius: 16px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: transform .15s, background .15s, border-color .15s;
}
.fav-btn:hover { background: rgba(17,17,17,.06); }
.fav-btn:active { transform: scale(.88); }
.fav-btn.on { border-color: var(--c-g0); background: rgba(212,175,106,.18); }
.buy-btn:focus-visible,
.fav-btn:focus-visible { outline: 2px solid var(--c-g0); outline-offset: 2px; }

.edit-panel input:not([type="file"]),
.edit-panel textarea {
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--c-cream2);
  border-radius: 12px;
  background: var(--c-cream);
  color: var(--c-k);
  font-family: inherit;
  font-size: 14px;
}
.edit-panel input:focus,
.edit-panel textarea:focus { outline: 2px solid var(--c-g0); border-color: transparent; }
.edit-panel .ep-actions button {
  height: 40px;
  padding: 0 18px;
  margin-inline-end: 8px;
  border: none;
  border-radius: 12px;
  background: var(--c-k);
  color: var(--c-g1);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}
.edit-panel .ep-actions button:disabled { opacity: .6; cursor: default; }
.edit-panel .ep-actions button:last-of-type {
  background: transparent;
  color: var(--c-k);
  border: 1.5px solid var(--c-k);
}

/* ===== شبكة البطاقات: تعمل في كل الصفحات بدون الاعتماد على أسماء الأصناف ===== */
/* البطاقة = أي رابط يذهب إلى /order/... ، والحاوية = الأب الذي يضم البطاقات */
div:has(> div > a[href^="/order/"]) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 20px max(16px, calc((100% - 1100px) / 2)) 48px;
  direction: rtl;
  box-sizing: border-box;
}
@media (min-width: 768px) {
  div:has(> div > a[href^="/order/"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
}
@media (min-width: 1100px) {
  div:has(> div > a[href^="/order/"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
}
div:has(> a[href^="/order/"]) { min-width: 0; box-sizing: border-box; }
a[href^="/order/"] {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background: var(--st-card, var(--c-cream));
  border: 1px solid var(--st-line, var(--c-cream2));
  border-radius: 22px;
  overflow: hidden;
  color: var(--c-k);
  text-decoration: none;
  transition: box-shadow .2s ease, transform .2s ease;
}
a[href^="/order/"]:hover {
  box-shadow: 0 8px 24px rgba(17, 17, 17, .08);
  transform: translateY(-2px);
}
a[href^="/order/"] > img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background: var(--c-cream2);
}
a[href^="/order/"] > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;
  padding: 12px 12px 14px;
  direction: rtl;
  text-align: right;
}
a[href^="/order/"] > div > :is(h1, h2, h3, h4) {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-k);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
a[href^="/order/"] > div > p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b6b6b;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
a[href^="/order/"] .card-actions { margin-top: auto; padding-top: 8px; }
.card-price { margin-top: 10px; font-size: 19px; font-weight: 800; color: var(--c-g0); direction: rtl; text-align: right; letter-spacing: .2px; }
a[href^="/order/"] .card-price { margin-top: auto; padding-top: 6px; }
a[href^="/order/"] .card-price + .card-actions { margin-top: 8px; padding-top: 0; }

/* ===== زر الحذف (للمالك) ===== */
.owner-actions {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin-top: 10px;
  direction: rtl;
}
.del-btn {
  width: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1.5px solid #c0392b;
  border-radius: 16px;
  background: transparent;
  color: #c0392b;
  cursor: pointer;
  transition: background .15s, color .15s, transform .15s;
}
.del-btn:hover:not(:disabled) { background: #c0392b; color: #ffffff; }
.del-btn:active:not(:disabled) { transform: scale(.94); }
.del-btn:disabled { opacity: .6; cursor: default; }
.del-btn:focus-visible { outline: 2px solid #c0392b; outline-offset: 2px; }
.ep-thumbs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.ep-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border: 2px solid transparent;
  border-radius: 10px;
}
.ep-thumb.main { border-color: var(--c-g0); }
.ep-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block; }
.ep-x {
  position: absolute;
  top: -7px;
  left: -7px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #b3341f;
  color: #fff;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}
.ep-main {
  position: absolute;
  bottom: 2px;
  right: 2px;
  padding: 1px 5px;
  border: none;
  border-radius: 6px;
  background: rgba(0,0,0,.7);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
}
  
  `



export function CardActions({ id, favs, toggleFav, price }) {
  const { t, money } = usePrefs();
  const navigate = useNavigate();
  const on = favs.includes(id);

 return (
    <>
    {(Number(String(price).replace(/[^\d]/g, "")) || 0) > 0 ? <div className="card-price">{money(Number(String(price).replace(/[^\d]/g, "")))}</div> : null}
    <div className="card-actions">
      <button
        className="buy-btn"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/order/${id}`);
        }}
      >
        {t("اشتري الآن")}
      </button>
      <button
        className={`fav-btn ${on ? 'on' : ''}`}
        aria-label={t("المفضلة")}
       aria-pressed={on}
       onClick={(e) => {
       e.preventDefault();
        toggleFav(id);
       }}>
       <svg viewBox="0 0 24 24" width="18" height="18">
    <path
      d="M12 21s-7-4.6-9.5-9C.8 8.8 2.6 5 6 5c2 0 3.4 1 4 2.3h4C14.6 6 16 5 18 5c3.4 0 5.2 3.8 3.5 7-2.5 4.4-9.5 9-9.5 9z"
      fill={on ? 'var(--c-g1)' : 'none'}
      stroke={on ? 'var(--c-g0)' : 'var(--c-k)'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
     </svg>
  </button>
  </div>
    </>)}
 const MAX_IMAGES = 6;
const toItems = (imgs) =>
  (imgs || []).filter(Boolean).map((url, i) => ({ id: `old-${i}-${url}`, url }));
const toPath = (u) =>
  decodeURIComponent((String(u).split("/product-images/")[1] || "").split("?")[0]);

export function EditPanel({ watch, onSaved, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(watch.name);
  const [price, setPrice] = useState(watch.price);
  const [bio, setBio] = useState(watch.bio || "");
  const [items, setItems] = useState([]);   // صور قديمة {id,url} أو جديدة {id,url,file}

  function openPanel() {
    setName(watch.name);
    setPrice(watch.price);
    setBio(watch.bio || "");
    setItems(toItems(watch.images));
    setOpen(true);
  }

  function closePanel() {
    items.forEach((it) => it.file && URL.revokeObjectURL(it.url));
    setItems([]);
    setOpen(false);
  }

  function addFiles(e) {
    const picked = [...e.target.files];
    e.target.value = "";
    const room = MAX_IMAGES - items.length;
    if (picked.length > room) alert(`الحد الأقصى ${MAX_IMAGES} صور`);
    const added = picked.slice(0, Math.max(room, 0)).map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setItems([...items, ...added]);
  }

  function dropItem(i) {
    if (items[i].file) URL.revokeObjectURL(items[i].url);
    setItems(items.filter((_, k) => k !== i));
  }

  function makeMain(i) {
    setItems([items[i], ...items.filter((_, k) => k !== i)]);
  }

  async function save() {
    if (items.length === 0) return alert("يجب أن تبقى صورة واحدة على الأقل");
    setSaving(true);
    const uploaded = [];
    try {
      // 1) رفع الصور الجديدة مع الحفاظ على الترتيب
      const finalUrls = [];
      for (const [i, it] of items.entries()) {
        if (!it.file) { finalUrls.push(it.url); continue; }
        const file = await compressImage(it.file); // WebP أخف
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${watch.brand || "misc"}/${Date.now()}-${i}.${ext || "jpg"}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type || undefined });
        if (upErr) throw upErr;
        uploaded.push(path);
        finalUrls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
      }

      // 2) تحديث الجدول
      const { data, error } = await supabase
        .from("watches")
        .update({ name, price: Number(price) || 0, bio, images: finalUrls })
        .eq("id", watch.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("لم يُحفظ شيء: الصلاحية مرفوضة (RLS)");

      // 3) بعد نجاح الحفظ فقط: حذف الصور المحذوفة من التخزين
      const kept = new Set(finalUrls);
      const removedPaths = (watch.images || [])
        .filter((u) => !kept.has(u))
        .map(toPath)
        .filter(Boolean);
      if (removedPaths.length > 0) {
        await supabase.storage.from("product-images").remove(removedPaths);
      }

      closePanel();
      if (onSaved) onSaved();
    } catch (err) {
      // فشل الحفظ: تنظيف ما رُفع حديثًا حتى لا يبقى يتيمًا
      if (uploaded.length > 0) await supabase.storage.from("product-images").remove(uploaded);
      alert("فشل الحفظ: " + err.message);
    }
    setSaving(false);
  }

  async function remove() {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase
        .from("watches")
        .delete()
        .eq("id", watch.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Nothing was deleted: permission denied (RLS)");

      const paths = (watch.images || []).map(toPath).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from("product-images").remove(paths);
      }

      if (onDeleted) onDeleted(watch.id);
      else if (onSaved) onSaved();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
    setDeleting(false);
  }

  if (!open)
    return (
      <div className="owner-actions">
        <button
          type="button"
          className="del-btn"
          aria-label="Delete product"
          disabled={deleting}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(); }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); openPanel(); }}
          style={{
            display: "block", flex: 1, padding: "8px",
            border: "1.5px dashed var(--c-g0)", borderRadius: 16,
            background: "transparent", color: "var(--c-k)",
            cursor: "pointer", fontWeight: "bold", fontFamily: "inherit",
          }}
        >
          ✏️ تعديل (للمالك)
        </button>
      </div>
    );

  return (
    <div className="edit-panel" onClick={(e) => e.preventDefault()} style={{ marginTop: 10 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" style={{ width: "100%", marginBottom: 6 }} />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="السعر" type="number" style={{ width: "100%", marginBottom: 6 }} />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="الوصف" style={{ width: "100%", marginBottom: 6 }} />

      <label style={{ display: "block", marginBottom: 4 }}>
        الصور (حتى {MAX_IMAGES}) — الأولى هي الرئيسية
      </label>
      <div className="ep-thumbs">
        {items.map((it, i) => (
          <div key={it.id} className={`ep-thumb ${i === 0 ? "main" : ""}`}>
            <img src={it.url} alt="" />
            <button type="button" className="ep-x" aria-label="حذف الصورة" onClick={() => dropItem(i)}>×</button>
            {i > 0 && (
              <button type="button" className="ep-main" onClick={() => makeMain(i)}>رئيسية</button>
            )}
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={items.length >= MAX_IMAGES || saving}
        onClick={(e) => e.stopPropagation()}
        onChange={addFiles}
        style={{ marginBottom: 8 }}
      />

      <div className="ep-actions">
        <button type="button" onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ..." : "💾 حفظ"}
        </button>
        <button type="button" onClick={closePanel} disabled={saving}>إلغاء</button>
      </div>
    </div>
  );
}
export function readFavs() {
  try {
    const v = JSON.parse(localStorage.getItem('favs') || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}
export function useFavs() {
  const [favs, setFavs] = useState(readFavs);
  const toggleFav = (id) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(next);
    try { localStorage.setItem('favs', JSON.stringify(next)); } catch { /* التخزين ممتلئ أو محجوب */ }
  };
  return { favs, toggleFav };
}