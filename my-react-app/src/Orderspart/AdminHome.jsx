/* =========================================================
   AdminHome.jsx  ←  ضعه في: src/admin/AdminHome.jsx
   الصفحة الرئيسية — المسار: /admin
   لوحة إحصائيات: الطلبيات، التأكيد، التوصيل، المقارنة بالفترة السابقة، تحديد التاريخ.
   ========================================================= */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, normalize } from "./api";
import { MANAGE_PATH, REFRESH_MS, TRACK_PATH, USE_SAMPLE } from "./config";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { breakdown, daysIn, niceMax, pctDelta, prevRange, ptsDelta, rangeOf, series, summarize, ymd } from "./stats";
import { Icon } from "./ui";

const PRESETS = [
  { key: "today", label: "اليوم" },
  { key: "7", label: "7 أيام" },
  { key: "30", label: "30 يوماً" },
  { key: "month", label: "هذا الشهر" },
  { key: "90", label: "90 يوماً" },
  { key: "custom", label: "فترة مخصصة" },
];
const C = { orders: "#F0B429", delivered: "#2DBE7E", prev: "#9AA0B4", returned: "#E5534B" };
const STATUS_COLORS = [
  ["new", "جديدة", "#EF9F27"], ["confirmed", "مؤكدة", "#378ADD"], ["shipping", "قيد التوصيل", "#7F77DD"],
  ["delivered", "مُسلَّمة", "#2DBE7E"], ["returned", "مرتجعة", "#E5534B"], ["cancelled", "ملغاة", "#9AA0B4"],
];
const money = (n) => Math.round(n).toLocaleString("en-US");
const fmtShort = (d) => d.toLocaleDateString("ar-DZ", { day: "numeric", month: "short" });

/* ---------- مؤشر + مقارنة ---------- */
function Delta({ v, unit = "%", inverse }) {
  if (v === null || v === undefined) return <span className="hdl na">—</span>;
  if (v === 0) return <span className="hdl na">0{unit}</span>;
  const good = inverse ? v < 0 : v > 0;
  return <span className={`hdl ${good ? "up" : "down"}`} aria-label={`${good ? "تحسّن" : "تراجع"} ${Math.abs(v)}${unit}`}>{v > 0 ? "▲" : "▼"} {Math.abs(v)}{unit}</span>;
}

function Kpi({ icon, tone, label, value, sub, delta, compare }) {
  return (
    <div className="hk">
      <span className="hki" style={{ background: tone[0], color: tone[1] }}><Icon name={icon} size={22} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <span className="hkl">{label}</span>
        <b className="hkn">{value}</b>
        <span className="hks">{sub}</span>
      </div>
      {compare && delta}
    </div>
  );
}

