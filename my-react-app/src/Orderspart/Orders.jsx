/* =========================================================
   Orders.jsx  ←  ضعه في: src/admin/Orders.jsx
   ملف الطلبيات المشترك: منطق الطلبيات (تحميل، حفظ، تكرار، إرسال لشركة التوصيل)
   + النوافذ (التفاصيل، الإرسال، إضافة طلب) + أجزاء الجدول.
   تستعمله صفحتا «تتبع الطلبات» (Tracking.jsx) و«إدارة الطلبات» (Manage.jsx).
   ========================================================= */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { USE_SAMPLE, REFRESH_MS, PAGE_SIZE, COMPANIES, STATUS, CALLS, TIER, SORTS } from "./config";
import { api, AuthError, HttpError, normalize, loadOrders, saveOrder, createOrder, sendToDelivery } from "./api";
import { normPhone, dateOf, shortId, canShip, findDuplicates, customerStats, series, csvCell, money, validPhone, fmtPhone, timeOf, wa, TEMPLATES, payOf } from "./helpers";
import { Icon, Pill, Timeline, Dropdown } from "./ui";
import { useAdmin } from "./context";

export default function useOrders(manage) {
  const navigate = useNavigate();
  const { state: navState, key: locKey } = useLocation();
  const { lock: onLock } = useAdmin();
  /* شركات التوصيل من الخادم (صفحة «التوصيل»). القائمة الافتراضية احتياطاً فقط */
  const [companies, setCompanies] = useState(() => COMPANIES.map((c) => ({ id: c.key, name: c.label, enabled: true, isDefault: c.key === COMPANIES[0].key })));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const [openKey, setOpenKey] = useState(null);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const lock = useRef(new Set());   // يمنع الإرسال المزدوج
  const saving = useRef(0);         // عدد عمليات الحفظ الجارية (لا نحدّث أثناءها)
  const mounted = useRef(true);
  const toastTimer = useRef(null);

  const notify = (t) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };

  /* ---------- التحميل والتحديث التلقائي ---------- */
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const list = await loadOrders();
      if (!mounted.current) return;
      setOrders(list); setLoadError(""); setUpdatedAt(new Date());
      notify("تم التحديث ✓ (" + list.length + " طلبية)");
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { onLock(); return; }
      setLoadError("تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
      notify("فشل التحديث");
    } finally { if (mounted.current) { setRefreshing(false); setLoading(false); } }
  };
  const reload = async () => {
    if (lock.current.size || saving.current > 0) return; // لا نحدّث أثناء الإرسال أو الحفظ
    try {
      const list = await loadOrders();
      if (!mounted.current) return;
      setOrders(list);
      setLoadError("");
      setUpdatedAt(new Date());
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { onLock(); return; }
      setLoadError(e instanceof HttpError ? `تعذّر تحميل الطلبيات (الرمز ${e.status}).` : "تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  useEffect(() => {
    mounted.current = true;
    reload();
    if (!USE_SAMPLE) {
      api("/admin/companies").then((d) => { if (mounted.current && d && Array.isArray(d.companies) && d.companies.length) setCompanies(d.companies); }).catch(() => {});
    }
    const t = setInterval(() => { if (!document.hidden) reload(); }, REFRESH_MS);
    return () => { mounted.current = false; clearInterval(t); clearTimeout(toastTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* إغلاق القوائم المنسدلة بالضغط خارجها أو بزر Escape */
  useEffect(() => {
    const close = () => setOpenKey(null);
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    document.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", close); window.removeEventListener("keydown", onKey); };
  }, []);

  /* عند التنقل بين الصفحتين نصفّر التصفية والتحديد */
  useEffect(() => {
    setFilter("all"); setSelected([]); setSheet(false); setOpenKey(null); setPage(1);
  }, [manage]);
  /* فتح طلبية محددة قادمة من صفحة التتبع */
  useEffect(() => {
    const f = navState && navState.focus;
    if (f) { setFilter("all"); setQuery(""); setActive(String(f)); setSheet(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locKey]);
  useEffect(() => { setPage(1); }, [filter, query, sort]);

  /* ---------- مشتقات ---------- */
  const dup = useMemo(() => findDuplicates(orders), [orders]);
  const viewOf = useCallback((o) => (dup[o.id] && o.status === "new" ? "duplicate" : o.status), [dup]);
  const statsByPhone = useMemo(() => {
    const m = {};
    for (const o of orders) {
      const p = normPhone(o.phone);
      if (!m[p]) m[p] = customerStats(orders, o.phone);
    }
    return m;
  }, [orders]);
  const statsOf = useCallback((o) => statsByPhone[normPhone(o.phone)] || customerStats([], o.phone), [statsByPhone]);
  const isRisk = useCallback((o) => statsOf(o).tier === "risk" && ["new", "confirmed"].includes(o.status), [statsOf]);

  const countOf = (s) => orders.filter((o) => viewOf(o) === s).length;
  const newCount = countOf("new");
  const riskCount = orders.filter(isRisk).length;

  const sp = useMemo(() => ({
    all: series(orders, () => true),
    new: series(orders, (o) => viewOf(o) === "new"),
    shipping: series(orders, (o) => o.status === "shipping"),
    delivered: series(orders, (o) => o.status === "delivered"),
  }), [orders, viewOf]);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qd = q.replace(/\s/g, "");
    const list = orders.filter((o) => {
      const okF = filter === "all" || (filter === "risk" ? isRisk(o) : viewOf(o) === filter);
      if (!okF) return false;
      if (!q) return true;
      const hay = [o.name, o.phone, normPhone(o.phone), o.wilaya, o.tracking, o.id, o.product].join(" ").toLowerCase();
      return hay.includes(q) || hay.includes(qd);
    });
    list.sort((a, b) =>
      sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt)
        : sort === "highest" ? b.total - a.total
          : new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [orders, filter, query, sort, viewOf, isRisk]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = sorted.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const activeOrder = orders.find((o) => o.id === active) || null;

  /* ---------- تعديل طلبية وحفظه في الخادم ---------- */
  const patch = (id, upd, logText) => {
    const old = ordersRef.current.find((o) => o.id === id);
    if (!old) return;
    let next = typeof upd === "function" ? upd(old) : { ...old, ...upd };
    if (logText) next = { ...next, log: [...old.log, { at: Date.now(), text: logText }].slice(-50) };
    ordersRef.current = ordersRef.current.map((o) => (o.id === id ? next : o));
    setOrders(ordersRef.current);
    const { status, callResult, attempts, note, forceSend, log } = next;
    saving.current++;
    let failed = false;
    saveOrder(id, { status, callResult, attempts, note, forceSend, log })
      .catch((e) => {
        if (e instanceof AuthError) { onLock(); return; }
        failed = true;
        notify("لم يُحفظ التغيير. تحقق من الاتصال.");
      })
      .finally(() => {
        saving.current--;
        if (failed && mounted.current) reload();
      });
  };

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const pageShippable = rows.filter((o) => canShip(o) && !dup[o.id]).map((o) => o.id);
  const allOnPage = pageShippable.length > 0 && pageShippable.every((id) => selected.includes(id));
  const togglePage = () => setSelected((s) => (allOnPage ? s.filter((id) => !pageShippable.includes(id)) : [...new Set([...s, ...pageShippable])]));

  const setCall = (o, key) => {
    if (o.status === "shipping") return;
    const label = CALLS.find((c) => c.key === key).label;
    patch(o.id, (x) => ({
      ...x, callResult: key, attempts: Math.min(99, x.attempts + 1),
      status: key === "cancelled" ? "cancelled" : key === "confirmed" && x.status === "new" ? "confirmed" : x.status,
    }), `نتيجة الاتصال: ${label}`);
  };
  const setStatus = (o, key) => {
    if (o.status === "shipping" || o.status === key) return;
    patch(o.id, { status: key }, `تغيير الحالة إلى: ${STATUS[key].label}`);
  };
  const merge = (o) => patch(o.id, { status: "cancelled" }, `دُمجت مع #${shortId(dup[o.id] || "")} وأُلغيت`);
  const force = (o) => patch(o.id, { forceSend: true }, "سُمح بإرسالها رغم التكرار");

  /* ---------- الإرسال لشركة التوصيل ---------- */
  const openSend = (ids) => {
    const items = ids.map((id) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return null;
      let skip = null;
      if (o.tracking) skip = "أُرسلت سابقاً";
      else if (dup[o.id]) skip = `مكررة مع #${shortId(dup[o.id])} · تُتخطى`;
      else if (!["new", "confirmed"].includes(o.status)) skip = "حالتها لا تسمح بالإرسال";
      return { order: o, skip, tier: statsOf(o).tier };
    }).filter(Boolean);
    if (!items.length) return;
    setPlan(items);
  };

  const dispatch = async (ids, opts) => {
    setBusy(true);
    let sent = 0, failed = 0;
    const cLabel = (companies.find((c) => c.id === opts.company) || { name: opts.company }).name;
    for (const id of ids) {
      const o = ordersRef.current.find((x) => x.id === id);
      if (!o || !canShip(o) || dup[o.id] || lock.current.has(id)) continue;
      lock.current.add(id);
      try {
        const tracking = await sendToDelivery(o, opts);
        if (!mounted.current) return;
        const live = ordersRef.current.find((x) => x.id === id) || o;
        const next = { ...live, status: "shipping", tracking, company: opts.company, log: [...live.log, { at: Date.now(), text: `أُرسلت إلى ${cLabel}${tracking ? " · " + tracking : ""}` }].slice(-50) };
        await saveOrder(id, { status: "shipping", tracking, company: opts.company, log: next.log });
        if (!mounted.current) return;
        ordersRef.current = ordersRef.current.map((x) => (x.id === id ? next : x));
        setOrders(ordersRef.current);
        sent++;
      } catch (e) {
        if (e instanceof AuthError) { onLock(); break; }
        failed++;
      } finally {
        lock.current.delete(id);
      }
    }
    if (!mounted.current) return;
    setBusy(false); setPlan(null); setSelected([]);
    notify(`أُرسلت ${sent} طلبية` + (failed ? ` · فشلت ${failed}` : ""));
  };

  /* ---------- إضافة طلب / تصدير / خروج ---------- */
  const addOrder = async (body) => {
    setAdding(true);
    try {
      if (USE_SAMPLE) {
        const o = normalize({ ...body, id: "S" + Date.now(), status: "new" });
        ordersRef.current = [o, ...ordersRef.current];
        setOrders(ordersRef.current);
      } else {
        await createOrder(body);
        await reload();
      }
      if (!mounted.current) return;
      setShowAdd(false);
      notify("أُضيفت الطلبية");
    } catch (e) {
      if (e instanceof AuthError) onLock();
      else notify("تعذّرت إضافة الطلبية. تحقق من الخادم.");
    } finally {
      if (mounted.current) setAdding(false);
    }
  };

  const exportCSV = () => {
    const head = ["رقم", "الاسم", "الهاتف", "الولاية", "المنتج", "المبلغ", "الدفع", "الحالة", "التتبع", "التاريخ"];
    const data = sorted.map((o) => [o.id, o.name, o.phone, o.wilaya, o.product, o.total, payOf(o).label, STATUS[viewOf(o)].label, o.tracking, dateOf(o.createdAt)]);
    const csv = "\uFEFF" + [head, ...data].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const openOrder = (id) => { setActive(id); setSheet(true); };

  return {
    navigate, orders, loading, loadError, updatedAt, filter, setFilter, query, setQuery, sort, setSort,
    cur, pages, setPage, selected, setSelected, active, sheet, setSheet, plan, setPlan, busy, showAdd, setShowAdd,
    adding, toast, openKey, setOpenKey, dup, viewOf, statsOf, countOf, newCount, riskCount, sp, sorted, rows,
    activeOrder, patch, toggle, allOnPage, togglePage, setCall, setStatus, merge, force, openSend, dispatch,
    addOrder, reload, refresh, refreshing, exportCSV, openOrder, isRisk, companies,
  };
}

/* =========================================================
   نافذة الإرسال لشركة التوصيل
   ========================================================= */
export function SendModal({ plan, busy, onClose, onSend, companies }) {
  const active = companies.filter((c) => c.enabled);
  const [company, setCompany] = useState(() => (active.find((c) => c.isDefault) || active[0] || { id: "" }).id);
  const [type, setType] = useState("home");
  const [tracking, setTracking] = useState("");
  const [inc, setInc] = useState(() =>
    Object.fromEntries(plan.filter((p) => !p.skip).map((p) => [p.order.id, p.tier !== "risk"])));
  const ids = plan.filter((p) => !p.skip && inc[p.order.id]).map((p) => p.order.id);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ov" onClick={onClose}>
      <div className="md" role="dialog" aria-modal="true" aria-label="إرسال إلى شركة التوصيل" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, flex: 1 }}>إرسال إلى شركة التوصيل</h2>
          <button className="ib" onClick={onClose} aria-label="إغلاق"><Icon name="x" /></button>
        </div>

        <div className="lbl">شركة التوصيل</div>
        <div className="seg">
          {active.map((c) => (
            <button key={c.id} className={`chip${company === c.id ? " on" : ""}`} onClick={() => setCompany(c.id)}>{c.name}</button>
          ))}
          {!active.length && <div className="muted">لا توجد شركة توصيل مفعّلة. فعّل واحدة من صفحة «التوصيل».</div>}
        </div>
        <div className="lbl">نوع التسليم</div>
        <div className="seg">
          <button className={`chip${type === "home" ? " on" : ""}`} onClick={() => setType("home")}>إلى المنزل</button>
          <button className={`chip${type === "desk" ? " on" : ""}`} onClick={() => setType("desk")}>مكتب (Stop Desk)</button>
        </div>

        {ids.length === 1 && (
          <>
            <div className="lbl">رقم التتبع (اختياري)</div>
            <input className="inp" dir="ltr" style={{ width: "100%" }} value={tracking} maxLength={40}
              placeholder="YAL-12345" onChange={(e) => setTracking(e.target.value)} />
          </>
        )}

        <div className="lbl">الطلبيات</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plan.map(({ order: o, skip, tier }) => (
            <label key={o.id} className="mrow" style={{ opacity: skip ? 0.7 : 1 }}>
              <input type="checkbox" disabled={!!skip} checked={!skip && !!inc[o.id]} style={{ width: 20, height: 20 }}
                onChange={() => setInc((s) => ({ ...s, [o.id]: !s[o.id] }))} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: "block" }}>#{shortId(o.id)} · {o.name}</b>
                <span style={{ fontSize: 13, color: skip ? "#4B3A8C" : tier === "risk" ? "#9B2C25" : "var(--mut)", fontWeight: 600 }}>
                  {skip || (tier === "risk" ? "عميل خطر — فعّله إذا أردت إرساله" : o.wilaya)}
                </span>
              </span>
              <b>{money(o.total)}</b>
            </label>
          ))}
        </div>

        <button className="pri gold big" style={{ width: "100%", marginTop: 18 }} disabled={!ids.length || busy || !company}
          onClick={() => onSend(ids, { company, type, tracking: ids.length === 1 ? tracking : "" })}>
          {busy ? "جارٍ الإرسال..." : `إرسال ${ids.length} طلبية`}
        </button>
        <div className="muted" style={{ marginTop: 10, fontSize: 12.5 }}>تُسجَّل الطلبية «قيد التوصيل» هنا. تسليم الطرد للشركة يتم من حسابك لديها.</div>
      </div>
    </div>
  );
}

