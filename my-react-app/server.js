"use strict";
/**
 * خادم الطلبيات — ملف واحد، بدون أي حزم (Node فقط).
 *
 * التشغيل:
 *   Windows (PowerShell):  $env:ADMIN_PASSWORD="كلمة-سر-طويلة-12-حرفا-او-اكثر"; node server.js
 *   Windows (CMD):         set ADMIN_PASSWORD=كلمة-سر-طويلة-12-حرفا-او-اكثر && node server.js
 *
 * • المتجر يرسل الطلبية إلى:  POST /api/orders          (عام)
 * • الإدارة تعمل عبر:        /api/admin/*              (محمية بكلمة سر + كوكي httpOnly)
 * • الطلبيات تُحفظ في:       data/orders.json
 * • إن وُجد مجلد build (بعد npm run build) يخدمه الخادم أيضاً.
 *
 * الحسابات: المالك يدخل بكلمة ADMIN_PASSWORD (بدون بريد). أعضاء الفريق يدخلون بالبريد + كلمة سر خاصة بهم.
 * الأدوار: owner (مالك) · manager (مدير) · agent (موظف: الطلبيات فقط).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

/* قراءة ملف .env (بدون أي مكتبة). نقرأ فقط المفاتيح التي نحتاجها، ولا نكتب شيئاً في process.env */
const ENV_FILE = {};
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(REACT_APP_SUPABASE_URL|REACT_APP_SUPABASE_ANON_KEY|TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)\s*=\s*(.*?)\s*$/);
    if (m) ENV_FILE[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* لا يوجد .env */ }
const ENV = (k) => process.env[k] || ENV_FILE[k] || "";
const PORT = Number(process.env.PORT) || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SECURE_COOKIE = process.env.COOKIE_SECURE === "1"; // فعّله عند النشر على https
const TRUST_PROXY = process.env.TRUST_PROXY === "1";      // فعّله خلف Nginx/Cloudflare
const HOST = process.env.HOST || undefined;                // مثال: HOST=127.0.0.1 عند وضع الخادم خلف Nginx
const SESSION_MS = 12 * 3600e3;

if (ADMIN_PASSWORD.length < 12) {
  console.error("✗ ضع كلمة سر الإدارة في ADMIN_PASSWORD (12 حرفاً على الأقل) ثم أعد التشغيل.");
  process.exit(1);
}

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "orders.json");
const BUILD_DIR = process.env.BUILD_DIR ? path.resolve(process.env.BUILD_DIR) : path.join(__dirname, "build");
fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- قاعدة البيانات (ملف JSON) ---------- */
const nowIso = () => new Date().toISOString();
const DEFAULT_COMPANIES = [["yalidine", "Yalidine"], ["zr", "ZR Express"], ["procolis", "Procolis"]].map(([id, name], i) => ({
  id, name, enabled: true, isDefault: i === 0, apiUrl: "", apiId: "", apiToken: "", updatedAt: nowIso(),
}));
const PAY_KEYS = { cod: "الدفع عند الاستلام", ccp: "بريد الجزائر (CCP)", baridimob: "بريدي موب", bank: "تحويل بنكي", redotpay: "RedotPay", paypal: "PayPal", binance: "Binance Pay" };
/* أسعار التوصيل التقريبية (منزل / مكتب) لكل ولاية بالدينار — مرجع: dropdz.space 2026. عدّلها من لوحة الإدارة حسب عقدك مع شركة التوصيل. */
const DEFAULT_RATES = {
  "أدرار": [1100, 600], "الشلف": [690, 400], "الأغواط": [900, 500], "أم البواقي": [850, 400], "باتنة": [850, 400], "بجاية": [790, 400],
  "بسكرة": [950, 500], "بشار": [1000, 600], "البليدة": [600, 400], "البويرة": [690, 400], "تمنراست": [1100, 600], "تبسة": [850, 400],
  "تلمسان": [600, 400], "تيارت": [700, 400], "تيزي وزو": [690, 400], "الجزائر": [500, 400], "الجلفة": [900, 500], "جيجل": [790, 400],
  "سطيف": [750, 400], "سعيدة": [790, 400], "سكيكدة": [690, 400], "سيدي بلعباس": [600, 400], "عنابة": [800, 400], "قالمة": [850, 450],
  "قسنطينة": [800, 400], "المدية": [690, 400], "مستغانم": [600, 400], "المسيلة": [800, 400], "معسكر": [650, 400], "ورقلة": [900, 500],
  "وهران": [450, 250], "البيض": [900, 500], "إليزي": [1300, 600], "برج بوعريريج": [790, 400], "بومرداس": [690, 350], "الطارف": [850, 500],
  "تندوف": [1300, 600], "تيسمسيلت": [750, 400], "الوادي": [950, 550], "خنشلة": [800, 400], "سوق أهراس": [800, 500], "تيبازة": [690, 350],
  "ميلة": [690, 400], "عين الدفلى": [690, 400], "النعامة": [900, 500], "عين تموشنت": [600, 400], "غرداية": [990, 500], "غليزان": [690, 400],
  "تيميمون": [1700, 1100], "برج باجي مختار": [1100, 600], "أولاد جلال": [900, 600], "بني عباس": [1100, 600], "عين صالح": [900, null],
  "عين قزام": [990, 500], "تقرت": [990, 500], "جانت": [1700, 1100], "المغير": [1000, 750], "المنيعة": [1700, 1100],
};
const defaultRates = () => Object.fromEntries(Object.entries(DEFAULT_RATES).map(([k, [home, office]]) => [k, { home, office }]));
const FALLBACK_RATE = { home: 800, office: 500 };
/* أمثلة تجريبية تظهر في لوحة الإدارة فقط (demo=true) ولا تُعرض للزوار أبداً حتى تحوّلها إلى تقييمات حقيقية */
const demoReviews = () => [
  ["مثال: زبون 1", "الجزائر", 5, "هنا يظهر نص تقييم الزبون. عدّل هذا المثال وضع كلام زبون حقيقي."],
  ["مثال: زبونة 2", "وهران", 5, "مثال تجريبي — لا يظهر للزوار."],
  ["مثال: زبون 3", "قسنطينة", 4, "مثال تجريبي — لا يظهر للزوار."],
].map(([name, city, rating, text], i) => ({ id: String(i + 1), name, city, rating, text, demo: true, published: false, order: i, createdAt: new Date().toISOString() }));

const payKey = (v, mustBeEnabled) => {
  if (typeof v !== "string") return mustBeEnabled ? "cod" : "";
  const k = v;
  if (!Object.prototype.hasOwnProperty.call(PAY_KEYS, k)) return mustBeEnabled ? "cod" : "";
  if (mustBeEnabled && !(db.settings.payments[k] && db.settings.payments[k].enabled)) return "cod";
  return k;
};
const defaultSettings = () => ({
  storeName: "متجري", phone: "", email: "", address: "", ownerName: "مدير المتجر",
  payments: Object.fromEntries(Object.keys(PAY_KEYS).map((k) => [k, { enabled: k === "cod", details: "" }])),
  rates: defaultRates(),
  telegram: { token: "", chatId: "" },
  pixels: { fb: "", tiktok: "" },
});
let db = { next: 1000, orders: [], pnext: 0, products: [], companies: DEFAULT_COMPANIES, team: [], settings: defaultSettings(), auth: {}, reviews: [], rnext: 0, leads: [], lnext: 0 };
db.reviews = demoReviews(); db.rnext = db.reviews.length;
try {
  const d = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (d && Array.isArray(d.orders)) {
    db = {
      next: Number(d.next) || 1000, orders: d.orders,
      pnext: Number(d.pnext) || 0, products: Array.isArray(d.products) ? d.products : [],
      companies: Array.isArray(d.companies) && d.companies.length ? d.companies : DEFAULT_COMPANIES,
      team: Array.isArray(d.team) ? d.team : [],
      settings: { ...defaultSettings(), ...(d.settings || {}), payments: { ...defaultSettings().payments, ...((d.settings && d.settings.payments) || {}) } },
      auth: d.auth && typeof d.auth === "object" ? d.auth : {},
      reviews: Array.isArray(d.reviews) ? d.reviews : demoReviews(), rnext: Number(d.rnext) || (Array.isArray(d.reviews) ? 0 : 3),
      leads: Array.isArray(d.leads) ? d.leads : [], lnext: Number(d.lnext) || 0,
    };
    db.settings.rates = { ...defaultRates(), ...(d.settings && d.settings.rates) };
    db.settings.telegram = { token: "", chatId: "", ...(d.settings && d.settings.telegram) };
    db.settings.pixels = { fb: "", tiktok: "", ...(d.settings && d.settings.pixels) };
  }
} catch { /* ملف جديد */ }
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const RECEIPT_DIR = path.join(UPLOAD_DIR, "receipts"); /* وصولات الدفع: خاصة، لا تُخدَّم إلا للإدارة */
fs.mkdirSync(RECEIPT_DIR, { recursive: true });
const RECEIPT_RE = /^[a-f0-9]{24}\.(?:jpg|png|webp)$/;

let writing = Promise.resolve();
function save() {
  writing = writing.catch(() => {}).then(async () => {
    const tmp = DB_FILE + ".tmp";
    await fs.promises.writeFile(tmp, JSON.stringify(db));
    await fs.promises.rename(tmp, DB_FILE);
  });
  return writing;
}