/* ---------- رسم: أعمدة الطلبيات + خط المُسلَّمة + الفترة السابقة (منقّط) ---------- */
function TrendChart({ cur, prev, compare }) {
  const W = 760, H = 260, L = 34, R = 10, T = 14, B = 30;
  const n = cur.buckets.length;
  const vals = [...cur.buckets.map((b) => b.orders), ...(compare && prev ? prev.buckets.map((b) => b.orders) : [])];
  const max = niceMax(Math.max(1, ...vals));
  const iw = W - L - R, ih = H - T - B;
  const bw = iw / n;
  const x = (i) => L + bw * i + bw / 2;
  const y = (v) => T + ih - (v / max) * ih;
  const line = (arr, key) => arr.map((b, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(b[key]).toFixed(1)}`).join(" ");
  const every = Math.ceil(n / 8);
  const label = (b) => (cur.step === 1 ? fmtShort(b.start) : fmtShort(b.start));
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  return (
    <svg className="hch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="الطلبيات والمسلَّمة عبر الفترة">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="hgrid" />
          <text x={L - 6} y={y(t) + 4} textAnchor="end" className="htx">{Math.round(t)}</text>
        </g>
      ))}
      {cur.buckets.map((b, i) => (
        <g key={i}>
          <rect x={x(i) - Math.max(2, bw * 0.34)} width={Math.max(4, bw * 0.68)} y={y(b.orders)} height={Math.max(0, T + ih - y(b.orders))} rx="3" fill={C.orders} opacity="0.9">
            <title>{`${fmtShort(b.start)}${cur.step > 1 ? " – " + fmtShort(b.end) : ""}: ${b.orders} طلبية، ${b.delivered} مسلَّمة`}</title>
          </rect>
          {i % every === 0 && <text x={x(i)} y={H - 8} textAnchor="middle" className="htx">{label(b)}</text>}
        </g>
      ))}
      {compare && prev && <path d={line(prev.buckets, "orders")} className="hprev" />}
      <path d={line(cur.buckets, "delivered")} className="hline" />
      {cur.buckets.map((b, i) => (b.delivered > 0 ? <circle key={i} cx={x(i)} cy={y(b.delivered)} r="3.2" fill={C.delivered} /> : null))}
    </svg>
  );
}

function Donut({ by, total }) {
  const R = 54, CIRC = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 160 160" className="hdn" role="img" aria-label="توزيع الحالات">
      <circle cx="80" cy="80" r={R} fill="none" strokeWidth="22" className="hdt" />
      {total > 0 && STATUS_COLORS.map(([k, , col]) => {
        const v = by[k] || 0;
        if (!v) return null;
        const len = (v / total) * CIRC;
        const el = <circle key={k} cx="80" cy="80" r={R} fill="none" stroke={col} strokeWidth="22" strokeDasharray={`${len} ${CIRC - len}`} strokeDashoffset={-acc} transform="rotate(-90 80 80)" />;
        acc += len;
        return el;
      })}
      <text x="80" y="78" textAnchor="middle" className="hdv">{total}</text>
      <text x="80" y="98" textAnchor="middle" className="htx">طلبية</text>
    </svg>
  );
}

function Bars({ rows, color, empty, valueOf, labelOf, subOf }) {
  if (!rows.length) return <div className="muted" style={{ padding: "18px 0" }}>{empty}</div>;
  const max = Math.max(1, ...rows.map(valueOf));
  return (
    <div className="hbs">
      {rows.map((r) => (
        <div key={r.key} className="hb">
          <div className="hbt"><span className="hbn">{labelOf(r)}</span><b>{valueOf(r)}</b></div>
          <div className="hbr"><i style={{ width: `${(valueOf(r) / max) * 100}%`, background: color }} /></div>
          {subOf && <div className="hbs2">{subOf(r)}</div>}
        </div>
      ))}
    </div>
  );
}

export default function AdminHome() {
  const { lock } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [preset, setPreset] = useState("30");
  const todayStr = ymd(new Date());
  const [from, setFrom] = useState(() => ymd(new Date(Date.now() - 29 * 86400e3)));
  const [to, setTo] = useState(todayStr);
  const [compare, setCompare] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (USE_SAMPLE) { setLoading(false); return; }
    try {
      const [o, c] = await Promise.all([api("/admin/orders"), api("/admin/companies").catch(() => null)]);
      if (!mounted.current) return;
      setOrders((Array.isArray(o && o.orders) ? o.orders : []).map(normalize).filter((x) => x.id));
      if (c && Array.isArray(c.companies)) setCompanies(c.companies);
      setLoadError("");
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { lock(); return; }
      setLoadError("تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    } finally { if (mounted.current) setLoading(false); }
  }, [lock]);

  useEffect(() => {
    mounted.current = true;
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, REFRESH_MS * 2);
    return () => { mounted.current = false; clearInterval(t); };
  }, [load]);

  const range = useMemo(() => rangeOf(preset, from, to), [preset, from, to]);
  const prev = useMemo(() => prevRange(range), [range]);
  const cur = useMemo(() => summarize(orders, range), [orders, range]);
  const old = useMemo(() => summarize(orders, prev), [orders, prev]);
  const serCur = useMemo(() => series(orders, range), [orders, range]);
  const serPrev = useMemo(() => series(orders, prev), [orders, prev]);
  const nameOfCompany = useCallback((id) => (companies.find((c) => c.id === id) || {}).name || id, [companies]);
  const byCompany = useMemo(() => breakdown(orders.filter((o) => ["shipping", "delivered", "returned"].includes(o.status)), range, (o) => o.company, 8), [orders, range]);
  const byProduct = useMemo(() => breakdown(orders, range, (o) => o.product, 6), [orders, range]);
  const byWilaya = useMemo(() => breakdown(orders, range, (o) => o.wilaya, 6), [orders, range]);
  const days = daysIn(range);

  const pickPreset = (k) => {
    setPreset(k);
    const r = rangeOf(k, from, to);
    if (k !== "custom") { setFrom(ymd(r.from)); setTo(ymd(r.to)); }
  };

  const pct = (v) => (v === null ? "—" : `${Math.round(v)}%`);

  return (
    <Layout hideSearch newCount={orders.filter((o) => o.status === "new").length}>
      <style>{HCSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><span>لوحة التحكم</span><span>/</span><span>الإحصائيات</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />الإحصائيات</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            {range.from.toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" })}
            {days > 1 && <> — {range.to.toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" })}</>}
            {" "}· {days} {days === 1 ? "يوم" : "أيام"}
          </div>
        </div>
      </div>

      {/* اختيار الفترة */}
      <section className="hfl">
        <div className="chips" role="group" aria-label="الفترة">
          {PRESETS.map((p) => <button key={p.key} className={`fc${preset === p.key ? " on" : ""}`} aria-pressed={preset === p.key} onClick={() => pickPreset(p.key)}>{p.label}</button>)}
        </div>
        <div className="hdr" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label>من <input type="date" className="inp" value={from} max={todayStr} onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }} /></label>
          <label>إلى <input type="date" className="inp" value={to} max={todayStr} onChange={(e) => { setTo(e.target.value); setPreset("custom"); }} /></label>
        </div>
        <label className="hcp"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />مقارنة بالفترة السابقة ({days} {days === 1 ? "يوم" : "أيام"} قبلها)</label>
      </section>

      {loadError && <div className="alert r">{loadError} <button className="chip" style={{ minHeight: 34 }} onClick={load}>إعادة المحاولة</button></div>}
      {loading && <div className="empty">جارٍ التحميل...</div>}

      {!loading && (
        <>
          <section className="hks5">
            <Kpi icon="bag" tone={["#FFF1CC", "#B07A00"]} label="إجمالي الطلبيات" value={cur.total} sub={`${cur.by.new} بانتظار التأكيد`}
              compare={compare} delta={<Delta v={pctDelta(cur.total, old.total)} />} />
            <Kpi icon="check" tone={["#DCEBFF", "#1D4A8A"]} label="نسبة التأكيد" value={pct(cur.confirmRate)} sub={`${cur.confirmed} طلبية مؤكدة`}
              compare={compare} delta={<Delta v={ptsDelta(cur.confirmRate, old.confirmRate)} unit=" نقطة" />} />
            <Kpi icon="truck" tone={["#DDF3E8", "#14633F"]} label="نسبة التسليم" value={pct(cur.deliveryRate)} sub={`${cur.by.delivered} مسلَّمة · ${cur.by.shipping} قيد التوصيل`}
              compare={compare} delta={<Delta v={ptsDelta(cur.deliveryRate, old.deliveryRate)} unit=" نقطة" />} />
            <Kpi icon="alert" tone={["#FBE0DE", "#9B2C25"]} label="نسبة الإرجاع" value={pct(cur.returnRate)} sub={`${cur.by.returned} مرتجعة`}
              compare={compare} delta={<Delta v={ptsDelta(cur.returnRate, old.returnRate)} unit=" نقطة" inverse />} />
            <Kpi icon="trend" tone={["#E6E0F7", "#4B3A8C"]} label="مبيعات مسلَّمة (دج)" value={money(cur.revenue)} sub={`متوسط الطلبية ${money(cur.avg)} دج`}
              compare={compare} delta={<Delta v={pctDelta(cur.revenue, old.revenue)} />} />
          </section>

          <section className="hcd">
            <div className="hch-h">
              <b>الطلبيات {serCur.step === 1 ? "يوماً بيوم" : "أسبوعاً بأسبوع"}</b>
              <div className="hlg">
                <span><i style={{ background: C.orders }} />طلبيات</span>
                <span><i style={{ background: C.delivered }} />مسلَّمة</span>
                {compare && <span><i className="dash" />الفترة السابقة</span>}
              </div>
            </div>
            {cur.total === 0 && old.total === 0 ? <div className="empty muted">لا توجد طلبيات في هذه الفترة.</div> : <TrendChart cur={serCur} prev={serPrev} compare={compare} />}
          </section>

          <div className="hg2">
            <section className="hcd">
              <b>حالات الطلبيات</b>
              <div className="hdw">
                <Donut by={cur.by} total={cur.total} />
                <ul className="hlst">
                  {STATUS_COLORS.map(([k, label, col]) => (
                    <li key={k}><i style={{ background: col }} /><span>{label}</span><b>{cur.by[k]}</b>
                      <small>{cur.total ? Math.round((cur.by[k] / cur.total) * 100) : 0}%</small></li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="hcd">
              <b>شركات التوصيل <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>(الطلبيات المرسلة)</span></b>
              {byCompany.length === 0 ? <div className="muted" style={{ padding: "18px 0" }}>لم تُرسل أي طلبية في هذه الفترة.</div> : (
                <div className="hct">
                  <div className="hcr hh"><span>الشركة</span><span>مرسلة</span><span>مسلَّمة</span><span>مرتجعة</span><span>النجاح</span></div>
                  {byCompany.map((c) => (
                    <div key={c.key} className="hcr">
                      <span className="hbn">{nameOfCompany(c.key)}</span><b>{c.count}</b><span>{c.delivered}</span><span>{c.returned}</span>
                      <span className={`hpl ${c.rate === null ? "na" : c.rate >= 70 ? "ok" : "bad"}`}>{c.rate === null ? "—" : c.rate + "%"}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="hg2">
            <section className="hcd">
              <b>أكثر المنتجات طلباً</b>
              <Bars rows={byProduct} color={C.orders} empty="لا توجد بيانات." valueOf={(r) => r.count} labelOf={(r) => r.key} subOf={(r) => `${money(r.total)} دج`} />
            </section>
            <section className="hcd">
              <b>أكثر الولايات طلباً</b>
              <Bars rows={byWilaya} color="#378ADD" empty="لا توجد بيانات." valueOf={(r) => r.count} labelOf={(r) => r.key}
                subOf={(r) => (r.rate === null ? "لا نتائج توصيل بعد" : `نسبة التسليم ${r.rate}%`)} />
            </section>
          </div>

          <section className="hcd">
            <b>اختصارات</b>
            <div className="hsc">
              <Link to={TRACK_PATH} className="chip lnk"><Icon name="radar" size={16} />تتبع الطلبيات</Link>
              <Link to={MANAGE_PATH} className="chip lnk"><Icon name="list" size={16} />إدارة الطلبيات</Link>
              <Link to="/admin/products" className="chip lnk"><Icon name="tag" size={16} />المنتجات</Link>
              <Link to="/admin/delivery" className="chip lnk"><Icon name="truck" size={16} />التوصيل</Link>
              <Link to="/admin/team" className="chip lnk"><Icon name="shield" size={16} />الفريق</Link>
              <Link to="/admin/settings" className="chip lnk"><Icon name="gear" size={16} />الإعدادات</Link>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}

const HCSS = `
.hfl{display:flex;gap:12px 16px;flex-wrap:wrap;align-items:center}
.hdr{display:flex;gap:10px;flex-wrap:wrap}.hdr label{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px}.hdr .inp{min-height:40px}
.hcp{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px;margin-inline-start:auto;cursor:pointer}.hcp input{width:18px;height:18px}
.hks5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
.hk{display:flex;align-items:flex-start;gap:12px;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);position:relative;min-width:0}
.hki{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;flex:none}
.hkl{display:block;font-size:13px;color:var(--mut);font-weight:600}.hkn{display:block;font-size:26px;font-weight:800;line-height:1.2}.hks{display:block;font-size:12.5px;color:var(--mut)}
.hdl{position:absolute;top:12px;inset-inline-start:12px;font-size:12px;font-weight:700;border-radius:99px;padding:2px 8px;white-space:nowrap}
.hdl.up{background:#DDF3E8;color:#14633F}.hdl.down{background:#FBE0DE;color:#9B2C25}.hdl.na{background:var(--soft);color:var(--mut)}
.adm[data-theme=dark] .hdl.up{background:#173B2A;color:#7FD8A8}.adm[data-theme=dark] .hdl.down{background:#3D1F1D;color:#F09A94}
.hcd{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);padding:18px;min-width:0}
.hcd>b{display:block;font-size:16px;margin-bottom:10px}
.hch-h{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}.hch-h>b{font-size:16px}
.hlg{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--mut);font-weight:600}.hlg span{display:inline-flex;align-items:center;gap:6px}
.hlg i{width:12px;height:12px;border-radius:3px;display:inline-block}.hlg i.dash{background:none;border-top:2px dashed #9AA0B4;height:0;width:16px;border-radius:0}
.hch{width:100%;height:auto;direction:ltr;display:block}
.hgrid{stroke:var(--line2);stroke-width:1}.htx{fill:var(--mut);font-size:11px;font-family:inherit}
.hline{fill:none;stroke:#2DBE7E;stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
.hprev{fill:none;stroke:#9AA0B4;stroke-width:2;stroke-dasharray:5 4}
.hg2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.hdw{display:flex;align-items:center;gap:20px;flex-wrap:wrap}.hdn{width:170px;height:170px;flex:none}
.hdt{stroke:var(--line2)}.hdv{fill:var(--ink);font-size:28px;font-weight:800;font-family:inherit}
.hlst{list-style:none;margin:0;padding:0;flex:1;min-width:170px;display:flex;flex-direction:column;gap:8px}
.hlst li{display:flex;align-items:center;gap:8px;font-size:14px}.hlst i{width:12px;height:12px;border-radius:3px;flex:none}.hlst span{flex:1}.hlst small{color:var(--mut);width:38px;text-align:left}
.hct{display:flex;flex-direction:column}
.hcr{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(4,minmax(0,1fr));gap:8px;align-items:center;padding:10px 0;border-top:1px solid var(--line2);font-size:14px}
.hcr.hh{border-top:0;color:var(--mut);font-size:12.5px;font-weight:700;padding-top:0}
.hpl{font-weight:700;border-radius:99px;padding:2px 10px;text-align:center;justify-self:start}
.hpl.ok{background:#DDF3E8;color:#14633F}.hpl.bad{background:#FBE0DE;color:#9B2C25}.hpl.na{background:var(--soft);color:var(--mut)}
.hbs{display:flex;flex-direction:column;gap:12px}
.hbt{display:flex;justify-content:space-between;gap:10px;font-size:14px}.hbn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.hbr{height:10px;background:var(--soft);border-radius:99px;overflow:hidden;margin-top:5px;border:1px solid var(--line2)}.hbr i{display:block;height:100%;border-radius:99px}
.hbs2{font-size:12.5px;color:var(--mut);margin-top:3px}
.hsc{display:flex;gap:8px;flex-wrap:wrap}
@media(max-width:1280px){.hks5{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:980px){.hg2{grid-template-columns:1fr}.hks5{grid-template-columns:repeat(2,minmax(0,1fr))}.hcp{margin-inline-start:0}}
@media(max-width:520px){.hks5{grid-template-columns:1fr}}
`;
