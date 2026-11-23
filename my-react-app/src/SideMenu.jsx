import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { readFavs } from "./ProductCard1";
import { PrefsBar, usePrefs } from "./prefs";
import { useCart } from "./cartStore";

const PHONE = "213774812167";
const MAPS = "https://maps.app.goo.gl/uXtenBHDi6aknz4q8?g_st=com.google.maps.preview.copy";

const ICONS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />,
  watch: <><circle cx="12" cy="12" r="5.5" /><path d="M12 9v3l2 1.5M9 6.5 9.8 2.5h4.4L15 6.5M9 17.5l.8 4h4.4l.8-4" /></>,
  glasses: <><circle cx="6.5" cy="14" r="3.5" /><circle cx="17.5" cy="14" r="3.5" /><path d="M10 14h4M3 14l1.5-6M21 14l-1.5-6" /></>,
  bag: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  hat: <><path d="M4 16c0-5 3.5-9 8-9s8 4 8 9" /><path d="M2.5 16.5c3 1.5 6 2 9.5 2s6.500-.5 9.500-2" /></>,
  cart: <><path d="M3 4h2.5l2 11h10l2-8H7" /><circle cx="9.5" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" /></>,
  heart: <path d="M12 21s-8-5.500-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.500-8 11-8 11z" />,
  user: <><circle cx="12" cy="7.5" r="4" /><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /></>,
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  pin: <><path d="M12 22s7-6.500 7-12a7 7 0 0 0-14 0c0 5.500 7 12 7 12z" /><circle cx="12" cy="10" r="2.500" /></>,
  truck: <><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" /><circle cx="6.500" cy="17.500" r="1.800" /><circle cx="17.500" cy="17.500" r="1.800" /></>,
  cash: <><rect x="2.500" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.500" /></>,
  shield: <path d="M12 3 4.500 6v6c0 4.500 3.200 7.500 7.500 9 4.300-1.500 7.500-4.500 7.500-9V6L12 3zM9 12l2.200 2.200L15.500 10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
};
const Ico = ({ n, s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[n]}</svg>
);

const SHOP = [
  { to: "/", label: "الرئيسية", n: "home" },
  { to: "/rolex", label: "ساعات", n: "watch" },
  { to: "/lun", label: "نظارات", n: "glasses" },
  { to: "/Sakochpage", label: "حقائب", n: "bag" },
  { to: "/casket", label: "قبعات", n: "hat" },
];

export default function SideMenu({ open, onClose }) {
  const { pathname } = useLocation();
  const { t } = usePrefs();
  const { count: cartCount } = useCart();
  const closeRef = useRef(null);
  let favCount = 0;
  try { favCount = readFavs().length; } catch { favCount = 0; }

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current && closeRef.current.focus(), 50);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open, onClose]);

  const link = (it) => (
    <Link key={it.to} to={it.to} onClick={onClose} className={"sm-item" + (pathname === it.to ? " on" : "")}>
      <span className="sm-ic"><Ico n={it.n} /></span>
      <span className="sm-tx">{t(it.label)}</span>
      {it.badge ? <span className="sm-bd">{it.badge}</span> : null}
    </Link>
  );

  return (
    <div className={"sm-root" + (open ? " open" : "")} aria-hidden={!open}>
      <style>{CSS}</style>
      <div className="sm-ov" onClick={onClose} />
      <aside className="sm-panel" role="dialog" aria-modal="true" aria-label={t("القائمة")}>
        <header className="sm-head">
          <img src="/Logoi.jpg" alt="" className="sm-logo" />
          <div className="sm-brand"><b>ISD | +213</b><span>{t("ساعات ونظارات وحقائب وقبعات")}</span></div>
          <button ref={closeRef} className="sm-x" onClick={onClose} aria-label={t("إغلاق القائمة")}><Ico n="x" s={20} /></button>
        </header>

        <div className="sm-body">
          <div className="sm-sec">{t("تسوّق")}</div>
          {SHOP.map(link)}
          {link({ to: "/cart", label: "سلة المشتريات", n: "cart", badge: cartCount || "" })}

          <div className="sm-sec">{t("حسابك")}</div>
          {[{ to: "/favorites", label: "المفضلة", n: "heart", badge: favCount || "" }, { to: "/login", label: "تسجيل الدخول", n: "user" }].map(link)}

          <div className="sm-sec">{t("المظهر")} · {t("اللغة")}</div>
          <PrefsBar className="in-menu" />

          <div className="sm-sec">{t("تواصل معنا")}</div>
          <a className="sm-item" href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span className="sm-ic wa"><Ico n="chat" /></span><span className="sm-tx">{t("واتساب")}</span>
          </a>
          <a className="sm-item" href={`tel:+${PHONE}`} onClick={onClose}>
            <span className="sm-ic"><Ico n="phone" /></span><span className="sm-tx">{t("اتصل بنا")}</span>
          </a>
          <a className="sm-item" href={MAPS} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span className="sm-ic"><Ico n="pin" /></span><span className="sm-tx">{t("موقع المتجر")}</span>
          </a>
        </div>

        <footer className="sm-foot">
          <div><Ico n="truck" s={18} /><span>{t("توصيل لكل الولايات")}</span></div>
          <div><Ico n="cash" s={18} /><span>{t("الدفع عند الاستلام")}</span></div>
          <div><Ico n="shield" s={18} /><span>{t("ضمان على الأصلية")}</span></div>
        </footer>
      </aside>
    </div>
  );
}

