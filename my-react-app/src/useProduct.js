import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { productCache } from "./useWatches";

export function useProduct(slug) {
  const [product, setProduct] = useState(() => productCache.get(slug) || null);
  const [loading, setLoading] = useState(!productCache.has(slug));

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!productCache.has(slug)) setLoading(true); else { setProduct(productCache.get(slug)); setLoading(false); }
      const { data, error } = await supabase
        .from("watches")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) console.error(error);
      if (data) productCache.set(slug, data); else if (!error) productCache.delete(slug);
      if (alive) {
        setProduct(data || null);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  return { product, loading };
}