/* =========================================================
   إضافة طلب جديد (يدوياً) — التحقق هنا للراحة فقط، والخادم يتحقق مرة أخرى
   ========================================================= */
export function Field({ label, error, children }) {
  return (
    <label className="fl">
      <span>{label}</span>
      {children}
      {error && <small className="er" role="alert">{error}</small>}
    </label>
  );
}

export function AddModal({ busy, onClose, onSubmit }) {
  const [f, setF] = useState({ name: "", phone: "", wilaya: "", product: "", total: "" });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(), wilaya = f.wilaya.trim(), product = f.product.trim(), total = Number(f.total);
    const er = {};
    if (name.length < 2) er.name = "أدخل اسم العميل";
    if (!validPhone(f.phone)) er.phone = "رقم هاتف غير صالح، مثال: 0555123456";
    if (!wilaya) er.wilaya = "أدخل الولاية";
    if (!product) er.product = "أدخل المنتج";
    if (!Number.isFinite(total) || total <= 0 || total > 10000000) er.total = "أدخل مبلغاً صحيحاً";
    setErr(er);
    if (Object.keys(er).length) return;
    onSubmit({ name, phone: normPhone(f.phone), wilaya, product, total: Math.round(total) });
  };

  return (
    <div className="ov" onClick={onClose}>
      <form className="md" role="dialog" aria-modal="true" aria-label="إضافة طلب جديد" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 20, flex: 1 }}>إضافة طلب جديد</h2>
          <button type="button" className="ib" onClick={onClose} aria-label="إغلاق"><Icon name="x" /></button>
        </div>
        <Field label="اسم العميل" error={err.name}><input className="inp" value={f.name} onChange={set("name")} maxLength={80} autoComplete="off" /></Field>
        <Field label="رقم الهاتف" error={err.phone}><input className="inp" dir="ltr" inputMode="tel" value={f.phone} onChange={set("phone")} maxLength={20} placeholder="0555123456" /></Field>
        <Field label="الولاية" error={err.wilaya}><input className="inp" value={f.wilaya} onChange={set("wilaya")} maxLength={40} /></Field>
        <Field label="المنتج" error={err.product}><input className="inp" value={f.product} onChange={set("product")} maxLength={100} /></Field>
        <Field label="المبلغ (دج)" error={err.total}><input className="inp" dir="ltr" inputMode="numeric" value={f.total} onChange={set("total")} maxLength={9} /></Field>
        <button type="submit" className="pri gold big" style={{ width: "100%", marginTop: 18 }} disabled={busy}>
          {busy ? "جارٍ الحفظ..." : "حفظ الطلبية"}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   تفاصيل الطلبية (لوحة جانبية) — في «التتبع» للقراءة، وفي «الإدارة» للتحكم
   ========================================================= */