const CSS = `
.sm-root{position:fixed;inset:0;z-index:1000;visibility:hidden;pointer-events:none;transition:visibility 0s .3s}
.sm-root.open{visibility:visible;pointer-events:auto;transition:none}
.sm-ov{position:absolute;inset:0;background:rgba(17,12,6,.55);backdrop-filter:blur(3px);opacity:0;transition:opacity .3s}
.sm-root.open .sm-ov{opacity:1}
.sm-panel{position:absolute;top:0;bottom:0;right:0;width:min(340px,86vw);display:flex;flex-direction:column;background:linear-gradient(180deg,var(--c-cream),var(--c-cream2));color:var(--c-bk);font-family:Cairo,Tahoma,sans-serif;box-shadow:-18px 0 40px rgba(0,0,0,.28);border-radius:26px 0 0 26px;transform:translateX(104%);transition:transform .32s cubic-bezier(.2,.8,.2,1);overflow:hidden}
.sm-root.open .sm-panel{transform:none}
.sm-head{display:flex;align-items:center;gap:12px;padding:22px 18px 18px;background:var(--c-bk);color:var(--c-g2);position:relative}
.sm-head::after{content:"";position:absolute;inset-inline:18px;bottom:0;height:2px;background:linear-gradient(90deg,transparent,var(--c-tan),transparent)}
.sm-logo{width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--c-tan);flex:none}
.sm-brand{display:flex;flex-direction:column;line-height:1.35;min-width:0;flex:1}
.sm-brand b{font-size:18px;letter-spacing:.5px;color:var(--c-g2)}
.sm-brand span{font-size:12px;color:var(--c-g1)}
.sm-x{width:40px;height:40px;border-radius:12px;border:1px solid rgba(232,197,143,.35);background:transparent;color:var(--c-g2);display:grid;place-items:center;cursor:pointer;flex:none}
.sm-x:hover{background:rgba(232,197,143,.12)}
.sm-body{flex:1;overflow:auto;padding:6px 14px 10px}
.sm-sec{margin:16px 6px 6px;font-size:12.5px;font-weight:700;color:var(--c-ink4);letter-spacing:.4px}
.sm-item{display:flex;align-items:center;gap:12px;padding:0 10px;min-height:52px;margin-bottom:4px;border-radius:14px;color:var(--c-bk);text-decoration:none;font-weight:700;font-size:16px;transition:background .15s,transform .15s}
.sm-item:hover{background:rgba(255,255,255,.55)}
.sm-item:active{transform:scale(.98)}
.sm-item.on{background:var(--c-bk);color:var(--c-g2)}
.sm-ic{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(201,162,126,.28);color:var(--c-d1);flex:none}
.sm-item.on .sm-ic{background:var(--c-tan);color:var(--c-bk)}
.sm-ic.wa{background:#d9f2df;color:#1a8f45}
.sm-tx{flex:1}
.sm-bd{min-width:24px;height:24px;border-radius:99px;background:var(--c-tan);color:var(--c-bk);font-size:13px;display:grid;place-items:center;padding:0 7px}
.sm-foot{display:grid;gap:8px;padding:14px 18px 20px;background:rgba(20,16,11,.06);border-top:1px solid var(--c-cream2);font-size:13.5px;font-weight:600;color:var(--c-d1)}
.sm-foot div{display:flex;align-items:center;gap:10px}
@media (prefers-reduced-motion:reduce){.sm-panel,.sm-ov{transition:none}}
`;
