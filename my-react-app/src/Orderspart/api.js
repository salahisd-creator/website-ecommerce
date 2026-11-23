/* =========================================================
   api.js  ←  ضعه في: src/admin/api.js
   الاتصال بالخادم (server.js) وتوحيد شكل الطلبيات.
   ========================================================= */
import { USE_SAMPLE, API, REQUEST_TIMEOUT_MS, STATUS, STATUS_ALIAS, CALLS } from "./config";
export const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
export const SAMPLE_ORDERS = [
  { id: 1043, name: "محمد بن علي", phone: "0555123456", wilaya: "وهران", product: "منتج أ", total: 12500, status: "new", createdAt: ago(2), attempts: 2, callResult: "no_answer" },
  { id: 1042, name: "محمد بن علي", phone: "0555123456", wilaya: "وهران", product: "منتج أ", total: 12500, status: "new", createdAt: ago(3) },
  { id: 1041, name: "سارة مرابط", phone: "0770987654", wilaya: "الجزائر", product: "منتج ب", total: 8900, status: "confirmed", createdAt: ago(8), attempts: 1, callResult: "confirmed" },
  { id: 1040, name: "يوسف حداد", phone: "0661112233", wilaya: "سطيف", product: "منتج ج", total: 15200, status: "shipping", tracking: "YAL-48213", company: "yalidine", createdAt: ago(30) },
  { id: 1039, name: "ليلى بوزيد", phone: "0550445566", wilaya: "قسنطينة", product: "منتج د", total: 6400, status: "new", createdAt: ago(40) },
  { id: 1038, name: "كريم سعيدي", phone: "0699778899", wilaya: "عنابة", product: "منتج ب", total: 9800, status: "returned", tracking: "YAL-47990", company: "yalidine", createdAt: ago(90) },
  { id: 1037, name: "أمينة قاسي", phone: "0540123987", wilaya: "تلمسان", product: "منتج أ", total: 7300, status: "delivered", tracking: "ZR-11820", company: "zr", createdAt: ago(120) },
];

/* سجل قديم للزبائن (قبل تشغيل النظام) — اجعله يأتي من قاعدة بياناتك.
   يُترك فارغاً في الإنتاج حتى لا تُنسب أرقام وهمية لعملاء حقيقيين */
export const CUSTOMER_SEED = USE_SAMPLE
  ? { "0555123456": { delivered: 4, returned: 1, noAnswer: 0 }, "0699778899": { delivered: 1, returned: 2, noAnswer: 1 } }
  : {};

export class AuthError extends Error {}
export class HttpError extends Error {
  constructor(status, code) { super("http " + status); this.status = status; this.code = code || ""; }
}

/* الجلسة عبر كوكي httpOnly يضعه الخادم — لا نحفظ أي توكن أو كلمة سر في المتصفح.
   حماية CSRF: الكوكي SameSite=Strict + ترويسة X-Requested-With في كل طلب */
export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(API + path, {
      credentials: "include", ...options, method, signal: ctl.signal,
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    });
    if (res.status === 401) throw new AuthError("unauthorized");
    if (!res.ok) {
      let code = "";
      try { const j = await res.json(); code = j && typeof j.error === "string" ? j.error.slice(0, 40) : ""; } catch { /* بدون جسم */ }
      throw new HttpError(res.status, code);
    }
    return res.status === 204 ? null : await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const pick = (r, keys, d = "") => {
  for (const k of keys) if (r[k] !== undefined && r[k] !== null) return r[k];
  return d;
};
export const cleanTracking = (t) => String(t || "").replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 40);
export const toIso = (v) => { const d = new Date(v); return isNaN(d) ? new Date().toISOString() : d.toISOString(); };
export const toStatus = (s) => { const k = STATUS_ALIAS[s] || s; return STATUS[k] && k !== "duplicate" ? k : "new"; };

