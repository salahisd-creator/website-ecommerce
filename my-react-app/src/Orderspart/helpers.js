/* =========================================================
   helpers.js  ←  ضعه في: src/admin/helpers.js
   دوال مساعدة صغيرة (تنسيق الأرقام والهاتف، كشف التكرار، تصدير CSV).
   ========================================================= */
import { DUP_WINDOW_HOURS } from "./config";
import { CUSTOMER_SEED } from "./api";
export const money = (n) => n.toLocaleString("en-US") + " دج";
export const normPhone = (p) => String(p).replace(/\D/g, "").replace(/^213/, "0");
export const validPhone = (p) => /^0[567]\d{8}$/.test(normPhone(p));
export const fmtPhone = (p) => {
  const d = normPhone(p);
  return /^0\d{9}$/.test(d) ? d.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : String(p);
};
export const dateOf = (t) => new Date(t).toLocaleDateString("en-CA");
export const timeOf = (t) => new Date(t).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
export const shortId = (id) => (id.length > 8 ? "…" + id.slice(-6) : id);
export const wa = (o, text) => `https://wa.me/213${normPhone(o.phone).replace(/^0/, "")}?text=${encodeURIComponent(text)}`;
export const PAYMENTS = {
  cod: { label: "الدفع عند الاستلام", short: "عند الاستلام", bg: "#E8F5E9", color: "#1B6B34" },
  ccp: { label: "بريد الجزائر (CCP)", short: "CCP", bg: "#FFF3D6", color: "#8A5A00" },
  baridimob: { label: "بريدي موب", short: "بريدي موب", bg: "#E3F0FF", color: "#0B5CAD" },
  bank: { label: "تحويل بنكي", short: "تحويل بنكي", bg: "#EFE7FF", color: "#4B3A8C" },
  redotpay: { label: "RedotPay", short: "RedotPay", bg: "#FFE3E3", color: "#B3261E" },
  paypal: { label: "PayPal", short: "PayPal", bg: "#DCEBFF", color: "#12439A" },
  binance: { label: "Binance Pay", short: "Binance", bg: "#FFF6CC", color: "#7A5B00" },
};
export const payOf = (o) => PAYMENTS[o && o.payment] || PAYMENTS.cod;
export const canShip = (o) => ["new", "confirmed"].includes(o.status) && !o.tracking;

export const TEMPLATES = [
  { label: "طلب التأكيد", text: (o) => `مرحباً ${o.name}، بخصوص طلبيتك رقم ${shortId(o.id)} بمبلغ ${money(o.total)}. نرجو تأكيد الطلبية والعنوان.` },
  { label: "لم نتمكن من الاتصال", text: (o) => `مرحباً ${o.name}، حاولنا الاتصال بك بخصوص الطلبية ${shortId(o.id)}. متى يناسبك الاتصال؟` },
  { label: "تم الشحن", text: (o) => `مرحباً ${o.name}، تم شحن طلبيتك ${shortId(o.id)}${o.tracking ? ` ورقم التتبع: ${o.tracking}` : ""}.` },
];

/* الطلبيات المكررة — للعرض فقط. الخادم يجب أن يفرض نفس القاعدة عند الإرسال */
export function findDuplicates(orders) {
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const last = {};
  const dup = {};
  for (const o of sorted) {
    if (o.forceSend) continue;
    const key = normPhone(o.phone) + "|" + o.product;
    const prev = last[key];
    const close = prev && new Date(o.createdAt) - new Date(prev.createdAt) <= DUP_WINDOW_HOURS * 3600e3;
    if (close && prev.status !== "cancelled") dup[o.id] = prev.id;
    else last[key] = o;
  }
  return dup;
}

export function customerStats(orders, phone) {
  const p = normPhone(phone);
  const seed = CUSTOMER_SEED[p] || { delivered: 0, returned: 0, noAnswer: 0 };
  let d = seed.delivered, r = seed.returned, n = seed.noAnswer;
  for (const o of orders) {
    if (normPhone(o.phone) !== p) continue;
    if (o.status === "delivered") d++;
    if (o.status === "returned") r++;
    if (o.callResult === "no_answer") n += o.attempts || 1;
  }
  const done = d + r;
  const rate = done ? Math.round((d / done) * 100) : null;
  const tier = !done ? "new" : r >= 2 || rate < 50 ? "risk" : rate >= 75 ? "trusted" : "mid";
  return { d, r, n, rate, tier };
}

/* سلسلة آخر 7 أيام + نسبة التغيّر مقابل الأسبوع الذي قبله (للرسم الصغير في البطاقات) */
export function series(orders, pred, days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array(days).fill(0);
  let prev = 0;
  for (const o of orders) {
    if (!pred(o)) continue;
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400e3);
    if (diff >= 0 && diff < days) buckets[days - 1 - diff]++;
    else if (diff >= days && diff < days * 2) prev++;
  }
  const cur = buckets.reduce((a, b) => a + b, 0);
  return { buckets, delta: prev ? Math.round(((cur - prev) / prev) * 100) : null };
}

/* تصدير CSV آمن: يمنع حقن الصيغ في Excel (خلية تبدأ بـ = + - @) */
export const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^\s*[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};
