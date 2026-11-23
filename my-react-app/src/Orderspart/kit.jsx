/* =========================================================
   kit.jsx  ←  ضعه في: src/admin/kit.jsx
   أدوات مشتركة لصفحات: التوصيل، الفريق، الإعدادات (نافذة، زر تفعيل، جدول، تنبيه).
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

export function Modal({ label, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ov" onClick={onClose}>
      <div className="md" style={wide ? { maxWidth: 600 } : undefined} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, flex: 1 }}>{label}</h2>
          <button type="button" className="ib" onClick={onClose} aria-label="إغلاق"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* زر تفعيل / إيقاف */
export function Toggle({ on, onChange, label, disabled }) {
  return (
    <button type="button" className={`ktg${on ? " on" : ""}`} role="switch" aria-checked={on} aria-label={label}
      disabled={disabled} onClick={() => onChange(!on)}><i /></button>
  );
}

export function useToast() {
  const [toast, setToast] = useState("");
  const timer = useRef(null);
  const notify = (t) => {
    setToast(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, notify];
}

export function Confirm({ title, text, busy, onYes, onNo, yes = "تأكيد الحذف" }) {
  return (
    <Modal label={title} onClose={() => !busy && onNo()}>
      <p className="muted" style={{ margin: "10px 0 18px" }}>{text}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="pri big" style={{ flex: 1, background: "#A32D2D", color: "#fff" }} disabled={busy} onClick={onYes}>{busy ? "..." : yes}</button>
        <button className="chip" disabled={busy} onClick={onNo}>إلغاء</button>
      </div>
    </Modal>
  );
}

export const fmtDate = (t) => (t ? new Date(t).toLocaleDateString("en-CA") : "—");

/* ترجمة رموز أخطاء الخادم إلى جُمل مفهومة */
export const ERR = {
  invalid_name: "الاسم غير صالح (حرفان على الأقل).",
  duplicate_name: "هذا الاسم مستعمل من قبل.",
  invalid_url: "رابط الـ API يجب أن يبدأ بـ https://",
  invalid_token: "مفتاح الـ API غير صالح.",
  invalid_email: "البريد الإلكتروني غير صالح.",
  duplicate_email: "هذا البريد مضاف من قبل.",
  invalid_role: "الدور غير صالح.",
  weak_password: "كلمة السر قصيرة (12 حرفاً على الأقل).",
  same_password: "كلمة السر الجديدة يجب أن تختلف عن الحالية.",
  wrong_password: "كلمة السر الحالية غير صحيحة.",
  in_use: "لا يمكن حذفها: توجد طلبيات مرتبطة بها. أوقفها بدل الحذف.",
  forbidden: "ليست لديك صلاحية لهذا الإجراء.",
  too_many: "محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.",
  need_one_payment: "فعّل طريقة دفع واحدة على الأقل.",
  invalid_phone: "رقم الهاتف غير صالح.",
  cannot_delete_self: "لا يمكنك حذف حسابك.",
  cannot_change_self: "لا يمكنك إيقاف حسابك أو تغيير دورك.",
  too_many_companies: "وصلت للحد الأقصى من الشركات.",
  too_many_members: "وصلت للحد الأقصى من الأعضاء.",
};

export const KIT_CSS = `
.kcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.kc{display:flex;align-items:center;gap:14px;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow)}
.kci{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;flex:none}
.kcl{display:block;font-size:13.5px;color:var(--mut);font-weight:600}.kcn{display:block;font-size:28px;font-weight:800;line-height:1.15}
.ktb{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.kadd{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;min-height:46px;padding:0 18px;font-weight:700;font-size:14px;cursor:pointer}
.adm .kadd{background:var(--gold);color:#16181F}
.kt{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden}
.kr{display:grid;grid-template-columns:var(--cols);gap:12px;align-items:center;padding:12px 18px;border-top:1px solid var(--line2);font-size:14.5px}
.kr.hd{background:var(--soft);border-top:0;font-size:13px;font-weight:700;color:var(--mut)}
.kr:not(.hd):hover{background:var(--hov)}
.kn{display:flex;align-items:center;gap:12px;min-width:0}
.kav{width:44px;height:44px;border-radius:50%;background:var(--navy);color:var(--gold);display:grid;place-items:center;font-weight:800;flex:none;font-size:17px}
.adm[data-theme=dark] .kav{background:#2A2F3D}
.knm{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ksb{font-size:12.5px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kbd{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:4px 12px;font-size:12.5px;font-weight:700;white-space:nowrap}
.kbd.ok{background:#DDF3E8;color:#14633F}.kbd.off{background:#ECE9E0;color:#4A4F60}.kbd.gold{background:#FFF1CC;color:#7A5200}
.adm[data-theme=dark] .kbd.ok{background:#173B2A;color:#7FD8A8}.adm[data-theme=dark] .kbd.off{background:#2A2F3D;color:#C9CCD6}.adm[data-theme=dark] .kbd.gold{background:#2C2714;color:#F0B429}
.kact{display:flex;gap:6px}
.kab{width:36px;height:36px;border-radius:10px;border:0;display:grid;place-items:center;cursor:pointer;padding:0}
.adm .kab.e{background:var(--gold);color:#16181F}.adm .kab.d{background:#F9D4D0;color:#9B2C25}.adm .kab.s{background:var(--navy);color:#fff}
.adm[data-theme=dark] .kab.s{background:#2A2F3D}
.kab:disabled{opacity:.35;cursor:not-allowed}.kab:hover:not(:disabled){filter:brightness(.94)}
.ktg{width:46px;height:26px;border-radius:99px;border:0;background:#C9CCD6;position:relative;cursor:pointer;padding:0;transition:background .15s;flex:none}
.ktg i{position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:inset-inline-start .15s;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.ktg.on{background:#2DBE7E}.ktg.on i{inset-inline-start:23px}.ktg:disabled{opacity:.5;cursor:not-allowed}
.knote{background:var(--card);border:1px dashed var(--line);border-radius:14px;padding:12px 16px;color:var(--mut);font-size:13.5px}
.kfg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kck{display:flex;align-items:center;gap:10px;margin-top:14px;font-weight:600;font-size:14px;cursor:pointer}
.kck input{width:20px;height:20px}
.ksec{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);padding:20px}
.ksec h2{margin:0 0 4px;font-size:18px;display:flex;align-items:center;gap:10px}
.ksec>.muted{font-size:13.5px;margin-bottom:6px}
.kpay{display:grid;grid-template-columns:auto 1fr;gap:12px 14px;align-items:center;padding:14px 0;border-top:1px solid var(--line2)}
.kpay:first-of-type{border-top:0}
.kpay b{display:block}.kpay .inp{width:100%}
@media(max-width:860px){
  .kr.hd{display:none}
  .kr{grid-template-columns:1fr auto;gap:8px 12px;margin:10px;border:1px solid var(--line2);border-radius:16px}
  .kr>.k-full{grid-column:1/-1}
  .kfg{grid-template-columns:1fr}
  .kadd{width:100%}
}
`;
