import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/* كاش في الذاكرة: عند الرجوع لصفحة زرتها يظهر المحتوى فوراً ثم يُحدَّث بصمت في الخلفية */
export const watchCache = new Map();   // brand -> rows
export const productCache = new Map(); // slug  -> row
const FRESH_MS = 60000;
const stamp = new Map();

export function useWatches(brand) {
  const key = brand || "*";
  const [watches, setWatches] = useState(() => watchCache.get(key) || []);
  const [loading, setLoading] = useState(!watchCache.has(key));

  const load = useCallback(async (force) => {
    if (!force && watchCache.has(key) && Date.now() - (stamp.get(key) || 0) < FRESH_MS) { setWatches(watchCache.get(key)); setLoading(false); return; }
    if (!watchCache.has(key)) setLoading(true);
    let query = supabase.from("watches").select("*");
    if (brand) query = query.eq("brand", brand);
    const { data, error } = await query;
    if (error) console.error(error);
    else {
      const rows = data || [];
      watchCache.set(key, rows); stamp.set(key, Date.now());
      rows.forEach((r) => { if (r && r.slug) productCache.set(r.slug, r); });
      setWatches(rows);
    }
    setLoading(false);
  }, [brand, key]);

  useEffect(() => {
    setWatches(watchCache.get(key) || []);
    setLoading(!watchCache.has(key));
    load();
  }, [load, key]);

  return { watches, loading, reload: () => load(true) };
}

/* يحمّل كل المنتجات مرة واحدة في الخلفية ويملأ الكاش: صفحات الأقسام وصفحة المنتج تفتح فوراً */
export async function warmWatches() {
  if (stamp.get("*") && Date.now() - stamp.get("*") < FRESH_MS) return;
  const { data, error } = await supabase.from("watches").select("*");
  if (error || !Array.isArray(data)) return;
  const by = new Map();
  data.forEach((r) => {
    if (!r || !r.slug) return;
    productCache.set(r.slug, r);
    const k = r.brand || "";
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(r);
  });
  const now = Date.now();
  watchCache.set("*", data); stamp.set("*", now);
  by.forEach((rows, k) => { if (k) { watchCache.set(k, rows); stamp.set(k, now); } });
}
