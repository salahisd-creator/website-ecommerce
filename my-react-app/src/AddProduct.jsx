import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { compressImage } from "./compressImage";
import { useAdmin } from "./useAdmin";

const Styles = `
:root {
  --isd-page: var(--c-tan);       /* خلفية الصفحة (body) */
  --isd-card: var(--c-cream);       /* عاجي: خلفية البطاقة */
  --isd-field: #ffffff;      /* خلفية الحقول */
  --isd-line: var(--c-cream2);       /* الحدود */
  --isd-gold: var(--c-g0);       /* لون العلامة */
  --isd-gold-hover: var(--c-g0);
  --isd-gold-dark: var(--c-d1);  /* عناوين */
  --isd-text: #2a2418;       /* نص رئيسي */
  --isd-muted: var(--c-ink4);      /* نص ثانوي */
}

body {
  background: var(--isd-page);
}

.add-product-wrap {
  display: flex;
  justify-content: center;
  padding: 32px 16px 64px;
}

.add-product {
  direction: rtl;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 30px auto;
  padding: 32px 28px;
  background: var(--isd-card);
  border: 1px solid var(--isd-line);
  border-top: 3px solid var(--isd-gold);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(60, 40, 10, 0.25);
  color: var(--isd-text);
  font-family: "Cairo", "Tajawal", system-ui, sans-serif;
}

.add-product h2 {
  margin: 0 0 6px;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--isd-gold-dark);
}

.add-product label {
  display: block;
  margin: 8px 0 -4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--isd-muted);
}

/* الحقول */
.add-product input[type="text"],
.add-product input[type="number"],
.add-product select,
.add-product textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  background: var(--isd-field);
  color: var(--isd-text);
  border: 1px solid var(--isd-line);
  border-radius: 10px;
  font: inherit;
  font-size: 1rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.add-product textarea {
  min-height: 96px;
  resize: vertical;
}

.add-product ::placeholder {
  color: var(--isd-muted);
  opacity: 0.8;
}

.add-product select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%239a7424' stroke-width='2' stroke-linecap='round'/></svg>");
  background-repeat: no-repeat;
  background-position: left 14px center; /* السهم على اليسار في RTL */
  padding-left: 38px;
}

.add-product input:focus,
.add-product select:focus,
.add-product textarea:focus {
  outline: none;
  border-color: var(--isd-gold);
  box-shadow: 0 0 0 3px rgba(154, 116, 36, 0.25);
}

/* رفع الصور */
.add-product input[type="file"] {
  width: 100%;
  padding: 14px;
  background: transparent;
  color: var(--isd-muted);
  border: 1px dashed var(--c-ink3);
  border-radius: 10px;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.add-product input[type="file"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-product input[type="file"]::file-selector-button {
  margin-inline-end: 12px;
  padding: 8px 14px;
  background: var(--isd-field);
  color: var(--isd-gold-dark);
  border: 1px solid var(--isd-gold);
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

/* زر الإضافة */
.add-product button[type="submit"] {
  margin-top: 6px;
  padding: 13px 16px;
  background: var(--isd-gold);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.add-product button[type="submit"]:hover {
  background: var(--isd-gold-hover);
}

.add-product button[type="submit"]:active {
  transform: translateY(1px);
}

.add-product button[type="submit"]:focus-visible {
  outline: 3px solid var(--isd-gold-dark);
  outline-offset: 2px;
}

.add-product button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .add-product {
    padding: 24px 18px;
  }
}
`;

const CATALOG = {
  watches: { label: "ساعات",  brands: ["rolex", "patek", "omega", "ap", "cartier", "tissot"] },
  glasses: { label: "نظارات", brands: [] },
  bags:    { label: "حقائب",  brands: [] },
  caps:    { label: "قبعات",  brands: [] },
};
const input = {};
const MAX_IMAGES = 6;