/* ---------- سعر المنتج الحقيقي من قاعدة المنتجات (Supabase) — لا نثق بسعر المتصفح ---------- */
const priceCache = new Map();
const SLUG_RE = /^[A-Za-z0-9_\-؀-ۿ. ]{1,120}$/;
const numFrom = (v) => Number(String(v === null || v === undefined ? "" : v).replace(/[^\d]/g, "")) || 0;
function httpGetJson(urlStr, headers, timeoutMs) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(urlStr); } catch (e) { return reject(e); }
    const lib = u.protocol === "http:" ? http : https;
    const r = lib.request(u, { method: "GET", headers, timeout: timeoutMs }, (x) => {
      const chunks = []; let n = 0;
      x.on("data", (c) => { n += c.length; if (n > 200000) { r.destroy(new Error("too_big")); } else chunks.push(c); });
      x.on("end", () => {
        if (x.statusCode < 200 || x.statusCode >= 300) return reject(new Error("status_" + x.statusCode));
        try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { reject(e); }
      });
    });
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    r.end();
  });
}
/* يعيد {name, price} أو null (المنتج غير موجود) أو undefined (التحقق غير متاح الآن) */
async function productInfo(slug) {
  const base = ENV("REACT_APP_SUPABASE_URL").replace(/\/+$/, ""), key = ENV("REACT_APP_SUPABASE_ANON_KEY");
  if (!base || !key) return undefined;
  const hit = priceCache.get(slug);
  if (hit && hit.exp > Date.now()) return hit.v;
  try {
    const url = base + "/rest/v1/watches?select=slug,name,price&limit=1&slug=eq." + encodeURIComponent(slug);
    const rows = await httpGetJson(url, { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }, 6000);
    const row = Array.isArray(rows) && rows[0];
    const v = row && numFrom(row.price) > 0 ? { name: text(row.name, 100), price: numFrom(row.price) } : null;
    if (priceCache.size > 500) priceCache.clear();
    priceCache.set(slug, { v, exp: Date.now() + 60000 });
    return v;
  } catch { return undefined; }
}
const rateFor = (wilaya, place) => {
  const r = db.settings.rates && Object.prototype.hasOwnProperty.call(db.settings.rates, wilaya) ? db.settings.rates[wilaya] : null;
  if (!r) return null;
  const v = place === "office" ? r.office : r.home;
  return Number.isFinite(v) ? v : null;
};

/* طلب من المتجر بالشكل الجديد: items + wilaya + place. الخادم هو من يحسب الأسعار والتوصيل */
async function buildStoreOrder(b) {
  const name = text(b.name, 80);
  const phone = normPhone(b.phone || "");
  if (name.length < 2) return { error: "invalid_name" };
  if (!/^0\d{8,9}$/.test(phone)) return { error: "invalid_phone" };
  const wilaya = text(b.wilaya, 40);
  const place = b.place === "office" ? "office" : "home";
  if (!Object.prototype.hasOwnProperty.call(db.settings.rates, wilaya)) return { error: "invalid_wilaya" };
  const delivery = rateFor(wilaya, place);
  if (delivery === null) return { error: "office_unavailable" };
  if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 20) return { error: "invalid_items" };
  const items = [];
  let verified = true, sum = 0;
  for (const it of b.items) {
    if (!it || typeof it !== "object") return { error: "invalid_items" };
    const slug = typeof it.slug === "string" ? it.slug : "";
    const qty = Number(it.qty);
    if (!SLUG_RE.test(slug) || !Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "invalid_items" };
    const info = await productInfo(slug);
    let price, pname;
    if (info) { price = info.price; pname = info.name; }
    else if (info === null) return { error: "invalid_product" };
    else {
      /* التحقق غير متاح (لا اتصال أو لم تُضبط مفاتيح Supabase): نقبل الطلب ونعلّمه «غير مؤكد» حتى لا نخسر الزبون */
      verified = false;
      price = Math.min(Math.max(numFrom(it.price), 0), 10000000);
      pname = text(it.name, 100) || slug;
    }
    const color = text(it.color, 30);
    items.push({ slug, name: pname, qty, price, ...(color ? { color } : {}) });
    sum += price * qty;
  }
  const total = sum + delivery;
  const productText = text(items.map((i) => `${i.name}${i.color ? ` (${i.color})` : ""}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join("، "), 300);
  const payment = payKey(b.payment, true);
  let receipt = "";
  if (payment !== "cod") {
    receipt = await saveDataImage(b.receipt, RECEIPT_DIR, MAX_RECEIPT_BYTES) || "";
    if (!receipt) return { error: "receipt_required" };
  }
  return {
    order: {
      id: String(++db.next), createdAt: new Date().toISOString(),
      name, phone, wilaya, commune: text(b.commune, 60), place, delivery, items, priceVerified: verified,
      product: productText, total: Math.min(total, 10000000),
      payment, ...(receipt ? { receipt } : {}),
      status: "new", callResult: null, attempts: 0, note: "", forceSend: false, tracking: "", company: "", log: [], extra: {}, hist: [{ s: "new", at: new Date().toISOString() }],
    },
  };
}

/* ---------- إشعار تيليغرام (نص عادي بلا تنسيق، فلا حقن) ---------- */
function telegramCreds() {
  const t = db.settings.telegram || {};
  return { token: ENV("TELEGRAM_BOT_TOKEN") || t.token || "", chatId: ENV("TELEGRAM_CHAT_ID") || t.chatId || "" };
}
function telegramSend(msg) {
  const { token, chatId } = telegramCreds();
  if (!/^\d{5,12}:[A-Za-z0-9_-]{30,60}$/.test(token) || !/^-?\d{4,20}$/.test(chatId)) return Promise.resolve(false);
  const base = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";
  const body = JSON.stringify({ chat_id: chatId, text: String(msg).slice(0, 3500), disable_web_page_preview: true });
  return new Promise((resolve) => {
    try {
      const u = new URL(`${base}/bot${token}/sendMessage`);
      const lib = u.protocol === "http:" ? http : https;
      const r = lib.request(u, { method: "POST", timeout: 8000, headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } }, (x) => {
        x.resume(); x.on("end", () => resolve(x.statusCode >= 200 && x.statusCode < 300));
      });
      r.on("timeout", () => r.destroy());
      r.on("error", () => resolve(false));
      r.end(body);
    } catch { resolve(false); }
  });
}
const orderMessage = (o) => [
  `🛒 طلب جديد #${o.id}`,
  `👤 ${o.name}`,
  `📞 ${o.phone}`,
  `📍 ${o.wilaya}${o.commune ? " - " + o.commune : ""} (${o.place === "office" ? "مكتب توصيل" : "للمنزل"})`,
  `📦 ${o.product}`,
  `🚚 التوصيل: ${o.delivery} دج`,
  `💰 الإجمالي: ${o.total} دج`,
  `💳 ${PAY_KEYS[o.payment] || "—"}`,
  o.receipt ? "📎 مع صورة وصل الدفع (راجعها في لوحة الإدارة)" : "",
  o.priceVerified === false ? "⚠️ السعر غير مؤكد من الخادم — راجعه" : "",
].filter(Boolean).join("\n");

/* ---------- المراجعات ---------- */
const publicReview = (r) => ({ id: r.id, name: r.name, city: r.city, rating: r.rating, text: r.text, ...(r.product ? { product: r.product } : {}), ...(r.image && UPLOAD_RE.test(r.image) ? { image: r.image } : {}) });
const cleanReview = (b, old) => {
  const name = text(b.name !== undefined ? b.name : old && old.name, 60);
  const city = text(b.city !== undefined ? b.city : old && old.city, 40);
  const rating = Math.round(Number(b.rating !== undefined ? b.rating : old ? old.rating : 5));
  const body = text(b.text !== undefined ? b.text : old && old.text, 400);
  if (name.length < 2) return { error: "invalid_name" };
  if (!(rating >= 1 && rating <= 5)) return { error: "invalid_rating" };
  if (body.length < 3) return { error: "invalid_text" };
  return { v: { name, city, rating, text: body } };
};

/* ---------- أدوات ---------- */
const STATUSES = ["new", "confirmed", "shipping", "delivered", "returned", "cancelled"];
const CALLS = ["no_answer", "busy", "postponed", "confirmed", "wrong_number", "cancelled"];

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  let h = hits.get(key);
  if (!h || h.reset < now) { h = { n: 0, reset: now + windowMs }; hits.set(key, h); }
  h.n++;
  return h.n > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  for (const [k, v] of sessions) if (v.exp < now) sessions.delete(k);
}, 60000).unref();

const sessions = new Map();
/* خلف وسيط موثوق نأخذ آخر عنوان في X-Forwarded-For (الذي أضافه وسيطك)، لا الأول لأن المهاجم يستطيع كتابته */
const ipOf = (req) =>
  (TRUST_PROXY && String(req.headers["x-forwarded-for"] || "").split(",").pop().trim().slice(0, 64)) || req.socket.remoteAddress || "?";

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
const sameSecret = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

