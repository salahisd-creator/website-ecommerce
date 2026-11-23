/* =========================================================
   Team.jsx  ←  ضعه في: src/admin/Team.jsx
   صفحة «الفريق» — المسار: /admin/team
   الأشخاص الذين يمكنهم دخول اللوحة: الاسم، البريد، الدور، الحالة، التاريخ، تعديل، حذف.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { ROLES } from "./config";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { Confirm, ERR, fmtDate, KIT_CSS, Modal, useToast } from "./kit";
import { Icon, Pill } from "./ui";

const errText = (e) => {
  if (e instanceof HttpError) return (e.code && ERR[e.code]) || `تعذّر تنفيذ العملية (الرمز ${e.status}).`;
  return "تعذّر الوصول إلى الخادم.";
};
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function MemberForm({ initial, isOwner, busy, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: initial ? initial.name : "", email: initial ? initial.email : "", role: initial ? initial.role : "agent",
    status: initial ? initial.status : "active", password: "",
  }));
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "أدخل الاسم";
    if (!EMAIL_RE.test(f.email.trim())) er.email = "أدخل بريداً إلكترونياً صحيحاً";
    if (!initial && f.password.length < 12) er.password = "12 حرفاً على الأقل";
    if (initial && f.password && f.password.length < 12) er.password = "12 حرفاً على الأقل";
    setErr(er);
    if (Object.keys(er).length) return;
    const body = { name: f.name.trim(), email: f.email.trim(), role: f.role };
    if (initial) body.status = f.status;
    if (f.password) body.password = f.password;
    onSave(body);
  };

  return (
    <Modal label={initial ? "تعديل العضو" : "إضافة عضو جديد"} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <label className="fl"><span>الاسم</span>
          <input className="inp" value={f.name} onChange={set("name")} maxLength={60} />
          {err.name && <small className="er" role="alert">{err.name}</small>}</label>
        <label className="fl"><span>البريد الإلكتروني (Gmail أو غيره)</span>
          <input className="inp" dir="ltr" type="email" value={f.email} onChange={set("email")} maxLength={254} autoComplete="off" />
          {err.email && <small className="er" role="alert">{err.email}</small>}</label>
        <div className="kfg">
          <label className="fl"><span>الدور</span>
            <select className="inp" value={f.role} onChange={set("role")}>
              <option value="agent">موظف (الطلبيات فقط)</option>
              {(isOwner || (initial && initial.role === "manager")) && <option value="manager">مدير (كل الصفحات)</option>}
            </select></label>
          {initial && (
            <label className="fl"><span>الحالة</span>
              <select className="inp" value={f.status} onChange={set("status")}>
                <option value="active">نشط</option><option value="disabled">موقوف</option>
              </select></label>
          )}
        </div>
        <label className="fl"><span>{initial ? "كلمة سر جديدة (اتركها فارغة بدون تغيير)" : "كلمة السر"}</span>
          <input className="inp" dir="ltr" type="password" value={f.password} onChange={set("password")} maxLength={100} autoComplete="new-password" />
          {err.password && <small className="er" role="alert">{err.password}</small>}</label>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>يدخل العضو من نفس صفحة الدخول: بريده + كلمة السر هذه.</div>
        <button type="submit" className="pri gold big" style={{ width: "100%", marginTop: 20 }} disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ"}</button>
      </form>
    </Modal>
  );
}

export default function Team() {
  const { lock, me } = useAdmin();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();
  const mounted = useRef(true);
  const isOwner = !!me && me.role === "owner";

  const load = useCallback(async () => {
    try {
      const d = await api("/admin/team");
      if (!mounted.current) return;
      setList(Array.isArray(d && d.members) ? d.members : []);
      setLoadError("");
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof AuthError) { lock(); return; }
      setLoadError(e instanceof HttpError && e.status === 403 ? "ليست لديك صلاحية لهذه الصفحة." : "تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
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
      notify(okMsg);
    } catch (e) {
      if (e instanceof AuthError) lock(); else notify(errText(e));
    } finally { if (mounted.current) setBusy(false); }
  };

  const target = modal && modal.id ? list.find((m) => m.id === modal.id) : null;
  const total = list.length;
  const activeN = list.filter((m) => m.status === "active").length;
  const canTouch = (m) => m.id !== "owner" && (isOwner || m.role === "agent");

  return (
    <Layout need="team" hideSearch toast={toast}
      overlays={(
        <>
          {modal && modal.type === "form" && (modal.id ? !!target : true) && (
            <MemberForm key={modal.id || "new"} initial={target} isOwner={isOwner} busy={busy} onClose={() => !busy && setModal(null)}
              onSave={(b) => run(() => api(modal.id ? `/admin/team/${encodeURIComponent(modal.id)}` : "/admin/team", { method: modal.id ? "PATCH" : "POST", body: JSON.stringify(b) }), "تم الحفظ")} />
          )}
          {modal && modal.type === "del" && target && (
            <Confirm title="حذف العضو؟" text={`سيفقد «${target.name}» إمكانية الدخول فوراً. لا يمكن التراجع.`} busy={busy}
              onNo={() => setModal(null)} onYes={() => run(() => api(`/admin/team/${encodeURIComponent(target.id)}`, { method: "DELETE" }), "تم الحذف")} />
          )}
        </>
      )}
    >
      <style>{KIT_CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>الفريق</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />الفريق</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>الأشخاص الذين يمكنهم الدخول إلى لوحة الإدارة وصلاحياتهم.</div>
        </div>
      </div>

      <section className="kcs">
        <div className="kc"><span className="kci" style={{ background: "#DCEBFF", color: "#1D4A8A" }}><Icon name="users" size={24} /></span><span><span className="kcl">إجمالي الأعضاء</span><b className="kcn">{total}</b></span></div>
        <div className="kc"><span className="kci" style={{ background: "#DDF3E8", color: "#14633F" }}><Icon name="check" size={24} /></span><span><span className="kcl">النشطون</span><b className="kcn">{activeN}</b></span></div>
        <div className="kc"><span className="kci" style={{ background: "#ECE9E0", color: "#4A4F60" }}><Icon name="lock" size={24} /></span><span><span className="kcl">الموقوفون</span><b className="kcn">{total - activeN}</b></span></div>
      </section>

      <div className="ktb">
        <div className="knote" style={{ flex: 1, minWidth: 240 }}>
          <b>الأدوار:</b> المالك والمدير يصلان إلى كل الصفحات · الموظف يصل إلى الطلبيات فقط. المدير يستطيع إدارة الموظفين، والمالك وحده يدير المدراء.
        </div>
        <button className="kadd" onClick={() => setModal({ type: "form" })}><Icon name="plus" />إضافة عضو</button>
      </div>

      <section className="kt" style={{ "--cols": "minmax(0,2fr) minmax(0,1.6fr) 100px 100px 110px 110px 110px" }}>
        <div className="kr hd"><span>العضو</span><span>البريد</span><span>الدور</span><span>الحالة</span><span>تاريخ الإضافة</span><span>آخر دخول</span><span>الإجراءات</span></div>
        {loading && <div className="empty">جارٍ التحميل...</div>}
        {!loading && loadError && <div className="empty"><b>{loadError}</b><div style={{ marginTop: 12 }}><button className="pri" onClick={load}>إعادة المحاولة</button></div></div>}
        {list.map((m) => (
          <div key={m.id} className="kr">
            <div className="kn k-full">
              <span className="kav">{m.name.slice(0, 1)}</span>
              <div style={{ minWidth: 0 }}><div className="knm">{m.name}{me && m.id === me.id && <span className="muted" style={{ fontWeight: 400 }}> (أنت)</span>}</div></div>
            </div>
            <span dir="ltr" className="muted" style={{ textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{m.email || "— (دخول بكلمة سر المالك)"}</span>
            <div><Pill s={ROLES[m.role] || ROLES.agent} /></div>
            <div><span className={`kbd ${m.status === "active" ? "ok" : "off"}`}>{m.status === "active" ? "نشط" : "موقوف"}</span></div>
            <span className="muted">{fmtDate(m.createdAt)}</span>
            <span className="muted">{fmtDate(m.lastLogin)}</span>
            <div className="kact">
              {canTouch(m) ? (
                <>
                  <button className="kab e" aria-label={`تعديل ${m.name}`} onClick={() => setModal({ type: "form", id: m.id })}><Icon name="edit" size={17} /></button>
                  <button className="kab d" aria-label={`حذف ${m.name}`} disabled={me && m.id === me.id} onClick={() => setModal({ type: "del", id: m.id })}><Icon name="trash" size={17} /></button>
                </>
              ) : <span className="muted">—</span>}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