export function Drawer({ o, view, dupOf, stats, open, onClose, manage, actions, companies }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tier = o ? TIER[stats.tier] : null;
  const shippable = o ? canShip(o) && !dupOf : false;

  return (
    <aside className={`dr${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="تفاصيل الطلبية" aria-hidden={!open}>
      {o && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 21, flex: 1 }}>طلبية #{shortId(o.id)}</h2>
            <Pill s={STATUS[view]} />
            <button className="ib" onClick={onClose} aria-label="إغلاق"><Icon name="x" /></button>
          </div>

          <section className="sec">
            <div style={{ fontWeight: 800, fontSize: 17 }}>{o.name || "—"}</div>
            <div className="muted" dir="ltr" style={{ textAlign: "right" }}>{fmtPhone(o.phone)}</div>
            <div className="muted">{o.wilaya}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <a className="chip lnk" href={`tel:${normPhone(o.phone)}`}><Icon name="phone" size={16} />اتصال</a>
              <a className="chip lnk" href={wa(o, TEMPLATES[0].text(o))} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} />واتساب</a>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Pill s={tier} />
              <span className="muted" style={{ fontSize: 13 }}>استلم {stats.d} · أرجع {stats.r} · لم يرد {stats.n}</span>
            </div>
          </section>

          {dupOf && (
            <div className="alert v">
              هذه الطلبية مكررة مع #{shortId(dupOf)} ولن تُرسل للتوصيل.
              {manage && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <button className="pri" style={{ background: "#4B3A8C", color: "#fff" }} onClick={actions.merge}>دمج وإلغاء</button>
                  <button className="chip" onClick={actions.force}>إرسال رغم التكرار</button>
                </div>
              )}
            </div>
          )}
          {stats.tier === "risk" && !dupOf && <div className="alert r">هذا العميل أرجع طلبيات سابقة. راجع قبل الإرسال.</div>}
          {o.callResult === "no_answer" && o.attempts >= 3 && !o.tracking && (
            <div className="alert g">3 محاولات دون رد. فكّر في إلغاء الطلبية أو مراسلة العميل على واتساب.</div>
          )}

          <section className="sec">
            {o.items && o.items.length > 0
              ? o.items.map((it, i) => <div className="kv" key={i}><span>{i === 0 ? "المنتجات" : ""}</span><b>{it.name}{it.color ? ` (${it.color})` : ""} × {it.qty} · {money(it.price * it.qty)}</b></div>)
              : <div className="kv"><span>المنتج</span><b>{o.product || "—"}</b></div>}
            {o.commune && <div className="kv"><span>البلدية</span><b>{o.commune}</b></div>}
            {o.place && <div className="kv"><span>التوصيل</span><b>{o.place === "office" ? "لمكتب التوصيل" : "للمنزل"}{o.delivery !== null ? ` · ${money(o.delivery)}` : ""}</b></div>}
            {o.priceVerified === false && <div className="alert g">لم يتمكن الخادم من التحقق من سعر هذا الطلب من قاعدة البيانات (استُعمل سعر الزبون). راجع السعر قبل التأكيد.</div>}
            <div className="kv"><span>المبلغ</span><b>{money(o.total)}</b></div>
            <div className="kv"><span>طريقة الدفع</span><b>{payOf(o).label}</b></div>
            {o.receipt ? (
              <div style={{ margin: "8px 0" }}>
                <div className="muted" style={{ marginBottom: 6 }}>وصل الدفع المرفق من الزبون:</div>
                <a href={`/api/admin/receipts/${o.receipt}`} target="_blank" rel="noreferrer">
                  <img src={`/api/admin/receipts/${o.receipt}`} alt="وصل الدفع" style={{ width: "100%", maxHeight: 340, objectFit: "contain", borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft)" }} />
                </a>
              </div>
            ) : (o.payment && o.payment !== "cod" ? <div className="alert g">لم يرفق الزبون وصل الدفع. تأكد من الدفع قبل التأكيد.</div> : null)}
            <div className="kv"><span>التاريخ</span><b dir="ltr">{dateOf(o.createdAt)} {timeOf(o.createdAt)}</b></div>
            {o.tracking && <div className="kv"><span>{(companies.find((c) => c.id === o.company) || {}).name || "التتبع"}</span><b dir="ltr">{o.tracking}</b></div>}
            {Object.entries(o.extra || {}).map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}
          </section>

          {!manage && (
            <section className="sec">
              <div className="sh">مراحل الطلبية</div>
              <Timeline status={o.status} />
              <button className="pri gold" style={{ width: "100%", marginTop: 16 }} onClick={actions.openManage}>فتح في إدارة الطلبيات</button>
            </section>
          )}

          {manage && (
            <>
              <section className="sec">
                <div className="sh">نتيجة الاتصال <span className="muted" style={{ fontWeight: 600 }}>· المحاولات {o.attempts}</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {CALLS.map((c) => (
                    <button key={c.key} disabled={o.status === "shipping"} className={`chip${o.callResult === c.key ? " on gold" : ""}`} onClick={() => actions.call(c.key)}>{c.label}</button>
                  ))}
                </div>
              </section>

              {shippable && (
                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  <button className="pri gold big" style={{ flex: 1 }} onClick={actions.send}>
                    {o.status === "new" ? "تأكيد وإرسال للتوصيل" : "إرسال للتوصيل"}
                  </button>
                  {o.status === "new" && <button className="chip" onClick={actions.confirmOnly}>تأكيد فقط</button>}
                </div>
              )}

              <details className="dt">
                <summary>رسائل واتساب جاهزة</summary>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {TEMPLATES.map((t) => (
                    <a key={t.label} className="chip lnk" href={wa(o, t.text(o))} target="_blank" rel="noopener noreferrer">{t.label}</a>
                  ))}
                </div>
              </details>
            </>
          )}

          <details className="dt" open={!manage && !!o.note}>
            <summary>{manage ? "ملاحظات وسجل النشاط" : "الملاحظات وسجل النشاط"}</summary>
            {manage ? (
              <textarea key={o.id} rows={2} maxLength={500} defaultValue={o.note}
                onBlur={(e) => e.target.value !== o.note && actions.note(e.target.value)}
                placeholder="أضف ملاحظة للفريق" className="ta" aria-label="ملاحظة داخلية" />
            ) : (
              o.note && <p className="muted" style={{ margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{o.note}</p>
            )}
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {o.log.length === 0 && <li className="muted" style={{ fontSize: 13 }}>لا يوجد نشاط بعد.</li>}
              {[...o.log].reverse().slice(0, 8).map((l, i) => (
                <li key={i} style={{ fontSize: 13, display: "flex", gap: 8 }}><span className="muted">{timeOf(l.at)}</span><span>{l.text}</span></li>
              ))}
            </ul>
          </details>
        </>
      )}
    </aside>
  );
}

export function PageHead({ s, title, sub }) {
  return (
    <>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin" style={{ color: "inherit" }}>لوحة التحكم</Link><span>/</span><span>{title}</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />{title}</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            {sub}{s.updatedAt && <> · آخر تحديث {timeOf(s.updatedAt)}</>}
          </div>
        </div>
        <button className="pri gold add" onClick={() => s.setShowAdd(true)}><Icon name="plus" size={18} />إضافة طلب جديد</button>
      </div>
    </>
  );
}

export function TableTop({ s, filters, title }) {
  const { orders, filter, setFilter, sort, setSort, openKey, setOpenKey, reload, refresh, refreshing, exportCSV, loading, loadError, countOf, riskCount } = s;
  const label = (k) => (k === "all" ? "الكل" : k === "risk" ? "عملاء خطر" : STATUS[k].label);
  const count = (k) => (k === "all" ? orders.length : k === "risk" ? riskCount : countOf(k));
  const sortLabel = SORTS.find((x) => x.key === sort).label;
  return (
    <>
      <div className="th">
        <div className="tt"><span className="gb" />{title}</div>
        <div className="chips" role="group" aria-label="تصفية حسب الحالة">
          {filters.map((k) => (
            <button key={k} className={`fc${filter === k ? " on" : ""}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {label(k)} <span className="fn">{count(k)}</span>
            </button>
          ))}
        </div>
        <div className="tools">
          <Dropdown k="sort" openKey={openKey} setOpenKey={setOpenKey} items={SORTS} current={sort} onPick={setSort}
            label="ترتيب الطلبيات" trigger={<span>{sortLabel}</span>} />
          <button className="ib sm" onClick={refresh} disabled={refreshing} title="تحديث" aria-label="تحديث" style={refreshing ? { opacity: .6 } : null}><span style={refreshing ? { display: "inline-flex", animation: "admspin .8s linear infinite" } : { display: "inline-flex" }}><Icon name="refresh" size={16} /></span></button>
          <button className="ib sm" onClick={exportCSV} aria-label="تصدير Excel (CSV)"><Icon name="dl" size={16} /></button>
        </div>
      </div>
      {!loading && loadError && orders.length > 0 && (
        <div className="alert r" style={{ margin: "0 16px 12px" }}>
          {loadError} <button className="chip" style={{ minHeight: 34 }} onClick={reload}>إعادة المحاولة</button>
        </div>
      )}
    </>
  );
}