function cookieOf(req, name) {
  const m = String(req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return m ? m[1] : "";
}
const sessionOf = (req) => {
  const t = cookieOf(req, "sid");
  const s = t && sessions.get(t);
  return s && s.exp > Date.now() ? s : null;
};
const dropSessions = (uid) => { for (const [k, v] of sessions) if (v.uid === uid) sessions.delete(k); };

/* كلمات السر: scrypt مع ملح عشوائي (لا تُحفظ نصاً أبداً) */
const hashPw = (pw) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString("hex") };
};
const checkPw = (pw, rec) => {
  try { return crypto.timingSafeEqual(Buffer.from(crypto.scryptSync(String(pw), rec.salt, 64).toString("hex")), Buffer.from(rec.hash)); } catch { return false; }
};
const DUMMY = hashPw("dummy-password-for-timing");
const ownerOk = (pw) => (db.auth.owner ? checkPw(pw, db.auth.owner) : sameSecret(pw, ADMIN_PASSWORD));
const ROLE_PERMS = {
  owner: ["orders", "products", "delivery", "team", "settings", "reviews"],
  manager: ["orders", "products", "delivery", "team", "settings", "reviews"],
  agent: ["orders"],
};
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const ownerView = () => ({ id: "owner", name: db.settings.ownerName, email: "", role: "owner", status: "active", createdAt: "", lastLogin: "" });
const memberView = (m) => ({ id: m.id, name: m.name, email: m.email, role: m.role, status: m.status, createdAt: m.createdAt, lastLogin: m.lastLogin || "" });
const companyView = (c, full) => full
  ? { id: c.id, name: c.name, enabled: c.enabled, isDefault: c.isDefault, apiUrl: c.apiUrl, apiId: c.apiId, hasToken: !!c.apiToken, tokenHint: c.apiToken ? "••••" + c.apiToken.slice(-3) : "", updatedAt: c.updatedAt, builtin: DEFAULT_COMPANIES.some((d) => d.id === c.id) }
  : { id: c.id, name: c.name, enabled: c.enabled, isDefault: c.isDefault };

const text = (v, n) => String(v === null || v === undefined ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);
const first = (b, keys) => {
  for (const k of keys) if (b[k] !== undefined && b[k] !== null && String(b[k]).trim() !== "") return b[k];
  return "";
};
const normPhone = (p) => String(p).replace(/\D/g, "").replace(/^213/, "0");

const KNOWN = new Set(["name", "customername", "customer_name", "fullname", "full_name", "الاسم", "الاسم الكامل",
  "phone", "phonenumber", "phone_number", "mobile", "tel", "الهاتف", "رقم الهاتف",
  "wilaya", "state", "city", "الولاية", "product", "productname", "product_name", "المنتج",
  "total", "totalprice", "total_price", "amount", "price", "المجموع", "السعر", "payment", "paymentmethod", "payment_method",
  "id", "status", "createdat", "callresult", "attempts", "note", "forcesend", "tracking", "company", "log", "extra", "action", "key"]);

/* ينشئ طلبية من جسم الطلب (المتجر أو الإدارة). الحقول الداخلية لا يمكن تحديدها من الخارج */
function buildOrder(b) {
  const name = text(first(b, ["name", "customerName", "customer_name", "fullName", "full_name", "الاسم", "الاسم الكامل"]), 80);
  const phone = normPhone(first(b, ["phone", "phoneNumber", "phone_number", "mobile", "tel", "الهاتف", "رقم الهاتف"]));
  if (name.length < 2) return { error: "invalid_name" };
  if (!/^0\d{8,9}$/.test(phone)) return { error: "invalid_phone" };
  const total = Number(String(first(b, ["total", "totalPrice", "total_price", "amount", "price", "المجموع", "السعر"]) || 0).replace(/[^\d.]/g, "")) || 0;
  const extra = {};
  let n = 0;
  for (const k of Object.keys(b)) {
    if (n >= 20) break;
    if (KNOWN.has(k.toLowerCase())) continue;
    const v = b[k];
    if (v === null || v === undefined || typeof v === "object") continue;
    extra[text(k, 40)] = text(v, 300);
    n++;
  }
  return {
    order: {
      id: String(++db.next),
      createdAt: new Date().toISOString(),
      name, phone,
      wilaya: text(first(b, ["wilaya", "state", "city", "الولاية"]), 40),
      product: text(first(b, ["product", "productName", "product_name", "المنتج"]), 100),
      total: Math.min(Math.max(total, 0), 10000000),
      payment: payKey(first(b, ["payment", "paymentMethod", "payment_method"]), true),
      status: "new", callResult: null, attempts: 0, note: "", forceSend: false,
      tracking: "", company: "", log: [], extra,
      hist: [{ s: "new", at: new Date().toISOString() }],
    },
  };
}

/* ---------- واتساب تلقائي للزبون (WhatsApp Cloud API من Meta) — يعمل فقط إذا ضُبطت المتغيرات ---------- */
const WA_TOKEN = process.env.WA_TOKEN || "", WA_PHONE_ID = process.env.WA_PHONE_ID || "";
const WA_LANG = process.env.WA_LANG || "ar";
const WA_TPL = { shipping: process.env.WA_TEMPLATE_SHIPPING || "", delivered: process.env.WA_TEMPLATE_DELIVERED || process.env.WA_TEMPLATE || "" };
const intlPhone = (p) => { const d = String(p || "").replace(/\D/g, ""); return /^0[567]\d{8}$/.test(d) ? "213" + d.slice(1) : ""; };
function notifyCustomer(o, kind) {
  try {
    const tpl = WA_TPL[kind], to = intlPhone(o.phone);
    if (!WA_TOKEN || !WA_PHONE_ID || !tpl || !to) return;
    o.waSent = o.waSent || {};
    if (o.waSent[kind]) return;
    o.waSent[kind] = new Date().toISOString();
    const body = { messaging_product: "whatsapp", to, type: "template", template: { name: tpl, language: { code: WA_LANG }, components: [{ type: "body", parameters: [{ type: "text", text: text(o.name, 60) || "-" }, { type: "text", text: String(o.id) }] }] } };
    fetch("https://graph.facebook.com/v20.0/" + encodeURIComponent(WA_PHONE_ID) + "/messages", { method: "POST", headers: { Authorization: "Bearer " + WA_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((r) => { if (!r.ok) { console.log("واتساب: فشل الإرسال للطلب " + o.id + " (" + r.status + ")"); o.waSent[kind] = ""; } })
      .catch(() => { console.log("واتساب: تعذّر الاتصال"); o.waSent[kind] = ""; });
  } catch { /* لا نكسر العملية */ }
}
/* الوقت المتوقع للوصول: أيام من تاريخ الشحن (أو من الطلب) — مكتب أقصر من المنزل */
function etaOf(o) {
  if (!o || ["delivered", "returned", "cancelled"].includes(o.status)) return null;
  const h = Array.isArray(o.hist) ? o.hist.find((x) => x.s === "shipping") : null;
  const from = Date.parse(h ? h.at : o.createdAt) || Date.now();
  const add = h ? (o.place === "office" ? [1, 3] : [2, 4]) : (o.place === "office" ? [2, 5] : [3, 6]);
  return { from: new Date(from + add[0] * 864e5).toISOString(), to: new Date(from + add[1] * 864e5).toISOString() };
}

function applyChanges(o, ch) {
  if (STATUSES.includes(ch.status)) {
    if (ch.status !== o.status) { o.hist = (Array.isArray(o.hist) ? o.hist : []).concat({ s: ch.status, at: new Date().toISOString() }).slice(-30); }
    const changed = ch.status !== o.status;
    o.status = ch.status;
    if (changed && (ch.status === "shipping" || ch.status === "delivered")) notifyCustomer(o, ch.status);
  }
  if (ch.callResult === null || CALLS.includes(ch.callResult)) o.callResult = ch.callResult;
  if (ch.attempts !== undefined) o.attempts = Math.max(0, Math.min(99, parseInt(ch.attempts, 10) || 0));
  if (payKey(ch.payment, false)) o.payment = payKey(ch.payment, false);
  if (ch.note !== undefined) o.note = text(ch.note, 500);
  if (ch.forceSend !== undefined) o.forceSend = !!ch.forceSend;
  if (ch.tracking !== undefined) o.tracking = String(ch.tracking).replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 40);
  if (db.companies.some((c) => c.id === ch.company && c.enabled)) o.company = ch.company;
  if (Array.isArray(ch.log)) {
    o.log = ch.log.slice(-50).map((l) => ({ at: Number(l && l.at) || Date.now(), text: text(l && l.text, 200) }));
  }
}

/* ---------- المنتجات ---------- */
const CATS = ["ساعات", "نظارات", "قبعات", "محافظ"];
const SKU_PREFIX = "ISD";
const SKU_CAT = { "ساعات": "WT", "نظارات": "GL", "قبعات": "HT", "محافظ": "WL" };
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 700 * 1024;
const MAX_PRODUCT_BODY = 6 * 1024 * 1024;
const UPLOAD_RE = /^\/api\/uploads\/([a-f0-9]{24}\.(?:jpg|png|webp))$/;

const removeFiles = (urls) => Promise.all((urls || []).map((u) => {
  const m = UPLOAD_RE.exec(u);
  return m ? fs.promises.unlink(path.join(UPLOAD_DIR, m[1])).catch(() => {}) : null;
}));

function imageKind(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.slice(0, 4).toString("latin1") === "RIFF" && buf.slice(8, 12).toString("latin1") === "WEBP") return "webp";
  return null;
}

/* يحفظ صورة data:URL بعد فحص البايتات والحجم. يرجع اسم الملف أو null */
async function saveDataImage(dataUrl, dir, maxBytes) {
  if (typeof dataUrl !== "string" || dataUrl.length > Math.ceil(maxBytes * 1.4) + 64) return null;
  const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const buf = Buffer.from(m[1], "base64");
  const kind = imageKind(buf);
  if (!kind || buf.length > maxBytes) return null;
  const file = crypto.randomBytes(12).toString("hex") + "." + kind;
  await fs.promises.writeFile(path.join(dir, file), buf);
  return file;
}
const MAX_RECEIPT_BYTES = 450 * 1024;

/* يتحقق من بيانات المنتج ويحفظ الصور الجديدة. الصور تُقبل فقط إن كانت فعلاً صوراً (فحص البايتات) */
async function buildProduct(b, existing) {
  const fail = async (error, created) => { await removeFiles(created); return { error }; };
  const created = [];
  const name = text(b.name, 80);
  if (name.length < 2) return fail("invalid_name", created);
  if (!CATS.includes(b.cat)) return fail("invalid_category", created);
  const price = Number(b.price);
  if (!Number.isFinite(price) || price <= 0 || price > 10000000) return fail("invalid_price", created);
  const old = b.old === undefined || b.old === null || b.old === "" ? 0 : Number(b.old);
  if (!Number.isFinite(old) || old < 0 || (old > 0 && old <= price)) return fail("invalid_old_price", created);
  const stock = Number(b.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return fail("invalid_stock", created);
  const input = Array.isArray(b.images) ? b.images : [];
  if (input.length > MAX_IMAGES) return fail("too_many_images", created);

  const keep = new Set(existing ? existing.images : []);
  const images = [];
  for (const it of input) {
    if (typeof it !== "string") return fail("bad_image", created);
    if (it.startsWith("/api/uploads/")) {
      if (!keep.has(it) || images.includes(it)) return fail("bad_image", created);
      images.push(it);
      continue;
    }
    const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(it);
    if (!m) return fail("bad_image", created);
    const buf = Buffer.from(m[1], "base64");
    const kind = imageKind(buf);
    if (!kind || buf.length > MAX_IMAGE_BYTES) return fail("bad_image", created);
    const file = crypto.randomBytes(12).toString("hex") + "." + kind;
    await fs.promises.writeFile(path.join(UPLOAD_DIR, file), buf);
    created.push("/api/uploads/" + file);
    images.push("/api/uploads/" + file);
  }
  return {
    created,
    fields: { name, desc: text(b.desc, 150), cat: b.cat, price: Math.round(price), old: Math.round(old), stock, images },
  };
}

function serveUpload(res, file) {
  const f = path.join(UPLOAD_DIR, file);
  if (!fs.existsSync(f)) return send(res, 404, { error: "not_found" });
  const ext = path.extname(file);
  res.writeHead(200, {
    "Content-Type": ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg",
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
  });
  fs.createReadStream(f).pipe(res);
}

/* ---------- HTTP ---------- */
function send(res, code, obj, extra = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  });
  res.end(body);
}

