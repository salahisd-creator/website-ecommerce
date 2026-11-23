/* =========================================================
   pixels.jsx  ←  src/pixels.jsx
   بيكسل فيسبوك وتيك توك. لا يُحمَّل شيء إلا إذا أدخلتَ المعرّف في لوحة الإدارة.
   لا نرسل اسم الزبون ولا هاتفه — فقط: المنتج، السعر، العملة.
   ========================================================= */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "./settings";

const FB_RE = /^\d{8,20}$/;
const TT_RE = /^[A-Za-z0-9]{6,32}$/;

function loadFb(id) {
  if (window.fbq) return;
  const f = window;
  const n = (f.fbq = function () { if (n.callMethod) n.callMethod.apply(n, arguments); else n.queue.push(arguments); });
  if (!f._fbq) f._fbq = n;
  n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  const s = document.createElement("script");
  s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", id);
}

function loadTt(id) {
  if (window.ttq) return;
  const t = "ttq";
  const q = (window[t] = window[t] || []);
  q.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enable", "disable", "load"];
  q.setAndDefer = (o, m) => { o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
  q.methods.forEach((m) => q.setAndDefer(q, m));
  q.instance = (n) => { const e = (q._i && q._i[n]) || []; q.methods.forEach((m) => q.setAndDefer(e, m)); return e; };
  q.load = (e, n) => {
    const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    q._i = q._i || {}; q._i[e] = []; q._i[e]._u = src;
    q._t = q._t || {}; q._t[e] = +new Date();
    q._o = q._o || {}; q._o[e] = n || {};
    const s = document.createElement("script");
    s.async = true; s.src = src + "?sdkid=" + encodeURIComponent(e) + "&lib=" + t;
    document.head.appendChild(s);
  };
  q.load(id);
}

/* حدث موحّد: track("AddToCart", { id, name, value, qty }) */
let armed = false;          // صار البيكسل جاهزاً (أو تأكدنا أنه غير مفعّل)
const pending = [];         // أحداث وقعت قبل وصول الإعدادات من الخادم
export function track(event, d = {}) {
  if (!armed) { if (pending.length < 20) pending.push([event, d]); return; }
  send(event, d);
}
function send(event, d) {
  try {
    const value = Number(d.value) || 0;
    const content_ids = d.ids || (d.id ? [String(d.id)] : []);
    const contents = d.contents || (d.id ? [{ id: String(d.id), quantity: d.qty || 1 }] : []);
    if (typeof window.fbq === "function") {
      const fbEvent = event === "CompletePayment" ? "Purchase" : event;
      window.fbq("track", fbEvent, { value, currency: "DZD", content_ids, content_type: "product", contents });
    }
    if (window.ttq && typeof window.ttq.track === "function") {
      const tt = event === "Purchase" ? "CompletePayment" : event;
      window.ttq.track(tt, { value, currency: "DZD", content_type: "product", contents: contents.map((c) => ({ content_id: c.id, quantity: c.quantity })) });
    }
  } catch { /* لا نكسر المتجر بسبب أداة تتبع */ }
}

export default function Pixels() {
  const { pixels, ready } = useStoreSettings();
  const { pathname } = useLocation();
  const sent = useRef({ fb: "", tt: "" });
  const fbOk = FB_RE.test(pixels.fb);
  const ttOk = TT_RE.test(pixels.tiktok);

  useEffect(() => { if (fbOk) loadFb(pixels.fb); }, [fbOk, pixels.fb]);
  useEffect(() => { if (ttOk) loadTt(pixels.tiktok); }, [ttOk, pixels.tiktok]);

  /* PageView: مرة عند أول تحميل، ثم مرة عند كل تنقّل إلى صفحة جديدة */
  useEffect(() => {
    try {
      if (fbOk && sent.current.fb !== pathname && typeof window.fbq === "function") { window.fbq("track", "PageView"); sent.current.fb = pathname; }
      if (ttOk && sent.current.tt !== pathname && window.ttq && window.ttq.page) { window.ttq.page(); sent.current.tt = pathname; }
    } catch { /* تجاهل */ }
  }, [pathname, fbOk, ttOk]);
  /* بعد تحميل البيكسل: أرسل الأحداث التي سبقت وصول الإعدادات */
  useEffect(() => {
    if (!ready) return;
    armed = true;
    while (pending.length) { const [e, d] = pending.shift(); send(e, d); }
  }, [ready, fbOk, ttOk]);

  return null;
}
