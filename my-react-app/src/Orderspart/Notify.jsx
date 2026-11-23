/* =========================================================
   Notify.jsx  ←  src/Orderspart/Notify.jsx
   صفحة «الإشعارات والإعلانات» — المسار: /admin/notify
   • إشعار تيليغرام عند كل طلب جديد
   • بيكسل فيسبوك وتيك توك (لتتبّع الإعلانات)
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, AuthError, HttpError } from "./api";
import { useAdmin } from "./context";
import Layout from "./Layout";
import { ERR, KIT_CSS, useToast } from "./kit";
import { Icon } from "./ui";

const TOKEN_RE = /^\d{5,12}:[A-Za-z0-9_-]{30,60}$/;
const CHAT_RE = /^-?\d{4,20}$/;
const FB_RE = /^\d{8,20}$/;
const TT_RE = /^[A-Za-z0-9]{6,32}$/;
const NERR = {
  invalid_token: "مفتاح البوت غير صالح. انسخه كاملاً من BotFather.",
  invalid_chat: "رقم المحادثة غير صالح (أرقام فقط).",
  invalid_fb: "معرّف بيكسل فيسبوك أرقام فقط (8 إلى 20 رقماً).",
  invalid_tiktok: "معرّف بيكسل تيك توك حروف وأرقام فقط.",
};
const errText = (e) => (e instanceof HttpError ? NERR[e.code] || ERR[e.code] || `تعذّر التنفيذ (الرمز ${e.status}).` : "تعذّر الوصول إلى الخادم.");

export default function Notify() {
  const { lock } = useAdmin();
  const [toast, notify] = useToast();
  const mounted = useRef(true);
  const [d, setD] = useState(null);
  const [token, setToken] = useState("");
  const [chat, setChat] = useState("");
  const [fb, setFb] = useState("");
  const [tt, setTt] = useState("");
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState("");

  const load = () => api("/admin/notify").then((r) => {
    if (!mounted.current) return;
    setD(r); setChat(r.telegramChatId || ""); setFb((r.pixels && r.pixels.fb) || ""); setTt((r.pixels && r.pixels.tiktok) || "");
  }).catch((e) => { if (!mounted.current) return; if (e instanceof AuthError) lock(); else notify("تعذّر تحميل الإعدادات."); });
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; /* eslint-disable-next-line */ }, []);

  const call = async (name, fn, okMsg) => {
    setBusy(name);
    try { await fn(); if (mounted.current) notify(okMsg); } catch (x) { if (x instanceof AuthError) lock(); else notify(errText(x)); } finally { if (mounted.current) setBusy(""); }
  };

  const saveTg = (e) => {
    e.preventDefault();
    const er = {};
    if (token.trim() && !TOKEN_RE.test(token.trim())) er.token = NERR.invalid_token;
    if (chat.trim() && !CHAT_RE.test(chat.trim())) er.chat = NERR.invalid_chat;
    setErr(er); if (Object.keys(er).length) return;
    const body = { telegramChatId: chat.trim() };
    if (token.trim()) body.telegramToken = token.trim();
    call("tg", async () => { await api("/admin/notify", { method: "PATCH", body: JSON.stringify(body) }); setToken(""); await load(); }, "تم حفظ إعدادات تيليغرام");
  };
  const clearTg = () => call("tgdel", async () => { await api("/admin/notify", { method: "PATCH", body: JSON.stringify({ telegramToken: "", telegramChatId: "" }) }); setToken(""); await load(); }, "تم حذف إعدادات تيليغرام");
  const testTg = () => call("test", () => api("/admin/notify/test", { method: "POST", body: "{}" }), "أُرسلت رسالة تجربة، افتح تيليغرام وتأكد ✓");
  const savePx = (e) => {
    e.preventDefault();
    const er = {};
    if (fb.trim() && !FB_RE.test(fb.trim())) er.fb = NERR.invalid_fb;
    if (tt.trim() && !TT_RE.test(tt.trim())) er.tt = NERR.invalid_tiktok;
    setErr(er); if (Object.keys(er).length) return;
    call("px", async () => { await api("/admin/notify", { method: "PATCH", body: JSON.stringify({ fb: fb.trim(), tiktok: tt.trim() }) }); await load(); }, "تم حفظ البيكسل، يعمل فوراً في المتجر");
  };

  return (
    <Layout hideSearch toast={toast} need="settings">
      <style>{KIT_CSS}{CSS}</style>
      <div className="crumb"><Icon name="home" size={14} /><Link to="/admin">لوحة التحكم</Link><span>/</span><span>الإشعارات والإعلانات</span></div>
      <div className="ph">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="h1"><span className="gb" />الإشعارات والإعلانات</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>إشعار تيليغرام لكل طلب جديد، وبيكسل فيسبوك وتيك توك لقياس إعلاناتك.</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <section className="ksec">
          <h2><Icon name="bell" size={22} />إشعار تيليغرام</h2>
          <div className="muted">عند وصول طلب جديد تصلك رسالة فيها الاسم والهاتف والولاية والمبلغ.</div>
          {d && d.fromEnv && <div className="knote" style={{ margin: "10px 0" }}>ملاحظة: إن وُضعت القيم في ملف <code>.env</code> فهي تُستعمل أولاً.</div>}
          <details className="how">
            <summary>كيف أحصل على المفتاح والرقم؟ (دقيقتان)</summary>
            <ol>
              <li>افتح تيليغرام وابحث عن <b>@BotFather</b> (الحساب الموثّق بعلامة زرقاء).</li>
              <li>أرسل له <code>/newbot</code> واختر اسماً ثم اسم مستخدم ينتهي بـ <code>bot</code>.</li>
              <li>سيعطيك <b>مفتاحاً</b> طويلاً شكله <code dir="ltr">123456789:AAH...</code> انسخه وضعه في خانة «مفتاح البوت».</li>
              <li>افتح البوت الذي أنشأته وأرسل له كلمة <code>/start</code> (مهم، وإلا لن يستطيع مراسلتك).</li>
              <li>للحصول على <b>رقم المحادثة</b>: ابحث عن <b>@userinfobot</b> وأرسل له أي رسالة، سيعطيك رقماً (Id) ضعه في الخانة الثانية.</li>
              <li>اضغط «حفظ» ثم «إرسال رسالة تجربة».</li>
            </ol>
            <p className="muted">لا تشارك المفتاح مع أحد: من يملكه يتحكم في البوت.</p>
          </details>
          <form onSubmit={saveTg} noValidate>
            <div className="kfg">
              <label className="fl"><span>مفتاح البوت {d && d.telegramToken ? <b className="okk">· محفوظ ✓</b> : null}</span>
                <input className="inp" dir="ltr" type="password" autoComplete="new-password" value={token} onChange={(e) => setToken(e.target.value)} placeholder={d && d.telegramToken ? "اتركه فارغاً للإبقاء على المحفوظ" : "123456789:AAH..."} />
                {err.token && <small className="er" role="alert">{err.token}</small>}</label>
              <label className="fl"><span>رقم المحادثة (Chat ID)</span>
                <input className="inp" dir="ltr" inputMode="numeric" value={chat} onChange={(e) => setChat(e.target.value)} placeholder="123456789" />
                {err.chat && <small className="er" role="alert">{err.chat}</small>}</label>
            </div>
            <div className="btns">
              <button type="submit" className="pri gold" disabled={!!busy}>{busy === "tg" ? "..." : "حفظ"}</button>
              <button type="button" className="chip" disabled={!!busy || !(d && d.telegramToken && d.telegramChatId)} onClick={testTg}>{busy === "test" ? "..." : "إرسال رسالة تجربة"}</button>
              <span style={{ flex: 1 }} />
              <button type="button" className="chip" disabled={!!busy || !(d && (d.telegramToken || d.telegramChatId))} onClick={clearTg}>حذف الإعدادات</button>
            </div>
          </form>
        </section>

        <section className="ksec">
          <h2><Icon name="trend" size={22} />بيكسل الإعلانات</h2>
          <div className="muted">البيكسل «عدّاد» يخبر فيسبوك/تيك توك بمن زار متجرك ومن اشترى، فيعرضان إعلاناتك لأشخاص يشبهونهم ويظهر لك كم طلباً جاء من كل إعلان. لا يعمل شيء إلا بعد أن تضع المعرّف هنا.</div>
          <details className="how">
            <summary>كيف أحصل على معرّف فيسبوك (Meta Pixel ID)؟</summary>
            <ol>
              <li>ادخل إلى <b>business.facebook.com</b> ← <b>مدير الأحداث (Events Manager)</b>.</li>
              <li>اضغط <b>ربط مصادر البيانات (+)</b> ← <b>الويب</b> ← <b>Meta Pixel</b> وسمّه كما تشاء.</li>
              <li>سيظهر <b>رقم</b> من 15–16 خانة (Pixel ID). انسخه وضعه هنا. لا تحتاج لنسخ أي كود.</li>
            </ol>
          </details>
          <details className="how">
            <summary>كيف أحصل على معرّف تيك توك (TikTok Pixel ID)؟</summary>
            <ol>
              <li>ادخل إلى <b>ads.tiktok.com</b> ← <b>Tools</b> ← <b>Events</b> (مدير الأحداث).</li>
              <li>اختر <b>Web Events</b> ← <b>Manually Set Up</b> ← <b>TikTok Pixel</b> وسمّه.</li>
              <li>ستجد <b>Pixel ID</b> (حروف وأرقام شكلها <code dir="ltr">C4ABC123XYZ</code>). انسخه وضعه هنا.</li>
            </ol>
          </details>
          <div className="knote" style={{ margin: "10px 0" }}>
            الأحداث المُرسلة: مشاهدة الصفحة، مشاهدة منتج، إضافة للسلة، بدء الطلب، <b>الشراء</b> (قيمة الطلب بالدينار). لا نرسل اسم الزبون ولا هاتفه. صفحة «سياسة الخصوصية» تذكر هذا للزوار.
          </div>
          <form onSubmit={savePx} noValidate>
            <div className="kfg">
              <label className="fl"><span>Meta (Facebook) Pixel ID</span>
                <input className="inp" dir="ltr" inputMode="numeric" value={fb} onChange={(e) => setFb(e.target.value)} placeholder="1234567890123456" />
                {err.fb && <small className="er" role="alert">{err.fb}</small>}</label>
              <label className="fl"><span>TikTok Pixel ID</span>
                <input className="inp" dir="ltr" value={tt} onChange={(e) => setTt(e.target.value)} placeholder="C4ABC123XYZ" />
                {err.tt && <small className="er" role="alert">{err.tt}</small>}</label>
            </div>
            <div className="btns"><button type="submit" className="pri gold" disabled={!!busy}>{busy === "px" ? "..." : "حفظ البيكسل"}</button></div>
          </form>
        </section>
      </div>
    </Layout>
  );
}

const CSS = `
.how{margin:10px 0;border:1px solid var(--line);border-radius:14px;padding:10px 14px;background:var(--soft)}
.how summary{cursor:pointer;font-weight:700}
.how ol{margin:10px 0 4px;padding-inline-start:22px;line-height:2}
.how code{background:rgba(127,127,127,.18);border-radius:6px;padding:1px 6px;font-size:13px}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;align-items:center}
.okk{color:#14633F}
`;