export function TableState({ s }) {
  const { loading, loadError, orders, rows, reload } = s;
  return (
    <>
      {loading && <div className="empty">جارٍ تحميل الطلبيات...</div>}
      {!loading && loadError && orders.length === 0 && (
        <div className="empty">
          <b>{loadError}</b>
          <div className="muted" style={{ margin: "6px 0 12px" }}>شغّل الخادم (node server.js) وتأكد من إعداد proxy في package.json.</div>
          <button className="pri" onClick={reload}>إعادة المحاولة</button>
        </div>
      )}
      {!loading && !loadError && rows.length === 0 && (
        <div className="empty"><b>{orders.length ? "لا توجد طلبيات مطابقة" : "لا توجد طلبيات بعد"}</b></div>
      )}
    </>
  );
}

export function OrderOverlays({ s, manage }) {
  const { sheet, setSheet, activeOrder, viewOf, dup, statsOf, setCall, merge, force, patch, openSend, navigate,
    plan, setPlan, busy, dispatch, showAdd, setShowAdd, adding, addOrder, companies } = s;
  return (
    <>
      <div className={`bd${sheet ? " open" : ""}`} onClick={() => setSheet(false)} />
      <Drawer
        o={activeOrder}
        view={activeOrder ? viewOf(activeOrder) : "new"}
        dupOf={activeOrder && viewOf(activeOrder) === "duplicate" ? dup[activeOrder.id] : null}
        stats={activeOrder ? statsOf(activeOrder) : {}}
        open={sheet}
        onClose={() => setSheet(false)}
        manage={manage}
        companies={companies}
        actions={activeOrder && {
          call: (k) => setCall(activeOrder, k),
          merge: () => merge(activeOrder),
          force: () => force(activeOrder),
          note: (v) => patch(activeOrder.id, { note: v.slice(0, 500) }),
          send: () => openSend([activeOrder.id]),
          confirmOnly: () => { if (activeOrder.status === "new") patch(activeOrder.id, { status: "confirmed" }, "تم تأكيد الطلبية"); },
          openManage: () => navigate("/admin/orders/manage", { state: { focus: activeOrder.id } }),
        }}
      />
      {plan && <SendModal plan={plan} busy={busy} companies={companies} onClose={() => !busy && setPlan(null)} onSend={dispatch} />}
      {showAdd && <AddModal busy={adding} onClose={() => !adding && setShowAdd(false)} onSubmit={addOrder} />}
    </>
  );
}
