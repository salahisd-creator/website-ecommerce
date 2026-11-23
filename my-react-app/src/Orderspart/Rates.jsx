/* =========================================================
   Rates.jsx  ←  src/Orderspart/Rates.jsx
   صفحة «أسعار التوصيل» — المسار: /admin/rates
   سعر التوصيل لكل ولاية: للمنزل ولمكتب التوصيل. اترك خانة المكتب فارغة إن لم يتوفر مكتب.
   ========================================================= */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { Confirm, ERR, KIT_CSS, useToast } from "./kit";
import { Icon } from "./ui";

const norm = (v) => (Array.isArray(v) ? { home: v[0], office: v[1] } : { home: v.home, office: v.office });
const toNum = (s) => (String(s).trim() === "" ? null : Number(s));
const validNum = (n) => Number.isInteger(n) && n >= 0 && n <= 20000;

export default function Rates() {
  const { lock } = useAdmin();
  const [toast, notify] = useToast();
  const mounted = useRef(true);
  const [saved, setSaved] = useState(null);     // الأسعار المحفوظة { ولاية: {home, office} }
  const [defaults, setDefaults] = useState({});
  const [draft, setDraft] = useState({});       // نصوص الحقول { ولاية: {home:"", office:""} }
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [askReset, setAskReset] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    mounted.current = true;
    api("/admin/rates").then((d) => {
      if (!mounted.current) return;
      const s = {}; const dr = {}; const df = {};
      Object.keys(d.rates || {}).forEach((k) => { s[k] = norm(d.rates[k]); });
      Object.keys(d.defaults || {}).forEach((k) => { df[k] = norm(d.defaults[k]); });
      Object.keys(s).forEach((k) => { dr[k] = { home: String(s[k].home), office: s[k].office === null ? "" : String(s[k].office) }; });
      setSaved(s); setDefaults(df); setDraft(dr);
    }).catch((e) => { if (!mounted.current) return; if (e instanceof AuthError) lock(); else setLoadErr("تعذّر تحميل الأسعار."); });
    return () => { mounted.current = false; };
  }, [lock]);

  const names = useMemo(() => Object.keys(draft), [draft]);
  const shown = useMemo(() => names.filter((n) => !q.trim() || n.includes(q.trim())), [names, q]);

  const changed = useMemo(() => {
    if (!saved) return [];
    return names.filter((k) => {
      const d = draft[k]; const s = saved[k];
      return d.home !== String(s.home) || d.office !== (s.office === null ? "" : String(s.office));
    });
  }, [names, draft, saved]);

  const bad = (k) => { const d = draft[k]; return !validNum(Number(d.home)) || d.home.trim() === "" || (d.office.trim() !== "" && !validNum(Number(d.office))); };
  const anyBad = changed.some(bad);

  const set = (k, f) => (e) => { const v = e.target.value.replace(/[^\d]/g, "").slice(0, 5); setDraft((s) => ({ ...s, [k]: { ...s[k], [f]: v } })); };

  const save = async (keys) => {
    setBusy(true);
    try {
      const rates = {};
      keys.forEach((k) => { rates[k] = { home: Number(draft[k].home), office: toNum(draft[k].office) }; });
      await api("/admin/rates", { method: "PATCH", body: JSON.stringify({ rates }) });
      if (!mounted.current) return;
      setSaved((s) => { const n = { ...s }; keys.forEach((k) => { n[k] = rates[k]; }); return n; });
      notify(`تم حفظ ${keys.length} ولاية`);
    } catch (x) {
      if (x instanceof AuthError) lock();
      else notify(x instanceof HttpError && x.code && ERR[x.code] ? ERR[x.code] : "تعذّر الحفظ. تأكد أن الأرقام صحيحة.");
    } finally { if (mounted.current) setBusy(false); }
  };

  const resetAll = async () => {
    const d = {};
    Object.keys(defaults).forEach((k) => { d[k] = { home: String(defaults[k].home), office: defaults[k].office === null ? "" : String(defaults[k].office) }; });
    setDraft(d); setAskReset(false);
    setBusy(true);
    try {
      const rates = {};
      Object.keys(defaults).forEach((k) => { rates[k] = { home: defaults[k].home, office: defaults[k].office }; });
      await api("/admin/rates", { method: "PATCH", body: JSON.stringify({ rates }) });
      if (!mounted.current) return;
      setSaved({ ...defaults });
      notify("تمت استعادة الأسعار الافتراضية");
    } catch (x) { if (x instanceof AuthError) lock(); else notify("تعذّرت الاستعادة."); } finally { if (mounted.current) setBusy(false); }
  };

  return (
    <Layout hideSearch toast={toast} need="settings">
      <style>{KIT_CSS}{CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>أسعار التوصيل</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />أسعار التوصيل</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>السعر الذي يراه الزبون عند اختيار الولاية. الخادم هو من يحسب المجموع النهائي.</div>
        </div>
        <button className="chip" onClick={() => setAskReset(true)} disabled={busy || !saved}>استعادة الافتراضي</button>
      </div>

      <div className="knote" style={{ marginBottom: 14 }}>
        هذه الأسعار تقريبية مأخوذة من تسعيرات شركات التوصيل الشائعة (Yalidine وأمثالها). <b>راجعها مع شركة التوصيل التي تتعامل معها وعدّلها هنا</b>. اترك خانة «المكتب» فارغة إن لم يتوفر مكتب في الولاية.
      </div>

      {loadErr ? <div className="knote">{loadErr}</div> : !saved ? <div className="knote">جارٍ التحميل...</div> : (
        <section className="ksec">
          <div className="rt-bar">
            <input className="inp" placeholder="ابحث عن ولاية..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
            <button className="pri gold" disabled={busy || !changed.length || anyBad} onClick={() => save(changed)}>
              {busy ? "..." : changed.length ? `حفظ التعديلات (${changed.length})` : "لا تعديلات"}
            </button>
          </div>
          <div className="rt">
            <div className="rt-r hd"><span>الولاية</span><span>للمنزل (دج)</span><span>للمكتب (دج)</span></div>
            {shown.map((k) => (
              <div className={`rt-r${bad(k) ? " bad" : ""}${changed.includes(k) ? " chg" : ""}`} key={k}>
                <span className="rt-n">{k}</span>
                <input className="inp" dir="ltr" inputMode="numeric" value={draft[k].home} onChange={set(k, "home")} aria-label={`${k} للمنزل`} />
                <input className="inp" dir="ltr" inputMode="numeric" value={draft[k].office} onChange={set(k, "office")} placeholder="غير متوفر" aria-label={`${k} للمكتب`} />
              </div>
            ))}
            {!shown.length && <div className="knote" style={{ margin: 12 }}>لا نتائج.</div>}
          </div>
        </section>
      )}

      {askReset && (
        <Confirm title="استعادة الأسعار الافتراضية؟" text="سيتم استبدال كل الأسعار الحالية بالقيم الافتراضية الأولية."
          busy={busy} onYes={resetAll} onNo={() => setAskReset(false)} yes="نعم، استعد" />
      )}
    </Layout>
  );
}

const CSS = `
.rt-bar{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 12px}.rt-bar .inp{flex:1;min-width:160px}
.rt{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.rt-r{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:10px;align-items:center;padding:8px 12px;border-top:1px solid var(--line2)}
.rt-r.hd{background:var(--soft);border-top:0;font-weight:700;font-size:13px;color:var(--mut)}
.rt-r.chg{background:rgba(240,180,41,.12)}.rt-r.bad .inp{border-color:#C0392B}
.rt-n{font-weight:700}.rt-r .inp{width:100%;min-height:38px;text-align:center}
`;
