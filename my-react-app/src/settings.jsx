/* =========================================================
   settings.jsx  ←  src/settings.jsx
   إعدادات المتجر العامة من الخادم: طرق الدفع، أسعار التوصيل لكل ولاية، البيكسل.
   ========================================================= */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DEFAULT_PAY = [{ key: "cod", label: "الدفع عند الاستلام", details: "" }];
const Ctx = createContext({ ready: false, rates: {}, payments: [{ key: "cod", label: "الدفع عند الاستلام", details: "" }], pixels: { fb: "", tiktok: "" }, rateFor: () => null });

const isRate = (v) => Array.isArray(v) && Number.isInteger(v[0]) && v[0] >= 0 && (v[1] === null || (Number.isInteger(v[1]) && v[1] >= 0));

export function StoreSettingsProvider({ children }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    let off = false;
    fetch("/api/store-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && typeof d === "object") setS(d); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  const value = useMemo(() => {
    const rates = {};
    if (s && s.rates && typeof s.rates === "object") {
      Object.keys(s.rates).forEach((k) => { if (isRate(s.rates[k])) rates[k] = s.rates[k]; });
    }
    const payments = s && Array.isArray(s.payments) && s.payments.length ? s.payments : DEFAULT_PAY;
    const px = (s && s.pixels) || {};
    const pixels = {
      fb: /^\d{8,20}$/.test(px.fb || "") ? px.fb : "",
      tiktok: /^[A-Za-z0-9]{6,32}$/.test(px.tiktok || "") ? px.tiktok : "",
    };
    /* سعر التوصيل: رقم، أو null إن لم تُحدَّد الولاية أو لا يوجد مكتب توصيل فيها */
    const rateFor = (wilaya, place) => {
      if (!wilaya || !Object.prototype.hasOwnProperty.call(rates, wilaya)) return null;
      const r = rates[wilaya];
      return place === "office" ? r[1] : r[0];
    };
    return { ready: !!s, rates, payments, pixels, rateFor };
  }, [s]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStoreSettings = () => useContext(Ctx);
