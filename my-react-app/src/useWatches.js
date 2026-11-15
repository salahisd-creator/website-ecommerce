import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useWatches(brand) {
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from("watches").select("*").order("id");
    if (brand) query = query.eq("brand", brand);
    const { data, error } = await query;
    if (error) console.error(error);
    else setWatches(data || []);
    setLoading(false);
  }, [brand]);

  useEffect(() => { load(); }, [load]);

  return { watches, loading, reload: load };
}