/* توحيد شكل الطلبية القادمة من الخادم — يقبل أسماء حقول متعددة، وكل النصوص تُقصّ وتُنظَّف */
export const normalize = (r) => ({
  id: String(pick(r, ["id", "_id", "orderId", "order_id"], "")),
  name: String(pick(r, ["name", "customerName", "customer_name", "fullName", "full_name", "الاسم", "الاسم الكامل"])).slice(0, 80),
  phone: String(pick(r, ["phone", "phoneNumber", "phone_number", "mobile", "tel", "الهاتف", "رقم الهاتف"])).slice(0, 20),
  wilaya: String(pick(r, ["wilaya", "state", "city", "الولاية"])).slice(0, 40),
  product: String(pick(r, ["product", "productName", "product_name", "المنتج"])).slice(0, 300),
  items: Array.isArray(r.items)
    ? r.items.slice(0, 20).map((i) => ({ name: String((i && i.name) || "").slice(0, 120), color: String((i && i.color) || "").slice(0, 30), qty: Math.max(1, Math.min(99, Number(i && i.qty) || 1)), price: Math.max(0, Number(i && i.price) || 0) }))
    : [],
  delivery: Number.isFinite(Number(r.delivery)) && r.delivery !== "" && r.delivery !== null ? Math.max(0, Number(r.delivery)) : null,
  place: r.place === "office" ? "office" : r.place === "home" ? "home" : "",
  commune: String(r.commune || "").slice(0, 60),
  priceVerified: r.priceVerified === false ? false : r.priceVerified === true ? true : null,
  total: Number(String(pick(r, ["total", "totalPrice", "total_price", "amount", "price", "المجموع", "السعر"], 0)).replace(/[^\d.]/g, "")) || 0,
  status: toStatus(r.status),
  tracking: cleanTracking(r.tracking ?? r.trackingNumber),
  company: /^[a-z0-9_-]{1,30}$/.test(String(r.company || "")) ? String(r.company) : "",
  createdAt: toIso(pick(r, ["createdAt", "created_at", "date"], Date.now())),
  callResult: CALLS.some((c) => c.key === r.callResult) ? r.callResult : null,
  attempts: Math.max(0, Math.min(99, Number(r.attempts) || 0)),
  note: String(r.note ?? "").slice(0, 500),
  log: Array.isArray(r.log)
    ? r.log.slice(-50).map((l) => ({ at: (l && l.at) || Date.now(), text: String((l && l.text) || "").slice(0, 200) }))
    : [],
  payment: ["cod", "ccp", "baridimob", "bank", "redotpay", "paypal", "binance"].includes(r.payment) ? r.payment : "cod",
  receipt: /^[a-f0-9]{24}\.(jpg|png|webp)$/.test(String(r.receipt || "")) ? String(r.receipt) : "",
  forceSend: r.forceSend === true || r.forceSend === "true",
  extra: r.extra && typeof r.extra === "object" && !Array.isArray(r.extra)
    ? Object.fromEntries(Object.entries(r.extra).slice(0, 20).map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 300)]))
    : {},
});

export async function loadOrders() {
  if (USE_SAMPLE) return SAMPLE_ORDERS.map(normalize);
  const data = await api("/admin/orders");
  const list = Array.isArray(data && data.orders) ? data.orders : [];
  return list.map(normalize).filter((o) => o.id);
}

export async function saveOrder(id, changes) {
  if (USE_SAMPLE) return;
  await api(`/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) });
}

export async function createOrder(body) {
  if (USE_SAMPLE) return null;
  return api("/admin/orders", { method: "POST", body: JSON.stringify(body) });
}

/* الإرسال لشركة التوصيل: بدون خادم لا يمكن حفظ مفاتيح الشركات بأمان في المتصفح،
   لذلك نسجّل الطلبية «قيد التوصيل» مع رقم التتبع الذي تكتبه (اختياري) */
export async function sendToDelivery(order, { tracking }) {
  if (USE_SAMPLE) {
    await new Promise((r) => setTimeout(r, 500));
    return "TRK-" + Math.floor(10000 + Math.random() * 90000);
  }
  return cleanTracking(tracking);
}