function readBody(req, max = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > max) { chunks.length = 0; reject(Object.assign(new Error("too_large"), { code: 413 })); req.removeAllListeners("data"); req.resume(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const j = raw ? JSON.parse(raw) : {};
        if (!j || typeof j !== "object" || Array.isArray(j)) throw new Error();
        resolve(j);
      } catch { reject(Object.assign(new Error("bad_json"), { code: 400 })); }
    });
    req.on("error", reject);
  });
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".mp4": "video/mp4", ".webm": "video/webm", ".gif": "image/gif", ".avif": "image/avif", ".xml": "application/xml" };

/* ملفات الواجهة: ضغط gzip (يُحفظ في الذاكرة) + تخزين مؤقت طويل للملفات ذات البصمة، ودائماً إعادة تحقق لـ index.html */
const zlib = require("zlib");
const gzCache = new Map(); // file -> { mtime, buf }
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".ico"]);
/* ---------- SEO: sitemap.xml و robots.txt وبيانات المنتج داخل الصفحة (يراها جوجل وفيسبوك وواتساب دون تشغيل JavaScript) ---------- */
const escH = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const baseUrlOf = (req) => {
  const host = String(req.headers.host || "localhost").replace(/[^A-Za-z0-9.:\-\[\]]/g, "").slice(0, 100) || "localhost";
  const xp = TRUST_PROXY ? String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() : "";
  const proto = xp === "https" || xp === "http" ? xp : SECURE_COOKIE ? "https" : "http";
  return proto + "://" + host;
};
const seoCache = { list: null, exp: 0, one: new Map() };
async function sbRows(query) {
  const base = ENV("REACT_APP_SUPABASE_URL").replace(/\/+$/, ""), key = ENV("REACT_APP_SUPABASE_ANON_KEY");
  if (!base || !key) return null;
  try { const r = await httpGetJson(base + "/rest/v1/watches?" + query, { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }, 6000); return Array.isArray(r) ? r : null; } catch { return null; }
}
async function allSlugs() {
  if (seoCache.list && seoCache.exp > Date.now()) return seoCache.list;
  const rows = await sbRows("select=slug&limit=1000");
  if (rows) { seoCache.list = rows.map((r) => r.slug).filter((x) => typeof x === "string" && SLUG_RE.test(x)); seoCache.exp = Date.now() + 10 * 60000; }
  return seoCache.list || [];
}
async function productSeo(slug) {
  const hit = seoCache.one.get(slug);
  if (hit && hit.exp > Date.now()) return hit.v;
  const rows = await sbRows("select=slug,name,bio,price,images&limit=1&slug=eq." + encodeURIComponent(slug));
  const r = rows && rows[0];
  const v = r ? { name: text(r.name, 100), desc: text(r.bio, 300), price: numFrom(r.price), image: Array.isArray(r.images) ? String(r.images[0] || "") : String(r.images || "") } : null;
  if (rows) { if (seoCache.one.size > 300) seoCache.one.clear(); seoCache.one.set(slug, { v, exp: Date.now() + 5 * 60000 }); }
  return v;
}
async function seoPage(req, res, html, slug) {
  const base = baseUrlOf(req), url = base + "/order/" + encodeURIComponent(slug);
  const pr = await productSeo(slug);
  if (!pr || !pr.name) return html;
  const title = `${pr.name} | ISD +213`;
  const desc = pr.desc || `${pr.name} — تسوق الآن من ISD +213، الدفع عند الاستلام والتوصيل لكل الولايات.`;
  const img = /^https?:\/\//i.test(pr.image) ? pr.image : "";
  const ld = { "@context": "https://schema.org", "@type": "Product", name: pr.name, description: desc, ...(img ? { image: [img] } : {}), offers: { "@type": "Offer", priceCurrency: "DZD", price: String(pr.price || 0), availability: "https://schema.org/InStock", url } };
  const tags = `<meta name="description" content="${escH(desc)}"><link rel="canonical" href="${escH(url)}"><meta property="og:type" content="product"><meta property="og:title" content="${escH(title)}"><meta property="og:description" content="${escH(desc)}"><meta property="og:url" content="${escH(url)}">${img ? `<meta property="og:image" content="${escH(img)}">` : ""}<meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  const head = `<title>${escH(title)}</title>${tags}</head>`;
  return html.replace(/<title>[\s\S]*?<\/title>/i, () => "").replace(/<meta name="description"[^>]*>/i, () => "").replace("</head>", () => head);
}

function serveStatic(req, res) {
  if (!fs.existsSync(BUILD_DIR)) { res.writeHead(404); res.end("Not found"); return; }
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { res.writeHead(400); res.end(); return; }
  let file = path.join(BUILD_DIR, path.normalize(p));
  if (!file.startsWith(BUILD_DIR + path.sep) && file !== BUILD_DIR) { res.writeHead(403); res.end(); return; }
  let st = null;
  try { st = fs.statSync(file); } catch { /* غير موجود */ }
  if (!st || st.isDirectory()) { file = path.join(BUILD_DIR, "index.html"); try { st = fs.statSync(file); } catch { res.writeHead(404); res.end("Not found"); return; } }
  const ext = path.extname(file);
  const hashed = /[\\/]static[\\/]/.test(file) && /\.[0-9a-f]{8}\./.test(path.basename(file));
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : (ext === ".html" || path.basename(file) === "sw.js") ? "no-cache" : "public, max-age=3600",
    "Vary": "Accept-Encoding",
  };
  const wantGz = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers["accept-encoding"] || "")) && st.size > 800 && st.size < 8e6;
  if (wantGz) {
    let c = gzCache.get(file);
    if (!c || c.mtime !== st.mtimeMs) {
      c = { mtime: st.mtimeMs, buf: zlib.gzipSync(fs.readFileSync(file), { level: 6 }) };
      if (gzCache.size > 300) gzCache.clear();
      gzCache.set(file, c);
    }
    res.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Content-Length": c.buf.length });
    res.end(req.method === "HEAD" ? undefined : c.buf);
    return;
  }
  /* الفيديو: آيفون/سفاري يشترط دعم Range (تشغيل جزئي) وإلا لا يعمل */
  if ((ext === ".mp4" || ext === ".webm") && req.headers.range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range));
    let start = m && m[1] !== "" ? Number(m[1]) : NaN, end = m && m[2] !== "" ? Number(m[2]) : NaN;
    if (m && Number.isNaN(start) && !Number.isNaN(end)) { start = Math.max(0, st.size - end); end = st.size - 1; }
    if (m && !Number.isNaN(start)) { if (Number.isNaN(end) || end >= st.size) end = st.size - 1; }
    if (!m || Number.isNaN(start) || start > end || start >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { ...headers, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
    if (req.method === "HEAD") return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, ...(ext === ".mp4" || ext === ".webm" ? { "Accept-Ranges": "bytes" } : {}), "Content-Length": st.size });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

/* ترويسات أمان على كل الردود: منع التضمين في إطار، منع تخمين النوع، عدم إرسال المرجع */
const SEC_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  ...(SECURE_COOKIE ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" } : {}),
};

const server = http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SEC_HEADERS)) res.setHeader(k, v);
  const method = req.method;
  let p = "/";
  try {
    /* أي رابط مشوّه (مثل //) يُرفض بدل أن يوقف الخادم */
    try { p = new URL(req.url, "http://x").pathname; } catch { res.writeHead(400); res.end(); return; }
    if (!p.startsWith("/api/")) {
      if (method !== "GET" && method !== "HEAD") { res.writeHead(405); res.end(); return; }
      if (p === "/robots.txt") {
        const body = `User-agent: *\nDisallow: /admin\nDisallow: /api/\nAllow: /\n\nSitemap: ${baseUrlOf(req)}/sitemap.xml\n`;
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }); return res.end(body);
      }
      if (p === "/sitemap.xml") {
        const base = baseUrlOf(req);
        const urls = ["/", "/track", ...(await allSlugs()).map((x) => "/order/" + encodeURIComponent(x))];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${escH(base + u)}</loc></url>`).join("\n")}\n</urlset>\n`;
        res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }); return res.end(body);
      }
      const pm = p.match(/^\/order\/([^/]+)$/);
      if (pm && fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
        let slug = ""; try { slug = decodeURIComponent(pm[1]); } catch { /* تجاهل */ }
        if (SLUG_RE.test(slug)) {
          const html = await seoPage(req, res, fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8"), slug).catch(() => null);
          if (html) { const buf = Buffer.from(html); res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": buf.length, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" }); return res.end(method === "HEAD" ? undefined : buf); }
        }
      }
      return serveStatic(req, res);
    }

    /* ---- طلب جديد من المتجر (عام) ---- */
    if (p === "/api/orders" && method === "POST") {
      if (limited("create:" + ipOf(req), 10, 60000)) return send(res, 429, { error: "too_many" });
      if (limited("create-all", 300, 3600e3)) return send(res, 429, { error: "too_many" });
      const declared = Number(req.headers["content-length"] || 0);
      if (declared > 640000) return send(res, 413, { error: "too_large" });
      const body = await readBody(req, 640000);
      /* الطلب العادي صغير؛ الحجم الكبير مسموح فقط لطلب يحمل صورة وصل */
      if (declared > 20000 && typeof body.receipt !== "string") return send(res, 413, { error: "too_large" });
      const r = Array.isArray(body.items) ? await buildStoreOrder(body) : buildOrder(body);
      if (r.error) return send(res, 400, { error: r.error });
      const dropReceipt = () => (r.order.receipt ? fs.promises.unlink(path.join(RECEIPT_DIR, r.order.receipt)).catch(() => {}) : null);
      /* نفس الرقم + نفس المنتج خلال 3 دقائق = ضغطة مكررة، لا نكرر الطلبية */
      const dup = db.orders.slice(-50).find((o) => o.phone === r.order.phone && o.product === r.order.product && Date.now() - Date.parse(o.createdAt) < 180000);
      if (dup) { db.next--; await dropReceipt(); return send(res, 201, { ok: true, id: dup.id }); }
      db.orders.push(r.order);
      db.leads.forEach((l) => { if (l.phone === r.order.phone && (l.status === "abandoned" || l.status === "contacted")) { l.status = "ordered"; l.orderId = r.order.id; } });
      try { await save(); } catch { db.orders.pop(); db.next--; await dropReceipt(); return send(res, 500, { error: "save_failed" }); }
      telegramSend(orderMessage(r.order)).catch(() => {});
      return send(res, 201, { ok: true, id: r.order.id, total: r.order.total, delivery: r.order.delivery });
    }

    /* ---- تقييمات الزبائن المنشورة (عام) ---- */
    if (p === "/api/reviews" && method === "GET") {
      const slug = new URL(req.url, "http://x").searchParams.get("product") || "";
      let list = db.reviews.filter((x) => x.published && !x.demo);
      if (slug) { if (!SLUG_RE.test(slug)) return send(res, 200, { reviews: [] }); list = list.filter((x) => x.product === slug); }
      return send(res, 200, { reviews: list.sort((a, b) => (a.order || 0) - (b.order || 0)).slice(slug ? -20 : 0, slug ? undefined : 30).map(publicReview) });
    }
    /* رأي من زبون تحت المنتج: يدخل «بانتظار الموافقة» ولا يظهر إلا بعد أن تنشره من الإدارة */
    if (p === "/api/reviews" && method === "POST") {
      if (limited("rv:" + ipOf(req), 3, 3600e3) || limited("rv-all", 100, 3600e3)) return send(res, 429, { error: "too_many" });
      if (Number(req.headers["content-length"] || 0) > 640000) return send(res, 413, { error: "too_large" });
      const b = await readBody(req, 640000);
      const slug = typeof b.product === "string" ? b.product : "";
      if (!SLUG_RE.test(slug)) return send(res, 400, { error: "invalid_product" });
      if (db.reviews.filter((x) => x.fromCustomer && !x.published).length >= 100) return send(res, 429, { error: "too_many" });
      const c = cleanReview(b, null);
      if (c.error) return send(res, 400, { error: c.error });
      let image = "";
      if (typeof b.image === "string" && b.image) {
        const f = await saveDataImage(b.image, UPLOAD_DIR, MAX_IMAGE_BYTES);
        if (!f) return send(res, 400, { error: "bad_image" });
        image = "/api/uploads/" + f;
      }
      const r = { id: String(++db.rnext), ...c.v, product: slug, ...(image ? { image } : {}), demo: false, published: false, fromCustomer: true, order: db.reviews.reduce((m, x) => Math.max(m, x.order || 0), -1) + 1, createdAt: nowIso() };
      db.reviews.push(r);
      try { await save(); } catch { db.reviews.pop(); db.rnext--; await removeFiles([image]); return send(res, 500, { error: "save_failed" }); }
      telegramSend(`⭐ رأي جديد بانتظار موافقتك\n${r.name}: ${r.text.slice(0, 120)}`).catch(() => {});
      return send(res, 201, { ok: true, pending: true });
    }

    /* ---- تتبع الطلب (عام): يلزم رقم الطلب + رقم الهاتف معاً حتى لا يمكن تخمين طلبات الآخرين ---- */
    if (p === "/api/track" && method === "GET") {
      if (limited("trk:" + ipOf(req), 20, 10 * 60000)) return send(res, 429, { error: "too_many" });
      const q = new URL(req.url, "http://x").searchParams;
      const id = String(q.get("id") || "").replace(/\D/g, "").slice(0, 9), phone = normPhone(String(q.get("phone") || "").slice(0, 20));
      const o = id && phone ? db.orders.find((x) => String(x.id) === id && normPhone(x.phone) === phone) : null;
      if (!o) return send(res, 404, { error: "no_order" });
      const co = (db.companies || []).find((c) => c.id === o.company);
      return send(res, 200, { id: o.id, status: o.status, createdAt: o.createdAt, total: o.total, wilaya: o.wilaya, items: (o.items || []).map((i) => ({ name: i.name, qty: i.qty, ...(i.color ? { color: i.color } : {}) })),
        ...(o.tracking ? { tracking: o.tracking, company: co ? co.name : "" } : {}), eta: etaOf(o), hist: (Array.isArray(o.hist) ? o.hist : []).map((h) => ({ s: h.s, at: h.at })), commune: o.commune || "", place: o.place || "", payment: o.payment || "cod", receipt: !!o.receipt });
    }

    /* ---- سلة غير مكتملة (عام): نحفظ رقم من بدأ الطلب ولم يكمله لتتواصل معه ---- */
    if (p === "/api/cart-leads" && method === "POST") {
      if (limited("lead:" + ipOf(req), 30, 3600e3) || limited("lead-all", 3000, 3600e3)) return send(res, 429, { error: "too_many" });
      const b = await readBody(req, 4000);
      const phone = normPhone(b.phone || "");
      if (!/^0[567]\d{8}$/.test(phone) || !Array.isArray(b.items) || !b.items.length) return send(res, 400, { error: "invalid" });
      const items = [];
      for (const it of b.items.slice(0, 10)) {
        if (!it || typeof it.slug !== "string" || !SLUG_RE.test(it.slug)) continue;
        items.push({ slug: it.slug, name: text(it.name, 100) || it.slug, qty: Math.max(1, Math.min(20, Math.round(Number(it.qty)) || 1)), ...(text(it.color, 30) ? { color: text(it.color, 30) } : {}) });
      }
      if (!items.length) return send(res, 400, { error: "invalid" });
      const ipHash = crypto.createHash("sha256").update("lead" + ipOf(req)).digest("hex").slice(0, 12);
      const now = nowIso();
      const open = db.leads.find((x) => x.phone === phone && (x.status === "abandoned" || x.status === "contacted"));
      if (open) { open.items = items; open.name = text(b.name, 80) || open.name; open.wilaya = text(b.wilaya, 40) || open.wilaya; open.updatedAt = now; open.hits = (open.hits || 1) + 1; open.ipHash = ipHash; }
      else {
        db.leads.push({ id: String(++db.lnext), phone, name: text(b.name, 80), wilaya: text(b.wilaya, 40), items, status: "abandoned", note: "", ipHash, hits: 1, createdAt: now, updatedAt: now });
        const cutoff = Date.now() - 60 * 86400e3;
        db.leads = db.leads.filter((x) => Date.parse(x.updatedAt) > cutoff).slice(-1000);
      }
      save().catch(() => {});
      return send(res, 200, { ok: true });
    }

    /* ---- دخول الإدارة ---- */
    if (p === "/api/admin/login" && method === "POST") {
      if (limited("login:" + ipOf(req), 8, 15 * 60000)) return send(res, 429, { error: "too_many" });
      const b = await readBody(req, 2000);
      if (typeof b.password !== "string" || b.password.length > 200) return send(res, 401, { error: "unauthorized" });
      const email = text(b.email, 254).toLowerCase();
      let sess = null;
      if (!email) {
        if (ownerOk(b.password)) sess = { uid: "owner", role: "owner", name: db.settings.ownerName, email: "" };
      } else {
        if (limited("login-e:" + email, 8, 15 * 60000)) return send(res, 429, { error: "too_many" });
        const m = db.team.find((x) => x.email === email);
        const ok = checkPw(b.password, m ? m.pw : DUMMY);
        if (m && ok && m.status === "active") {
          sess = { uid: m.id, role: m.role, name: m.name, email: m.email };
          m.lastLogin = nowIso();
          save().catch(() => {});
        }
      }
      if (!sess) return send(res, 401, { error: "unauthorized" });
      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, { ...sess, exp: Date.now() + SESSION_MS });
      return send(res, 200, { ok: true }, {
        "Set-Cookie": `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${SECURE_COOKIE ? "; Secure" : ""}`,
      });
    }

    /* ---- المنتجات للمتجر (عام، قراءة فقط) وصور المنتجات ---- */
    if (p === "/api/products" && method === "GET") return send(res, 200, { products: db.products });
    const um = p.match(/^\/api\/uploads\/([a-f0-9]{24}\.(?:jpg|png|webp))$/);
    if (um && method === "GET") return serveUpload(res, um[1]);

    /* ---- معلومات المتجر وطرق الدفع المفعّلة (عام، قراءة فقط) ---- */
    if (p === "/api/store-settings" && method === "GET") {
      const pay = Object.entries(db.settings.payments).filter(([, v]) => v.enabled).map(([k, v]) => ({ key: k, label: PAY_KEYS[k], details: v.details }));
      const rates = {};
      for (const [k, v] of Object.entries(db.settings.rates)) rates[k] = [v.home, v.office];
      const px = db.settings.pixels || {};
      const pixels = { fb: /^\d{8,20}$/.test(px.fb || "") ? px.fb : "", tiktok: /^[A-Za-z0-9]{6,32}$/.test(px.tiktok || "") ? px.tiktok : "" };
      return send(res, 200, { storeName: db.settings.storeName, phone: db.settings.phone, payments: pay, rates, pixels });
    }

    /* ---- كل ما بعده للإدارة فقط ---- */
    if (!p.startsWith("/api/admin/")) return send(res, 404, { error: "not_found" });
    const S = sessionOf(req);
    if (!S) return send(res, 401, { error: "unauthorized" });
    /* حماية CSRF: الكوكي SameSite=Strict + ترويسة مخصصة مطلوبة لكل تعديل */
    if (method !== "GET" && req.headers["x-requested-with"] !== "XMLHttpRequest") return send(res, 403, { error: "forbidden" });

    if (p === "/api/admin/logout" && method === "POST") {
      sessions.delete(cookieOf(req, "sid"));
      return send(res, 200, { ok: true }, { "Set-Cookie": "sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }
    /* الصلاحيات حسب الدور: الخادم هو الحكم، وإخفاء القوائم في الواجهة للراحة فقط */
    const area = (p.startsWith("/api/admin/orders") || p.startsWith("/api/admin/receipts")) ? "orders" : p.startsWith("/api/admin/products") ? "products"
      : p.startsWith("/api/admin/team") ? "team" : (p.startsWith("/api/admin/settings") || p.startsWith("/api/admin/rates") || p.startsWith("/api/admin/notify")) ? "settings" : p.startsWith("/api/admin/reviews") ? "reviews" : p.startsWith("/api/admin/leads") ? "orders"
        : p.startsWith("/api/admin/companies") && method !== "GET" ? "delivery" : null;
    if (area && !ROLE_PERMS[S.role].includes(area)) return send(res, 403, { error: "forbidden" });
    const isMgr = S.role === "owner" || S.role === "manager";
    const failSave = async (undo) => { undo(); return send(res, 500, { error: "save_failed" }); };

    if (p === "/api/admin/me" && method === "GET") {
      const email = S.uid === "owner" ? "" : S.email;
      return send(res, 200, { id: S.uid, name: S.uid === "owner" ? db.settings.ownerName : S.name, email, role: S.role, perms: ROLE_PERMS[S.role], storeName: db.settings.storeName });
    }
    if (p === "/api/admin/me" && method === "PATCH") {
      const name = text((await readBody(req, 2000)).name, 60);
      if (name.length < 2) return send(res, 400, { error: "invalid_name" });
      if (S.uid === "owner") { const old = db.settings.ownerName; db.settings.ownerName = name; try { await save(); } catch { return failSave(() => { db.settings.ownerName = old; }); } }
      else { const m = db.team.find((x) => x.id === S.uid); if (!m) return send(res, 404, { error: "not_found" }); const old = m.name; m.name = name; try { await save(); } catch { return failSave(() => { m.name = old; }); } }
      for (const v of sessions.values()) if (v.uid === S.uid) v.name = name;
      return send(res, 200, { ok: true });
    }
    /* تغيير كلمة السر: للمالك والمدير فقط، وتتطلب الكلمة الحالية */
    if (p === "/api/admin/password" && method === "POST") {
      if (!isMgr) return send(res, 403, { error: "forbidden" });
      if (limited("pw:" + S.uid, 6, 15 * 60000)) return send(res, 429, { error: "too_many" });
      const b = await readBody(req, 2000);
      if (typeof b.current !== "string" || typeof b.next !== "string") return send(res, 400, { error: "bad_request" });
      if (b.next.length < 12 || b.next.length > 100) return send(res, 400, { error: "weak_password" });
      if (b.next === b.current) return send(res, 400, { error: "same_password" });
      if (S.uid === "owner") {
        if (!ownerOk(b.current)) return send(res, 400, { error: "wrong_password" });
        const old = db.auth.owner; db.auth.owner = hashPw(b.next);
        try { await save(); } catch { return failSave(() => { db.auth.owner = old; }); }
      } else {
        const m = db.team.find((x) => x.id === S.uid);
        if (!m || !checkPw(b.current, m.pw)) return send(res, 400, { error: "wrong_password" });
        const old = m.pw; m.pw = hashPw(b.next);
        try { await save(); } catch { return failSave(() => { m.pw = old; }); }
      }
      const keep = cookieOf(req, "sid");
      for (const [k, v] of sessions) if (v.uid === S.uid && k !== keep) sessions.delete(k);
      return send(res, 200, { ok: true });
    }

    /* ---- شركات التوصيل ---- */
    if (p === "/api/admin/companies" && method === "GET") return send(res, 200, { companies: db.companies.map((c) => companyView(c, isMgr)) });
    const cleanCompany = (b, cur) => {
      const f = {};
      if (b.name !== undefined || !cur) { f.name = text(b.name, 40); if (f.name.length < 2) return { error: "invalid_name" }; if (db.companies.some((c) => c !== cur && c.name.toLowerCase() === f.name.toLowerCase())) return { error: "duplicate_name" }; }
      if (b.apiUrl !== undefined) { const u = text(b.apiUrl, 200); if (u && !/^https:\/\/[^\s/]+(\/\S*)?$/.test(u)) return { error: "invalid_url" }; f.apiUrl = u; }
      if (b.apiId !== undefined) f.apiId = text(b.apiId, 80);
      if (b.apiToken !== undefined && String(b.apiToken).trim() !== "") { const t = String(b.apiToken).trim(); if (t.length > 300 || /\s/.test(t)) return { error: "invalid_token" }; f.apiToken = t; }
      if (b.clearToken === true) f.apiToken = "";
      if (b.enabled !== undefined) f.enabled = !!b.enabled;
      if (b.isDefault !== undefined) f.isDefault = !!b.isDefault;
      return { f };
    };
    const fixDefault = () => {
      const en = db.companies.filter((c) => c.enabled);
      const defs = en.filter((c) => c.isDefault);
      db.companies.forEach((c) => { if (!c.enabled) c.isDefault = false; });
      if (defs.length > 1) defs.slice(1).forEach((c) => { c.isDefault = false; });
      if (!defs.length && en.length) en[0].isDefault = true;
    };
    if (p === "/api/admin/companies" && method === "POST") {
      if (db.companies.length >= 30) return send(res, 400, { error: "too_many_companies" });
      const r = cleanCompany(await readBody(req, 5000), null);
      if (r.error) return send(res, 400, { error: r.error });
      const c = { id: "c" + crypto.randomBytes(4).toString("hex"), enabled: true, isDefault: false, apiUrl: "", apiId: "", apiToken: "", ...r.f, updatedAt: nowIso() };
      const snap = JSON.stringify(db.companies);
      if (c.isDefault) db.companies.forEach((x) => { x.isDefault = false; });
      db.companies.push(c); fixDefault();
      try { await save(); } catch { return failSave(() => { db.companies = JSON.parse(snap); }); }
      return send(res, 201, { ok: true, id: c.id });
    }
    const cm = p.match(/^\/api\/admin\/companies\/([a-z0-9_-]{1,30})$/);
    if (cm && (method === "PATCH" || method === "DELETE")) {
      const c = db.companies.find((x) => x.id === cm[1]);
      if (!c) return send(res, 404, { error: "not_found" });
      const snap = JSON.stringify(db.companies);
      if (method === "DELETE") {
        if (db.orders.some((o) => o.company === c.id)) return send(res, 409, { error: "in_use" });
        db.companies.splice(db.companies.indexOf(c), 1); fixDefault();
      } else {
        const r = cleanCompany(await readBody(req, 5000), c);
        if (r.error) return send(res, 400, { error: r.error });
        if (r.f.isDefault) db.companies.forEach((x) => { x.isDefault = false; });
        Object.assign(c, r.f, { updatedAt: nowIso() }); fixDefault();
      }
      try { await save(); } catch { return failSave(() => { db.companies = JSON.parse(snap); }); }
      return send(res, 200, { ok: true });
    }

    /* ---- الفريق ---- */
    if (p === "/api/admin/team" && method === "GET") return send(res, 200, { members: [ownerView(), ...db.team.map(memberView)], me: S.uid });
    const cleanMember = (b, cur) => {
      const f = {};
      if (b.name !== undefined || !cur) { f.name = text(b.name, 60); if (f.name.length < 2) return { error: "invalid_name" }; }
      if (b.email !== undefined || !cur) { f.email = text(b.email, 254).toLowerCase(); if (!EMAIL_RE.test(f.email)) return { error: "invalid_email" }; if (db.team.some((m) => m !== cur && m.email === f.email)) return { error: "duplicate_email" }; }
      if (b.role !== undefined || !cur) { if (!["manager", "agent"].includes(b.role)) return { error: "invalid_role" }; f.role = b.role; }
      if (b.status !== undefined) { if (!["active", "disabled"].includes(b.status)) return { error: "invalid_status" }; f.status = b.status; }
      if (b.password !== undefined && b.password !== "") { if (typeof b.password !== "string" || b.password.length < 12 || b.password.length > 100) return { error: "weak_password" }; f.pw = hashPw(b.password); }
      else if (!cur) return { error: "weak_password" };
      return { f };
    };
    if (p === "/api/admin/team" && method === "POST") {
      if (db.team.length >= 50) return send(res, 400, { error: "too_many_members" });
      const r = cleanMember(await readBody(req, 5000), null);
      if (r.error) return send(res, 400, { error: r.error });
      if (r.f.role === "manager" && S.role !== "owner") return send(res, 403, { error: "forbidden" });
      const m = { id: "u" + crypto.randomBytes(5).toString("hex"), status: "active", createdAt: nowIso(), lastLogin: "", ...r.f };
      db.team.push(m);
      try { await save(); } catch { return failSave(() => { db.team.pop(); }); }
      return send(res, 201, { ok: true, id: m.id });
    }
    const tm = p.match(/^\/api\/admin\/team\/([a-z0-9]{1,20})$/);
    if (tm && (method === "PATCH" || method === "DELETE")) {
      const m = db.team.find((x) => x.id === tm[1]);
      if (!m) return send(res, 404, { error: "not_found" });
      if (m.role === "manager" && S.role !== "owner") return send(res, 403, { error: "forbidden" });
      if (m.id === S.uid && method === "DELETE") return send(res, 400, { error: "cannot_delete_self" });
      const snap = JSON.stringify(db.team);
      if (method === "DELETE") {
        db.team.splice(db.team.indexOf(m), 1);
      } else {
        const r = cleanMember(await readBody(req, 5000), m);
        if (r.error) return send(res, 400, { error: r.error });
        if (r.f.role === "manager" && S.role !== "owner") return send(res, 403, { error: "forbidden" });
        if (m.id === S.uid && (r.f.status === "disabled" || (r.f.role && r.f.role !== m.role))) return send(res, 400, { error: "cannot_change_self" });
        Object.assign(m, r.f);
      }
      try { await save(); } catch { return failSave(() => { db.team = JSON.parse(snap); }); }
      dropSessions(m.id);
      return send(res, 200, { ok: true });
    }


    /* ---- أسعار التوصيل لكل ولاية ---- */
    if (p === "/api/admin/rates" && method === "GET") return send(res, 200, { rates: db.settings.rates, defaults: DEFAULT_RATES });
    if (p === "/api/admin/rates" && method === "PATCH") {
      const b = await readBody(req, 20000);
      if (!b.rates || typeof b.rates !== "object" || Array.isArray(b.rates)) return send(res, 400, { error: "invalid_rates" });
      const next = JSON.parse(JSON.stringify(db.settings.rates));
      for (const [k, v] of Object.entries(b.rates)) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULT_RATES, k) || !v || typeof v !== "object") return send(res, 400, { error: "invalid_rates" });
        const home = Number(v.home);
        const office = v.office === null || v.office === "" ? null : Number(v.office);
        if (!Number.isInteger(home) || home < 0 || home > 20000) return send(res, 400, { error: "invalid_rates" });
        if (office !== null && (!Number.isInteger(office) || office < 0 || office > 20000)) return send(res, 400, { error: "invalid_rates" });
        next[k] = { home, office };
      }
      const old = db.settings.rates; db.settings.rates = next;
      try { await save(); } catch { return failSave(() => { db.settings.rates = old; }); }
      return send(res, 200, { ok: true });
    }

    /* ---- إشعار تيليغرام + بكسل الإعلانات ---- */
    if (p === "/api/admin/notify" && method === "GET") {
      const c = telegramCreds();
      return send(res, 200, { telegramToken: !!c.token, telegramChatId: c.chatId, fromEnv: !!(ENV("TELEGRAM_BOT_TOKEN") || ENV("TELEGRAM_CHAT_ID")), pixels: db.settings.pixels });
    }
    if (p === "/api/admin/notify" && method === "PATCH") {
      const b = await readBody(req, 4000);
      const snap = JSON.stringify({ t: db.settings.telegram, p: db.settings.pixels });
      if (b.telegramToken !== undefined) {
        const v = String(b.telegramToken).trim();
        if (v && !/^\d{5,12}:[A-Za-z0-9_-]{30,60}$/.test(v)) return send(res, 400, { error: "invalid_token" });
        db.settings.telegram.token = v;
      }
      if (b.telegramChatId !== undefined) {
        const v = String(b.telegramChatId).trim();
        if (v && !/^-?\d{4,20}$/.test(v)) return send(res, 400, { error: "invalid_chat" });
        db.settings.telegram.chatId = v;
      }
      if (b.fb !== undefined) {
        const v = String(b.fb).trim();
        if (v && !/^\d{8,20}$/.test(v)) { const o = JSON.parse(snap); db.settings.telegram = o.t; db.settings.pixels = o.p; return send(res, 400, { error: "invalid_fb" }); }
        db.settings.pixels.fb = v;
      }
      if (b.tiktok !== undefined) {
        const v = String(b.tiktok).trim();
        if (v && !/^[A-Za-z0-9]{6,32}$/.test(v)) { const o = JSON.parse(snap); db.settings.telegram = o.t; db.settings.pixels = o.p; return send(res, 400, { error: "invalid_tiktok" }); }
        db.settings.pixels.tiktok = v;
      }
      try { await save(); } catch { return failSave(() => { const o = JSON.parse(snap); db.settings.telegram = o.t; db.settings.pixels = o.p; }); }
      return send(res, 200, { ok: true });
    }
    if (p === "/api/admin/notify/test" && method === "POST") {
      if (limited("tg-test", 10, 60000)) return send(res, 429, { error: "too_many" });
      const ok = await telegramSend("✅ اختبار: إشعارات الطلبات تعمل على متجرك.");
      return send(res, ok ? 200 : 502, { ok });
    }

    /* ---- السلات المتروكة (إدارة) ---- */
    if (p === "/api/admin/leads" && method === "GET") {
      const phones = {}; const ips = {};
      db.leads.forEach((l) => { (ips[l.ipHash] = ips[l.ipHash] || new Set()).add(l.phone); });
      db.orders.forEach((o) => { const e = phones[o.phone] = phones[o.phone] || { delivered: 0, bad: 0 }; if (o.status === "delivered") e.delivered++; if (o.status === "returned" || o.status === "cancelled") e.bad++; });
      const now = Date.now();
      const list = db.leads.map((l) => {
        const why = [];
        if (/^(\d)\1{9}$/.test(l.phone) || /(\d)\1{5,}/.test(l.phone) || /0123456|1234567|7654321/.test(l.phone)) why.push("رقم يبدو وهمياً");
        if (l.name && (l.name.length < 3 || /\d/.test(l.name) || /^(.)\1+$/.test(l.name))) why.push("اسم غير منطقي");
        if (ips[l.ipHash] && ips[l.ipHash].size >= 3) why.push("عدة أرقام من نفس الجهاز");
        const h = phones[l.phone] || { delivered: 0, bad: 0 };
        if (h.bad > 0) why.push(`سبق أن ألغى/أرجع ${h.bad} طلبية`);
        const ageMin = Math.max(0, Math.round((now - Date.parse(l.updatedAt)) / 60000));
        const state = l.status;
        return { ...l, ipHash: undefined, state, ageMin, suspicious: why, trusted: h.delivered > 0 && !why.length };
      }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
      return send(res, 200, { leads: list });
    }
    const lm = p.match(/^\/api\/admin\/leads\/(\d{1,9})$/);
    if (lm && (method === "PATCH" || method === "DELETE")) {
      const i = db.leads.findIndex((x) => x.id === lm[1]);
      if (i < 0) return send(res, 404, { error: "not_found" });
      const old = JSON.stringify(db.leads);
      if (method === "DELETE") db.leads.splice(i, 1);
      else {
        const b = await readBody(req, 2000);
        if (b.status !== undefined) { if (!["abandoned", "contacted", "ignored", "ordered"].includes(b.status)) return send(res, 400, { error: "invalid" }); db.leads[i].status = b.status; }
        if (b.note !== undefined) db.leads[i].note = text(b.note, 300);
      }
      try { await save(); } catch { return failSave(() => { db.leads = JSON.parse(old); }); }
      return send(res, 200, { ok: true });
    }

    /* ---- تقييمات الزبائن (إدارة) ---- */
    if (p === "/api/admin/reviews" && method === "GET") return send(res, 200, { reviews: [...db.reviews].sort((a, b) => (a.order || 0) - (b.order || 0)) });
    if (p === "/api/admin/reviews" && method === "POST") {
      const b = await readBody(req, 640000);
      if (db.reviews.length >= 200) return send(res, 400, { error: "too_many_items" });
      const c = cleanReview(b, null);
      if (c.error) return send(res, 400, { error: c.error });
      let image = "";
      if (typeof b.image === "string" && b.image) {
        const f = await saveDataImage(b.image, UPLOAD_DIR, MAX_IMAGE_BYTES);
        if (!f) return send(res, 400, { error: "bad_image" });
        image = "/api/uploads/" + f;
      }
      const r = { id: String(++db.rnext), ...c.v, ...(image ? { image } : {}), demo: false, published: b.published !== false, order: db.reviews.reduce((m, x) => Math.max(m, x.order || 0), -1) + 1, createdAt: nowIso() };
      db.reviews.push(r);
      try { await save(); } catch { await removeFiles([image]); return failSave(() => { db.reviews.pop(); db.rnext--; }); }
      return send(res, 201, { ok: true, review: r });
    }
    const rm = p.match(/^\/api\/admin\/reviews\/(\d{1,9})$/);
    if (rm && (method === "PATCH" || method === "DELETE")) {
      const i = db.reviews.findIndex((x) => x.id === rm[1]);
      if (i < 0) return send(res, 404, { error: "not_found" });
      const old = JSON.stringify(db.reviews);
      const oldImage = db.reviews[i].image || "";
      let newImage = null, dropOld = false;
      if (method === "DELETE") { db.reviews.splice(i, 1); dropOld = true; }
      else {
        const b = await readBody(req, 640000);
        const c = cleanReview(b, db.reviews[i]);
        if (c.error) return send(res, 400, { error: c.error });
        if (typeof b.image === "string") {
          if (b.image === "") { newImage = ""; dropOld = true; }
          else if (b.image.startsWith("data:")) {
            const f = await saveDataImage(b.image, UPLOAD_DIR, MAX_IMAGE_BYTES);
            if (!f) return send(res, 400, { error: "bad_image" });
            newImage = "/api/uploads/" + f; dropOld = true;
          }
        }
        Object.assign(db.reviews[i], c.v);
        if (newImage !== null) { if (newImage) db.reviews[i].image = newImage; else delete db.reviews[i].image; }
        if (b.published !== undefined) db.reviews[i].published = !!b.published;
        /* المثال التجريبي لا يُنشر أبداً إلا بعد أن يؤكد المالك أنه تقييم حقيقي */
        if (b.real === true) db.reviews[i].demo = false;
        if (db.reviews[i].demo) db.reviews[i].published = false;
      }
      try { await save(); } catch { if (newImage) await removeFiles([newImage]); return failSave(() => { db.reviews = JSON.parse(old); }); }
      if (dropOld && oldImage) await removeFiles([oldImage]);
      return send(res, 200, { ok: true });
    }
    if (p === "/api/admin/reviews/move" && method === "POST") {
      const b = await readBody(req, 500);
      const list = [...db.reviews].sort((a, b2) => (a.order || 0) - (b2.order || 0));
      const i = list.findIndex((x) => x.id === String(b.id)); const j = i + (b.dir === "up" ? -1 : b.dir === "down" ? 1 : 0);
      if (i < 0 || j < 0 || j >= list.length || i === j) return send(res, 400, { error: "invalid" });
      const old = JSON.stringify(db.reviews);
      list.forEach((x, k) => { x.order = k; });
      const t = list[i].order; list[i].order = list[j].order; list[j].order = t;
      try { await save(); } catch { return failSave(() => { db.reviews = JSON.parse(old); }); }
      return send(res, 200, { ok: true });
    }

    /* ---- الإعدادات (معلومات المتجر + طرق الدفع) ---- */
    if (p === "/api/admin/settings" && method === "GET") {
      const { storeName, phone, email, address, payments } = db.settings;
      return send(res, 200, { storeName, phone, email, address, payments });
    }
    if (p === "/api/admin/settings" && method === "PATCH") {
      const b = await readBody(req, 10000);
      const snap = JSON.stringify(db.settings);
      const st = db.settings;
      if (b.storeName !== undefined) { const v = text(b.storeName, 60); if (v.length < 2) return send(res, 400, { error: "invalid_name" }); st.storeName = v; }
      if (b.phone !== undefined) { const v = text(b.phone, 20); if (v && !/^[0-9+ ]{8,20}$/.test(v)) return send(res, 400, { error: "invalid_phone" }); st.phone = v; }
      if (b.email !== undefined) { const v = text(b.email, 254).toLowerCase(); if (v && !EMAIL_RE.test(v)) return send(res, 400, { error: "invalid_email" }); st.email = v; }
      if (b.address !== undefined) st.address = text(b.address, 200);
      if (b.payments && typeof b.payments === "object") {
        for (const k of Object.keys(PAY_KEYS)) {
          const v = b.payments[k];
          if (!v || typeof v !== "object") continue;
          if (v.enabled !== undefined) st.payments[k].enabled = !!v.enabled;
          if (v.details !== undefined) st.payments[k].details = text(v.details, 200);
        }
        if (!Object.values(st.payments).some((x) => x.enabled)) { db.settings = JSON.parse(snap); return send(res, 400, { error: "need_one_payment" }); }
      }
      try { await save(); } catch { return failSave(() => { db.settings = JSON.parse(snap); }); }
      return send(res, 200, { ok: true });
    }

    const rcm = p.match(/^\/api\/admin\/receipts\/([a-f0-9]{24}\.(?:jpg|png|webp))$/);
    if (rcm && method === "GET") {
      const f = path.join(RECEIPT_DIR, rcm[1]);
      if (!RECEIPT_RE.test(rcm[1]) || !fs.existsSync(f)) return send(res, 404, { error: "not_found" });
      const ext = path.extname(rcm[1]);
      res.writeHead(200, { "Content-Type": ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" });
      fs.createReadStream(f).pipe(res);
      return;
    }
    if (p === "/api/admin/orders" && method === "GET") {
      return send(res, 200, { orders: db.orders.slice(-2000) });
    }
    if (p === "/api/admin/orders" && method === "POST") {
      const r = buildOrder(await readBody(req));
      if (r.error) return send(res, 400, { error: r.error });
      db.orders.push(r.order);
      try { await save(); } catch { db.orders.pop(); db.next--; return send(res, 500, { error: "save_failed" }); }
      return send(res, 201, { ok: true, id: r.order.id });
    }
    if (p === "/api/admin/products" && method === "GET") return send(res, 200, { products: db.products });
    if (p === "/api/admin/products" && method === "POST") {
      const r = await buildProduct(await readBody(req, MAX_PRODUCT_BODY), null);
      if (r.error) return send(res, 400, { error: r.error });
      const id = String(++db.pnext);
      const product = {
        id, sku: `${SKU_PREFIX}-${SKU_CAT[r.fields.cat]}${id.padStart(3, "0")}`,
        createdAt: new Date().toISOString(), ...r.fields,
      };
      db.products.push(product);
      try { await save(); } catch { db.products.pop(); db.pnext--; await removeFiles(r.created); return send(res, 500, { error: "save_failed" }); }
      return send(res, 201, { ok: true, id });
    }
    const pm = p.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (pm && (method === "PATCH" || method === "DELETE")) {
      const product = db.products.find((x) => x.id === decodeURIComponent(pm[1]));
      if (!product) return send(res, 404, { error: "not_found" });
      if (method === "DELETE") {
        const idx = db.products.indexOf(product);
        db.products.splice(idx, 1);
        try { await save(); } catch { db.products.splice(idx, 0, product); return send(res, 500, { error: "save_failed" }); }
        await removeFiles(product.images);
        return send(res, 200, { ok: true });
      }
      const r = await buildProduct(await readBody(req, MAX_PRODUCT_BODY), product);
      if (r.error) return send(res, 400, { error: r.error });
      const before = JSON.stringify(product);
      const dropped = product.images.filter((u) => !r.fields.images.includes(u));
      Object.assign(product, r.fields);
      try { await save(); } catch { Object.assign(product, JSON.parse(before)); await removeFiles(r.created); return send(res, 500, { error: "save_failed" }); }
      await removeFiles(dropped);
      return send(res, 200, { ok: true });
    }
    const m = p.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (m && method === "PATCH") {
      const o = db.orders.find((x) => x.id === decodeURIComponent(m[1]));
      if (!o) return send(res, 404, { error: "not_found" });
      const before = JSON.stringify(o);
      applyChanges(o, await readBody(req, 30000));
      try { await save(); } catch { Object.keys(o).forEach((k) => delete o[k]); Object.assign(o, JSON.parse(before)); return send(res, 500, { error: "save_failed" }); }
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: "not_found" });
  } catch (e) {
    if (res.headersSent) return;
    return send(res, e && e.code === 413 ? 413 : e && e.code === 400 ? 400 : 500, { error: e && e.code ? e.message : "server_error" });
  }
});

/* مهلات تمنع الاتصالات البطيئة (Slowloris) من استهلاك الخادم */
server.headersTimeout = 15000;
server.requestTimeout = 30000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 50;
server.on("clientError", (_e, socket) => { if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"); else socket.destroy(); });
/* خطأ غير متوقع لا يجب أن يوقف المتجر */
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e && e.message));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e && e.message));

server.listen(PORT, HOST, () => console.log(`✓ الخادم يعمل على http://localhost:${PORT}`));
