/* =========================================================
   Customers.jsx  ←  src/Orderspart/Customers.jsx
   صفحة «العملاء» — المسار: /admin/customers
   قائمة الزبائن (مجمّعة برقم الهاتف) مع طرق الدفع لكل طلبية.
   ========================================================= */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthError, HttpError, loadOrders } from "./api";
import { STATUS } from "./config";
import { useAdmin } from "./context";
import { dateOf, fmtPhone, money, normPhone, payOf, PAYMENTS, shortId } from "./helpers";
import Layout from "./Layout";
import { Pill } from "./ui";

const PayPill = ({ o }) => {
  const p = payOf(o);
  return <span className="pill" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
};

const CSS = `
.cu-top{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.cu-top .inp{flex:1;min-width:220px}
.cu-sum{display:flex;gap:8px;flex-wrap:wrap}
.cu-card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);overflow:hidden}
.cu-card summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:1.6fr 1fr 1fr 1.4fr;gap:12px;align-items:center;padding:14px 16px}
.cu-card summary::-webkit-details-marker{display:none}
.cu-card[open] summary{background:var(--soft)}
.cu-name{font-weight:800;font-size:16px}
.cu-l{display:block;color:var(--mut);font-size:12px}
.cu-pays{display:flex;gap:6px;flex-wrap:wrap}
.cu-ord{display:grid;grid-template-columns:90px 1.4fr 1fr 1.3fr 1fr;gap:10px;align-items:center;padding:10px 16px;border-top:1px solid var(--line2);font-size:14px}
@media (max-width:820px){.cu-card summary{grid-template-columns:1fr 1fr}.cu-ord{grid-template-columns:1fr 1fr}}
`;

export default function Customers() {
  const { lock } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setOrders(await loadOrders());
      setErr("");
    } catch (e) {
      if (e instanceof AuthError) { lock(); return; }
      setErr(e instanceof HttpError ? `تعذّر تحميل الزبائن (الرمز ${e.status}).` : "تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    } finally {
      setLoading(false);
    }
  }, [lock]);
  useEffect(() => { load(); }, [load]);

  const customers = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const k = normPhone(o.phone) || "؟" + o.id;
      const c = m.get(k) || { key: k, name: o.name, phone: o.phone, wilaya: o.wilaya, orders: [], total: 0 };
      c.orders.push(o);
      if (!["cancelled", "returned"].includes(o.status)) c.total += o.total;
      m.set(k, c);
    }
    const list = [...m.values()];
    for (const c of list) c.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.sort((a, b) => new Date(b.orders[0].createdAt) - new Date(a.orders[0].createdAt));
  }, [orders]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter((c) => [c.name, c.phone, normPhone(c.phone), c.wilaya].join(" ").toLowerCase().includes(t));
  }, [customers, q]);

  const payCount = useMemo(() => {
    const r = {};
    for (const o of orders) r[o.payment || "cod"] = (r[o.payment || "cod"] || 0) + 1;
    return r;
  }, [orders]);

  return (
    <Layout hideSearch>
      <style>{CSS}</style>
      <h1 className="h1"><span className="gb" />العملاء</h1>

      <div className="cu-top">
        <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الهاتف أو الولاية…" aria-label="بحث في العملاء" maxLength={60} />
        <div className="cu-sum">
          <span className="pill" style={{ background: "var(--soft)", color: "var(--ink)" }}>{customers.length} زبون</span>
          {Object.keys(PAYMENTS).filter((k) => payCount[k]).map((k) => (
            <span key={k} className="pill" style={{ background: PAYMENTS[k].bg, color: PAYMENTS[k].color }}>{PAYMENTS[k].short}: {payCount[k]}</span>
          ))}
        </div>
      </div>

      {err && <div className="alert r" role="alert">{err} <button className="chip" onClick={load}>إعادة المحاولة</button></div>}
      {loading && <div className="empty muted">جاري التحميل…</div>}
      {!loading && !err && shown.length === 0 && <div className="empty muted">{q ? "لا نتائج مطابقة" : "لا يوجد زبائن بعد"}</div>}

      {shown.map((c) => {
        const pays = [...new Set(c.orders.map((o) => o.payment || "cod"))];
        return (
          <details key={c.key} className="cu-card">
            <summary>
              <div>
                <span className="cu-name">{c.name || "—"}</span>
                <span className="cu-l" dir="ltr" style={{ textAlign: "right" }}>{fmtPhone(c.phone)} · {c.wilaya}</span>
              </div>
              <div><span className="cu-l">الطلبيات</span><b>{c.orders.length}</b></div>
              <div><span className="cu-l">المجموع</span><b>{money(c.total)}</b></div>
              <div><span className="cu-l">الدفع</span>
                <div className="cu-pays">{pays.map((k) => <PayPill key={k} o={{ payment: k }} />)}</div>
              </div>
            </summary>
            {c.orders.map((o) => (
              <div key={o.id} className="cu-ord">
                <b>#{shortId(o.id)}</b>
                <span>{o.product || "—"}</span>
                <span>{money(o.total)}</span>
                <PayPill o={o} />
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Pill s={STATUS[o.status] || STATUS.new} /><span className="muted" dir="ltr">{dateOf(o.createdAt)}</span>
                </span>
              </div>
            ))}
          </details>
        );
      })}
    </Layout>
  );
}
