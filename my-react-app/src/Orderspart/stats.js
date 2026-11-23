/* =========================================================
   stats.js  ←  ضعه في: src/admin/stats.js
   حسابات الإحصائيات (دوال صافية بلا واجهة): الفترات، المؤشرات، السلاسل الزمنية، التفصيل.
   ========================================================= */
const DAY = 86400e3;
export const CONFIRMED_SET = ["confirmed", "shipping", "delivered", "returned"];

export const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d, n) => { const x = dayStart(d); x.setDate(x.getDate() + n); return x; };
export const ymd = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const parseYmd = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d) ? null : d;
};
export const daysIn = (r) => Math.round((r.to - r.from) / DAY) + 1;

/* الفترة: from و to يومان كاملان (شاملان). preset: today | 7 | 30 | 90 | month | custom */
export function rangeOf(preset, customFrom, customTo, now = new Date()) {
  const today = dayStart(now);
  if (preset === "today") return { from: today, to: today };
  if (preset === "month") return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
  if (preset === "custom") {
    let a = parseYmd(customFrom), b = parseYmd(customTo);
    if (!a || !b) return rangeOf("30", "", "", now);
    if (a > b) [a, b] = [b, a];
    if (b > today) b = today;
    if (a > b) a = b;
    if ((b - a) / DAY > 365) a = addDays(b, -365);
    return { from: a, to: b };
  }
  const n = Number(preset) || 30;
  return { from: addDays(today, -(n - 1)), to: today };
}
export function prevRange(r) {
  const n = daysIn(r);
  return { from: addDays(r.from, -n), to: addDays(r.from, -1) };
}
export const inRange = (o, r) => {
  const t = new Date(o.createdAt).getTime();
  return t >= r.from.getTime() && t < r.to.getTime() + DAY;
};

export function summarize(orders, r) {
  const list = orders.filter((o) => inRange(o, r));
  const by = { new: 0, confirmed: 0, shipping: 0, delivered: 0, returned: 0, cancelled: 0 };
  let revenue = 0, pipeline = 0;
  for (const o of list) {
    if (by[o.status] !== undefined) by[o.status]++;
    if (o.status === "delivered") revenue += o.total;
    if (o.status !== "cancelled") pipeline += o.total;
  }
  const total = list.length;
  const confirmed = list.filter((o) => CONFIRMED_SET.includes(o.status)).length;
  const handled = total - by.new;
  const finished = by.delivered + by.returned;
  return {
    total, by, confirmed, revenue, pipeline,
    confirmRate: handled > 0 ? (confirmed / handled) * 100 : null,
    deliveryRate: finished > 0 ? (by.delivered / finished) * 100 : null,
    returnRate: finished > 0 ? (by.returned / finished) * 100 : null,
    avg: total - by.cancelled > 0 ? Math.round(pipeline / (total - by.cancelled)) : 0,
  };
}

/* نسبة التغيّر. للنسب المئوية نستعمل الفرق بالنقاط */
export const pctDelta = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : cur ? null : 0);
export const ptsDelta = (cur, prev) => (cur === null || prev === null ? null : Math.round(cur - prev));

/* سلسلة زمنية: يومية، وأسبوعية إن زادت الفترة عن 62 يوماً */
export function series(orders, r) {
  const n = daysIn(r);
  const step = n > 62 ? 7 : 1;
  const buckets = [];
  for (let i = 0; i < n; i += step) {
    buckets.push({ start: addDays(r.from, i), end: addDays(r.from, Math.min(i + step, n) - 1), orders: 0, delivered: 0, returned: 0 });
  }
  for (const o of orders) {
    if (!inRange(o, r)) continue;
    const idx = Math.floor(Math.round((dayStart(o.createdAt) - r.from) / DAY) / step);
    const b = buckets[idx];
    if (!b) continue;
    b.orders++;
    if (o.status === "delivered") b.delivered++;
    if (o.status === "returned") b.returned++;
  }
  return { step, buckets };
}

/* تفصيل حسب مفتاح (ولاية، منتج، شركة): العدد + المسلّم + المرتجع + المبلغ */
export function breakdown(orders, r, keyOf, limit = 6) {
  const m = new Map();
  for (const o of orders) {
    if (!inRange(o, r)) continue;
    const k = keyOf(o);
    if (!k) continue;
    let e = m.get(k);
    if (!e) { e = { key: k, count: 0, delivered: 0, returned: 0, total: 0 }; m.set(k, e); }
    e.count++;
    e.total += o.total;
    if (o.status === "delivered") e.delivered++;
    if (o.status === "returned") e.returned++;
  }
  return [...m.values()]
    .map((e) => ({ ...e, rate: e.delivered + e.returned > 0 ? Math.round((e.delivered / (e.delivered + e.returned)) * 100) : null }))
    .sort((a, b) => b.count - a.count || b.total - a.total)
    .slice(0, limit);
}

/* سقف «لطيف» لمحور الرسم */
export function niceMax(v) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 4, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}