export default function AddProduct() {
  const isAdmin = useAdmin();
  const [category, setCategory] = useState("watches");
  const [brand, setBrand] = useState(CATALOG.watches.brands[0]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  // روابط المعاينة (تُنشأ مرة لكل تغيير في الملفات وتُحرَّر عند التنظيف)
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  if (!isAdmin) return <p style={{ textAlign: "center" }}>غير مسموح</p>;

  const onCategory = (c) => {
    setCategory(c);
    setBrand(CATALOG[c].brands[0] || c); // للأقسام بدون علامات: brand = اسم القسم
  };

  const onPick = (e) => {
    const merged = [...files, ...e.target.files];
    if (merged.length > MAX_IMAGES) alert(`الحد الأقصى ${MAX_IMAGES} صور`);
    setFiles(merged.slice(0, MAX_IMAGES));
    e.target.value = "";
  };

  const removeAt = (i) => setFiles(files.filter((_, k) => k !== i));
  const makeMain = (i) => setFiles([files[i], ...files.filter((_, k) => k !== i)]);

  async function submit(e) {
    e.preventDefault();
    if (!name || files.length === 0) return alert("الاسم والصورة مطلوبان");
    setBusy(true);
    const uploaded = [];
    try {
      // 1) رفع الصور
      const urls = [];
      for (const [i, orig] of files.entries()) {
        const file = await compressImage(orig); // WebP أخف
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${brand}/${Date.now()}-${i}.${ext || "jpg"}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type || undefined });
        if (upErr) throw upErr;
        uploaded.push(path);
        urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
      }

      // 2) إضافة المنتج
      const slug = `${brand}-${name}`.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const { data, error } = await supabase.from("watches").insert({
        slug, name, bio, price: Number(price) || 0,
        images: urls, category, brand,
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("(RLS) Failed to add product");

      alert("تمت الإضافة ✅");
      setName(""); setBio(""); setPrice(""); setFiles([]);
    } catch (err) {
      // تنظيف الصور المرفوعة إن فشلت الإضافة (حتى لا تبقى يتيمة)
      if (uploaded.length > 0) {
        await supabase.storage.from("product-images").remove(uploaded);
      }
      alert("فشل: " + err.message);
    }
    setBusy(false);
  }

  return (
    <>
      <style>{Styles}</style>
      <form onSubmit={submit} className="add-product">
        <h2 style={{ textAlign: "center" }}>إضافة منتج</h2>

        <label>نوع المنتج</label>
        <select style={input} value={category} onChange={(e) => onCategory(e.target.value)}>
          {Object.entries(CATALOG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {CATALOG[category].brands.length > 0 && (
          <>
            <label>الصفحة (العلامة)</label>
            <select style={input} value={brand} onChange={(e) => setBrand(e.target.value)}>
              {CATALOG[category].brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </>
        )}

        <input style={input} type="text" placeholder="اسم المنتج" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea style={input} placeholder="الوصف / اللون" value={bio} onChange={(e) => setBio(e.target.value)} />
        <input style={input} type="number" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>الصور (حتى {MAX_IMAGES}) — الأولى هي الرئيسية</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          disabled={files.length >= MAX_IMAGES || busy}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {previews.map((src, i) => (
            <div key={src} style={{ position: "relative" }}>
              <img
                src={src}
                alt=""
                width={78}
                height={78}
                style={{ objectFit: "cover", borderRadius: 8, border: i === 0 ? "2px solid var(--c-g0)" : "2px solid transparent" }}
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                style={{ position: "absolute", top: -6, left: -6, width: 22, height: 22, borderRadius: "50%", border: "none", background: "#b3341f", color: "#fff", cursor: "pointer" }}
              >×</button>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  style={{ position: "absolute", bottom: 2, right: 2, fontSize: 10, border: "none", borderRadius: 6, background: "rgba(0,0,0,.65)", color: "#fff", cursor: "pointer" }}
                >رئيسية</button>
              )}
            </div>
          ))}
        </div>

        <button type="submit" disabled={busy} className="buy-btn" style={{ width: "100%" }}>
          {busy ? "جاري الرفع..." : "إضافة المنتج"}
        </button>
      </form>
    </>
  );
}