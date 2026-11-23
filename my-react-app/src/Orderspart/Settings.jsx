/* =========================================================
   Settings.jsx  ←  ضعه في: src/admin/Settings.jsx
   صفحة «الإعدادات» — المسار: /admin/settings
   • حسابي (الاسم والبريد والدور)       — للجميع
   • كلمة المرور                         — للمالك والمدير فقط
   • معلومات المتجر + طرق الدفع          — للمالك والمدير فقط
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { ROLES } from "./config";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { ERR, KIT_CSS, Toggle, useToast } from "./kit";
import { Icon, Pill } from "./ui";

const PAY = {
  cod: { label: "الدفع عند الاستلام", hint: "يدفع الزبون للموزّع عند وصول الطلبية.", details: false },
  ccp: { label: "بريد الجزائر (CCP)", hint: "رقم الحساب والمفتاح الذي يحوّل إليه الزبون.", details: true },
  baridimob: { label: "بريدي موب", hint: "رقم الحساب أو الرمز الذي يظهر للزبون.", details: true },
  bank: { label: "تحويل بنكي", hint: "اسم البنك ورقم الحساب (RIB).", details: true },
  redotpay: { label: "RedotPay", hint: "معرّف RedotPay أو البريد الذي يحوّل إليه الزبون.", details: true },
  paypal: { label: "PayPal", hint: "بريد PayPal أو رابط paypal.me الخاص بك.", details: true },
  binance: { label: "Binance Pay", hint: "معرّف Binance Pay (Pay ID) الخاص بك.", details: true },
};
const errText = (e) => {
  if (e instanceof HttpError) return (e.code && ERR[e.code]) || `تعذّر تنفيذ العملية (الرمز ${e.status}).`;
  return "تعذّر الوصول إلى الخادم.";
};
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export default function Settings() {
  const { lock, me, setMe, can } = useAdmin();
  const isMgr = !!me && (me.role === "owner" || me.role === "manager");
  const [toast, notify] = useToast();
  const mounted = useRef(true);

  /* --- حسابي --- */
  const [name, setName] = useState(me ? me.name : "");
  const [nameBusy, setNameBusy] = useState(false);

  /* --- كلمة المرور --- */
  const [pw, setPw] = useState({ cur: "", next: "", again: "" });
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  /* --- المتجر والدفع --- */
  const [st, setSt] = useState(null);
  const [stErr, setStErr] = useState("");
  const [stBusy, setStBusy] = useState(false);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    mounted.current = true;
    if (can("settings")) {
      api("/admin/settings").then((d) => { if (mounted.current) setSt(d); }).catch((e) => {
        if (!mounted.current) return;
        if (e instanceof AuthError) lock(); else setStErr("تعذّر تحميل إعدادات المتجر.");
      });
    }
    return () => { mounted.current = false; };
  }, [can, lock]);

  const guard = (e) => { if (e instanceof AuthError) { lock(); return true; } return false; };

  const saveName = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { notify("أدخل اسماً صحيحاً."); return; }
    setNameBusy(true);
    try {
      await api("/admin/me", { method: "PATCH", body: JSON.stringify({ name: name.trim() }) });
      if (!mounted.current) return;
      setMe({ ...me, name: name.trim() });
      notify("تم حفظ الاسم");
    } catch (x) { if (!guard(x)) notify(errText(x)); } finally { if (mounted.current) setNameBusy(false); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    setPwErr("");
    if (pw.next.length < 12) { setPwErr("كلمة السر الجديدة 12 حرفاً على الأقل."); return; }
    if (pw.next !== pw.again) { setPwErr("تأكيد كلمة السر غير مطابق."); return; }
    setPwBusy(true);
    try {
      await api("/admin/password", { method: "POST", body: JSON.stringify({ current: pw.cur, next: pw.next }) });
      if (!mounted.current) return;
      setPw({ cur: "", next: "", again: "" });
      notify("تم تغيير كلمة السر");
    } catch (x) { if (!guard(x)) setPwErr(errText(x)); } finally { if (mounted.current) setPwBusy(false); }
  };

  const setField = (k) => (e) => setSt((s) => ({ ...s, [k]: e.target.value }));
  const setPay = (k, patch) => setSt((s) => ({ ...s, payments: { ...s.payments, [k]: { ...s.payments[k], ...patch } } }));

  const saveStore = async (e) => {
    e.preventDefault();
    const er = {};
    if (st.storeName.trim().length < 2) er.storeName = "أدخل اسم المتجر";
    if (st.phone.trim() && !/^[0-9+ ]{8,20}$/.test(st.phone.trim())) er.phone = "رقم هاتف غير صالح";
    if (st.email.trim() && !EMAIL_RE.test(st.email.trim())) er.email = "بريد غير صالح";
    if (!Object.values(st.payments).some((p) => p.enabled)) er.pay = "فعّل طريقة دفع واحدة على الأقل.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setStBusy(true);
    try {
      await api("/admin/settings", { method: "PATCH", body: JSON.stringify({
        storeName: st.storeName.trim(), phone: st.phone.trim(), email: st.email.trim(), address: st.address.trim(), payments: st.payments,
      }) });
      if (!mounted.current) return;
      setMe({ ...me, storeName: st.storeName.trim() });
      notify("تم حفظ الإعدادات");
    } catch (x) { if (!guard(x)) notify(errText(x)); } finally { if (mounted.current) setStBusy(false); }
  };

  return (
    <Layout hideSearch toast={toast}>
      <style>{KIT_CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>الإعدادات</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />الإعدادات</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>حسابك، كلمة المرور، معلومات المتجر وطرق الدفع.</div>
        </div>
      </div>

      {/* حسابي */}
      <section className="ksec">
        <h2><Icon name="user" size={22} />حسابي</h2>
        <div className="muted">معلومات المستخدم الذي سجّل الدخول.</div>
        <form onSubmit={saveName} noValidate>
          <div className="kfg">
            <label className="fl"><span>الاسم</span>
              <input className="inp" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
            <label className="fl"><span>البريد الإلكتروني</span>
              <input className="inp" dir="ltr" value={me && me.email ? me.email : "— (حساب المالك)"} readOnly disabled /></label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <span className="muted">الدور:</span>{me && <Pill s={ROLES[me.role] || ROLES.agent} />}
            <span style={{ flex: 1 }} />
            <button type="submit" className="pri gold" disabled={nameBusy || !me || name.trim() === me.name}>{nameBusy ? "..." : "حفظ الاسم"}</button>
          </div>
        </form>
      </section>

      {/* كلمة المرور */}
      <section className="ksec">
        <h2><Icon name="lock" size={22} />كلمة المرور</h2>
        {isMgr ? (
          <>
            <div className="muted">تغيير كلمة المرور من صلاحيات المالك والمدير فقط. بعد التغيير تنتهي جلساتك الأخرى.</div>
            <form onSubmit={savePw} noValidate>
              <label className="fl"><span>كلمة السر الحالية</span>
                <input className="inp" dir="ltr" type="password" autoComplete="current-password" value={pw.cur} maxLength={100} onChange={(e) => setPw({ ...pw, cur: e.target.value })} /></label>
              <div className="kfg">
                <label className="fl"><span>كلمة السر الجديدة (12 حرفاً فأكثر)</span>
                  <input className="inp" dir="ltr" type="password" autoComplete="new-password" value={pw.next} maxLength={100} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
                <label className="fl"><span>تأكيد كلمة السر</span>
                  <input className="inp" dir="ltr" type="password" autoComplete="new-password" value={pw.again} maxLength={100} onChange={(e) => setPw({ ...pw, again: e.target.value })} /></label>
              </div>
              {pwErr && <small className="er" role="alert" style={{ display: "block", marginTop: 10 }}>{pwErr}</small>}
              <div style={{ display: "flex", marginTop: 14 }}>
                <span style={{ flex: 1 }} />
                <button type="submit" className="pri gold" disabled={pwBusy || !pw.cur || !pw.next}>{pwBusy ? "..." : "تغيير كلمة السر"}</button>
              </div>
            </form>
          </>
        ) : (
          <div className="knote" style={{ marginTop: 10 }}>لا تملك صلاحية تغيير كلمة المرور. اطلب ذلك من المالك أو المدير (من صفحة «الفريق»).</div>
        )}
      </section>

      {isMgr && (
        <form onSubmit={saveStore} noValidate style={{ display: "contents" }}>
          {/* المتجر */}
          <section className="ksec">
            <h2><Icon name="store" size={22} />معلومات المتجر</h2>
            <div className="muted">تظهر لزبائنك (اسم المتجر ورقم الهاتف).</div>
            {stErr && <small className="er" role="alert">{stErr}</small>}
            {!st && !stErr && <div className="muted" style={{ marginTop: 10 }}>جارٍ التحميل...</div>}
            {st && (
              <>
                <div className="kfg">
                  <label className="fl"><span>اسم المتجر</span>
                    <input className="inp" value={st.storeName} onChange={setField("storeName")} maxLength={60} />
                    {errs.storeName && <small className="er" role="alert">{errs.storeName}</small>}</label>
                  <label className="fl"><span>رقم الهاتف</span>
                    <input className="inp" dir="ltr" value={st.phone} onChange={setField("phone")} maxLength={20} />
                    {errs.phone && <small className="er" role="alert">{errs.phone}</small>}</label>
                  <label className="fl"><span>بريد المتجر</span>
                    <input className="inp" dir="ltr" value={st.email} onChange={setField("email")} maxLength={254} />
                    {errs.email && <small className="er" role="alert">{errs.email}</small>}</label>
                  <label className="fl"><span>العنوان</span>
                    <input className="inp" value={st.address} onChange={setField("address")} maxLength={200} /></label>
                </div>
              </>
            )}
          </section>

          {/* الدفع */}
          {st && (
            <section className="ksec">
              <h2><Icon name="card" size={22} />الدفع</h2>
              <div className="muted">فعّل طرق الدفع التي تقبلها. الطرق المفعّلة فقط تُعرض للزبون.</div>
              {Object.keys(PAY).map((k) => (
                <div key={k} className="kpay">
                  <Toggle on={!!st.payments[k].enabled} label={PAY[k].label} onChange={(v) => setPay(k, { enabled: v })} />
                  <div><b>{PAY[k].label}</b><span className="muted" style={{ fontSize: 13 }}>{PAY[k].hint}</span></div>
                  {PAY[k].details && st.payments[k].enabled && (
                    <>
                      <span />
                      <input className="inp" dir="ltr" value={st.payments[k].details} maxLength={200} aria-label={`بيانات ${PAY[k].label}`}
                        placeholder={k === "ccp" ? "CCP 0012345678 clé 12" : k === "baridimob" ? "00799999..." : "RIB ..."}
                        onChange={(e) => setPay(k, { details: e.target.value })} />
                    </>
                  )}
                </div>
              ))}
              {errs.pay && <small className="er" role="alert">{errs.pay}</small>}
              <div style={{ display: "flex", marginTop: 16 }}>
                <span style={{ flex: 1 }} />
                <button type="submit" className="pri gold big" disabled={stBusy}>{stBusy ? "جارٍ الحفظ..." : "حفظ إعدادات المتجر والدفع"}</button>
              </div>
            </section>
          )}
        </form>
      )}
    </Layout>
  );
}
