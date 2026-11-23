/* =========================================================
   cart.jsx  ←  src/cart.jsx
   سلة المشتريات: تُحفظ في متصفح الزائر. السعر الحقيقي يحسبه الخادم دائماً عند الطلب.
   ========================================================= */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const KEY = "isd-cart";
const SLUG_RE = /^[A-Za-z0-9_\-؀-ۿ. ]{1,120}$/;
const MAX_LINES = 20;
const MAX_QTY = 20;

const clean = (v) => {
  if (!Array.isArray(v)) return [];
  const out = [];
  v.forEach((x) => {
    if (!x || typeof x !== "object" || out.length >= MAX_LINES) return;
    const slug = typeof x.slug === "string" ? x.slug : "";
    const qty = Math.round(Number(x.qty));
    const color = typeof x.color === 'string' ? x.color.replace(/[<>]/g, '').slice(0, 30) : '';
    const hex = typeof x.hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(x.hex) ? x.hex : '';
    const key = slug + (color ? '|' + color : '');
    if (!SLUG_RE.test(slug) || !(qty >= 1) || out.some((o) => o.key === key)) return;
    const image = typeof x.image === "string" && /^(https?:\/\/|\/|data:image\/)/i.test(x.image) ? x.image.slice(0, 2000) : "";
    out.push({ slug, name: String(x.name || "").slice(0, 120), price: Math.max(0, Math.round(Number(x.price)) || 0), image, qty: Math.min(MAX_QTY, qty), color, hex, key });
  });
  return out;
};
const read = () => { try { return clean(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return []; } };
const write = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* التخزين محجوب */ } };

const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);

  const commit = useCallback((fn) => {
    setItems((cur) => { const next = clean(fn(cur)); write(next); return next; });
  }, []);

  /* مزامنة بين التبويبات */
  useEffect(() => {
    const on = (e) => { if (e.key === KEY) setItems(read()); };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  const add = useCallback((p, qty = 1) => commit((cur) => {
    const q = Math.max(1, Math.round(Number(qty)) || 1);
    const key = p.slug + (p.color ? '|' + p.color : '');
    const i = cur.findIndex((x) => (x.key || x.slug) === key);
    if (i >= 0) return cur.map((x, j) => (j === i ? { ...x, qty: Math.min(MAX_QTY, x.qty + q) } : x));
    return [...cur, { slug: p.slug, name: p.name, price: p.price, image: p.image || "", color: p.color || '', hex: p.hex || '', qty: Math.min(MAX_QTY, q) }];
  }), [commit]);
  const setQty = useCallback((key, qty) => commit((cur) => cur.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, Math.round(Number(qty)) || 1)) } : x))), [commit]);
  const remove = useCallback((key) => commit((cur) => cur.filter((x) => x.key !== key)), [commit]);
  const clear = useCallback(() => commit(() => []), [commit]);

  /* تحديث الأسماء والأسعار من قاعدة البيانات، وحذف ما لم يعد موجوداً */
  const refresh = useCallback(async () => {
    const slugs = read().map((x) => x.slug);
    if (!slugs.length) return;
    try {
      const { data, error } = await supabase.from("watches").select("slug,name,price,images").in("slug", slugs);
      if (error || !Array.isArray(data)) return;
      const by = {};
      data.forEach((r) => { if (r && typeof r.slug === "string") by[r.slug] = r; });
      commit((cur) => cur.filter((x) => by[x.slug]).map((x) => {
        const r = by[x.slug];
        const img = Array.isArray(r.images) ? r.images[0] : r.images;
        return { ...x, name: r.name || x.name, price: Number(String(r.price).replace(/[^\d]/g, "")) || x.price, image: typeof img === "string" ? img : x.image };
      }));
    } catch { /* نبقي المحفوظ */ }
  }, [commit]);

  const value = useMemo(() => ({
    items, add, setQty, remove, clear, refresh,
    count: items.reduce((s, x) => s + x.qty, 0),
    subtotal: items.reduce((s, x) => s + x.price * x.qty, 0),
  }), [items, add, setQty, remove, clear, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart يجب أن يُستعمل داخل CartProvider");
  return c;
}
