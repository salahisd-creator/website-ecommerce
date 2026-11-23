/* =========================================================
   Delivery.jsx  ←  ضعه في: src/admin/Delivery.jsx
   صفحة «التوصيل» — المسار: /admin/delivery
   إدارة عدة شركات توصيل: إضافة، تفعيل/إيقاف، تعديل الاسم و بيانات الـ API، حذف.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { Confirm, ERR, fmtDate, KIT_CSS, Modal, Toggle, useToast } from "./kit";
import { Icon } from "./ui";

const errText = (e) => {
  if (e instanceof HttpError) return (e.code && ERR[e.code]) || `تعذّر تنفيذ العملية (الرمز ${e.status}).`;
  return "تعذّر الوصول إلى الخادم.";
};

function CompanyForm({ initial, busy, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: initial ? initial.name : "", apiUrl: initial ? initial.apiUrl : "", apiId: initial ? initial.apiId : "",
    apiToken: "", clearToken: false, enabled: initial ? initial.enabled : true, isDefault: initial ? initial.isDefault : false,
  }));
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "أدخل اسم الشركة";
    if (f.apiUrl.trim() && !/^https:\/\/[^\s/]+(\/\S*)?$/.test(f.apiUrl.trim())) er.apiUrl = "يجب أن يبدأ بـ https://";
    if (/\s/.test(f.apiToken.trim())) er.apiToken = "المفتاح لا يحتوي على مسافات";
    setErr(er);
    if (Object.keys(er).length) return;
    const body = { name: f.name.trim(), apiUrl: f.apiUrl.trim(), apiId: f.apiId.trim(), enabled: f.enabled, isDefault: f.enabled && f.isDefault };
    if (f.apiToken.trim()) body.apiToken = f.apiToken.trim();
    if (f.clearToken && !f.apiToken.trim()) body.clearToken = true;
    onSave(body);
  };

  return (
    <Modal label={initial ? "تعديل شركة التوصيل" : "إضافة شركة توصيل"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <label className="fl"><span>اسم الشركة</span>
          <input className="inp" value={f.name} onChange={set("name")} maxLength={40} />
          {err.name && <small className="er" role="alert">{err.name}</small>}</label>
        <label className="fl"><span>رابط الـ API <small className="muted" style={{ fontWeight: 400 }}>(اختياري)</small></span>
          <input className="inp" dir="ltr" value={f.apiUrl} onChange={set("apiUrl")} maxLength={200} placeholder="https://api.example.com/v1" />
          {err.apiUrl && <small className="er" role="alert">{err.apiUrl}</small>}</label>
        <div className="kfg">
          <label className="fl"><span>معرّف الحساب (API ID)</span>
            <input className="inp" dir="ltr" value={f.apiId} onChange={set("apiId")} maxLength={80} autoComplete="off" /></label>
          <label className="fl"><span>مفتاح الـ API (Token)</span>
            <input className="inp" dir="ltr" type="password" value={f.apiToken} onChange={set("apiToken")} maxLength={300} autoComplete="new-password"
              placeholder={initial && initial.hasToken ? initial.tokenHint : ""} />
            {err.apiToken && <small className="er" role="alert">{err.apiToken}</small>}</label>
        </div>
        {initial && initial.hasToken && (
          <label className="kck"><input type="checkbox" checked={f.clearToken} onChange={(e) => setF((s) => ({ ...s, clearToken: e.target.checked }))} />
            حذف المفتاح المحفوظ</label>
        )}
        <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
          المفتاح يُحفظ على الخادم فقط، ولا يُعاد عرضه في المتصفح. اتركه فارغاً للإبقاء على المفتاح الحالي.
        </div>
        <label className="kck"><input type="checkbox" checked={f.enabled} onChange={(e) => setF((s) => ({ ...s, enabled: e.target.checked, isDefault: e.target.checked ? s.isDefault : false }))} />
          مفعّلة (تظهر عند إرسال الطلبيات)</label>
        <label className="kck"><input type="checkbox" disabled={!f.enabled} checked={f.enabled && f.isDefault} onChange={(e) => setF((s) => ({ ...s, isDefault: e.target.checked }))} />
          الشركة الافتراضية للإرسال</label>
        <button type="submit" className="pri gold big" style={{ width: "100%", marginTop: 20 }} disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ"}</button>
      </form>
    </Modal>
  );
}

export default function Delivery() {
  const { lock } = useAdmin();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState(null); // {type:'form'|'del', id?}
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await api("/admin/companies");
      if (!mounted.current) return;
      setList(Array.isArray(d && d.companies) ? d.companies : []);
      setLoadError("");
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { lock(); return; }
      setLoadError("تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    } finally { if (mounted.current) setLoading(false); }
  }, [lock]);
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, [load]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      await load();
      if (!mounted.current) return;
      setModal(null);
      if (okMsg) notify(okMsg);
    } catch (e) {
      if (e instanceof AuthError) lock(); else notify(errText(e));
    } finally { if (mounted.current) setBusy(false); }
  };

  const target = modal && modal.id ? list.find((c) => c.id === modal.id) : null;
  const active = list.filter((c) => c.enabled).length;
  const withApi = list.filter((c) => c.hasToken).length;

  return (
    <Layout need="delivery" hideSearch toast={toast}
      overlays={(
        <>
          {modal && modal.type === "form" && (modal.id ? !!target : true) && (
            <CompanyForm key={modal.id || "new"} initial={target} busy={busy} onClose={() => !busy && setModal(null)}
              onSave={(b) => run(() => api(modal.id ? `/admin/companies/${encodeURIComponent(modal.id)}` : "/admin/companies", { method: modal.id ? "PATCH" : "POST", body: JSON.stringify(b) }), "تم الحفظ")} />
          )}
          {modal && modal.type === "del" && target && (
            <Confirm title="حذف شركة التوصيل؟" text={`ستُحذف «${target.name}» نهائياً مع بيانات الـ API. إن كانت مرتبطة بطلبيات فلن يُسمح بالحذف، أوقفها بدلاً من ذلك.`}
              busy={busy} onNo={() => setModal(null)} onYes={() => run(() => api(`/admin/companies/${encodeURIComponent(target.id)}`, { method: "DELETE" }), "تم الحذف")} />
          )}
        </>
      )}
    >
      <style>{KIT_CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>التوصيل</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />شركات التوصيل</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>أضف عدة شركات وفعّل ما تحتاجه. الشركات المفعّلة تظهر عند إرسال الطلبيات.</div>
        </div>
      </div>

      <section className="kcs">
        <div className="kc"><span className="kci" style={{ background: "#DCEBFF", color: "#1D4A8A" }}><Icon name="truck" size={24} /></span><span><span className="kcl">إجمالي الشركات</span><b className="kcn">{list.length}</b></span></div>
        <div className="kc"><span className="kci" style={{ background: "#DDF3E8", color: "#14633F" }}><Icon name="check" size={24} /></span><span><span className="kcl">المفعّلة</span><b className="kcn">{active}</b></span></div>
        <div className="kc"><span className="kci" style={{ background: "#ECE9E0", color: "#4A4F60" }}><Icon name="x" size={24} /></span><span><span className="kcl">الموقوفة</span><b className="kcn">{list.length - active}</b></span></div>
        <div className="kc"><span className="kci" style={{ background: "#FFF1CC", color: "#7A5200" }}><Icon name="key" size={24} /></span><span><span className="kcl">مربوطة بـ API</span><b className="kcn">{withApi}</b></span></div>
      </section>

      <div className="ktb">
        <div className="knote" style={{ flex: 1, minWidth: 240 }}>
          ملاحظة: بيانات الـ API تُحفظ الآن بأمان على الخادم. الإرسال التلقائي لكل شركة يحتاج ربطاً خاصاً بوثائقها، وسنضيفه عند توفّرها. حالياً تُسجَّل الطلبية «قيد التوصيل» مع رقم التتبع.
        </div>
        <button className="kadd" onClick={() => setModal({ type: "form" })}><Icon name="plus" />إضافة شركة</button>
      </div>

      <section className="kt" style={{ "--cols": "minmax(0,2fr) minmax(0,1.5fr) 150px 110px 150px" }}>
        <div className="kr hd"><span>الشركة</span><span>ربط الـ API</span><span>الحالة</span><span>آخر تعديل</span><span>الإجراءات</span></div>
        {loading && <div className="empty">جارٍ التحميل...</div>}
        {!loading && loadError && <div className="empty"><b>{loadError}</b><div style={{ marginTop: 12 }}><button className="pri" onClick={load}>إعادة المحاولة</button></div></div>}
        {!loading && !loadError && list.length === 0 && <div className="empty"><b>لا توجد شركات بعد</b></div>}
        {list.map((c) => (
          <div key={c.id} className="kr">
            <div className="kn k-full">
              <span className="kav">{c.name.slice(0, 1).toUpperCase()}</span>
              <div style={{ minWidth: 0 }}>
                <div className="knm">{c.name} {c.isDefault && <span className="kbd gold" style={{ marginInlineStart: 6 }}><Icon name="star" size={12} />افتراضية</span>}</div>
                <div className="ksb" dir="ltr" style={{ textAlign: "right" }}>{c.apiUrl || (c.builtin ? "شركة جاهزة" : "—")}</div>
              </div>
            </div>
            <div>
              {c.hasToken
                ? <span className="kbd ok"><Icon name="key" size={13} />مربوط · <span dir="ltr">{c.tokenHint}</span></span>
                : <span className="kbd off">غير مضبوط</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle on={c.enabled} label={`تفعيل ${c.name}`} disabled={busy}
                onChange={(v) => run(() => api(`/admin/companies/${encodeURIComponent(c.id)}`, { method: "PATCH", body: JSON.stringify({ enabled: v }) }))} />
              <b style={{ fontSize: 13.5, color: c.enabled ? "#14633F" : "var(--mut)" }}>{c.enabled ? "مفعّلة" : "موقوفة"}</b>
            </div>
            <span className="muted">{fmtDate(c.updatedAt)}</span>
            <div className="kact">
              <button className="kab s" title="جعلها افتراضية" aria-label={`جعل ${c.name} افتراضية`} disabled={busy || c.isDefault || !c.enabled}
                onClick={() => run(() => api(`/admin/companies/${encodeURIComponent(c.id)}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) }), "تم تعيين الشركة الافتراضية")}><Icon name="star" size={17} /></button>
              <button className="kab e" aria-label={`تعديل ${c.name}`} onClick={() => setModal({ type: "form", id: c.id })}><Icon name="edit" size={17} /></button>
              <button className="kab d" aria-label={`حذف ${c.name}`} onClick={() => setModal({ type: "del", id: c.id })}><Icon name="trash" size={17} /></button>
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
