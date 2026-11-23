/* =========================================================
   Login.jsx  ←  ضعه في: src/admin/Login.jsx
   شاشة الدخول (تظهر فقط عند انتهاء الجلسة).
   ========================================================= */
import { useState } from "react";
import { CSS } from "./styles";
import { AuthError, HttpError, api } from "./api";
export default function Login({ onOk }) {
  const [pw, setPw] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 12) { setErr("كلمة السر 12 حرفاً على الأقل."); return; }
    setBusy(true); setErr("");
    let ok = false;
    try {
      await api("/admin/login", { method: "POST", body: JSON.stringify({ password: pw, email: email.trim() }) });
      ok = true;
    } catch (x) {
      setErr(x instanceof AuthError ? "كلمة السر غير صحيحة."
        : x instanceof HttpError && x.status === 429 ? "محاولات كثيرة. انتظر 15 دقيقة ثم أعد المحاولة."
          : "تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.");
    }
    if (ok) onOk(); else setBusy(false);
  };

  return (
    <div dir="rtl" className="adm gate">
      <style>{CSS}</style>
      <form className="gt" onSubmit={submit} noValidate>
        <div className="logo" style={{ margin: "0 auto 14px", width: 64, height: 64 }}><img src="/Logoi.jpg" alt="ISD" /></div>
        <h1 style={{ margin: 0, fontSize: 22, textAlign: "center" }}>لوحة الإدارة</h1>
        <label className="fl">
          <span>البريد الإلكتروني <small className="muted" style={{ fontWeight: 400 }}>(لأعضاء الفريق فقط، المالك يتركه فارغاً)</small></span>
          <input className="inp" type="email" dir="ltr" autoComplete="username" value={email} maxLength={254}
            onChange={(e) => { setEmail(e.target.value); setErr(""); }} />
        </label>
        <label className="fl">
          <span>كلمة السر</span>
          <input className="inp" type="password" autoComplete="current-password" value={pw} maxLength={100}
            onChange={(e) => { setPw(e.target.value); setErr(""); }} />
        </label>
        {err && <small className="er" role="alert" style={{ display: "block", marginTop: 8 }}>{err}</small>}
        <button type="submit" className="pri gold big" style={{ width: "100%", marginTop: 16 }} disabled={busy}>
          {busy ? "جارٍ التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
