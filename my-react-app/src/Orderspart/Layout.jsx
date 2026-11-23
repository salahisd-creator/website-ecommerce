/* =========================================================
   Layout.jsx  ←  ضعه في: src/admin/Layout.jsx
   الإطار المشترك لكل الصفحات: القائمة الجانبية (كلها روابط) + الشريط العلوي + تنقّل الجوال.
   ========================================================= */
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MANAGE_PATH, NAV, TRACK_PATH } from "./config";
import { useAdmin } from "./context";
import { CSS } from "./styles";
import { Icon } from "./ui";

export default function Layout({ newCount = 0, query = "", setQuery, onBell, toast, overlays, children, hideSearch, placeholder, need }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, me, can } = useAdmin();
  const items = NAV.filter((n) => !n.perm || can(n.perm));
  if (need && !can(need)) return <Navigate to="/admin" replace />;

  const isOn = (to) =>
    to === "/admin" ? pathname === "/admin" || pathname === "/admin/"
      : to === MANAGE_PATH ? pathname.startsWith(MANAGE_PATH)
        : to === TRACK_PATH ? pathname === TRACK_PATH || pathname === TRACK_PATH + "/"
          : pathname === to || pathname.startsWith(to + "/");

  return (
    <div dir="rtl" className="adm" data-theme={theme}>
      <style>{CSS}</style>

      <nav className="sb" aria-label="التنقل">
        <div className="brand">
          <div className="logo"><img src="/Logoi.jpg" alt="ISD" /></div>
          <div className="bt"><b>المتجر</b><span>لوحة الإدارة</span></div>
        </div>
        {items.map((n) => (
          <Link key={n.to} to={n.to} className={`ni${isOn(n.to) ? " on" : ""}`}
            aria-current={isOn(n.to) ? "page" : undefined} title={n.label}>
            <Icon name={n.icon} size={20} /><span className="nl">{n.label}</span>
            {n.badge && newCount > 0 && <span className="nb">{newCount}</span>}
          </Link>
        ))}
        <div className="sbf">
          <div className="cty">الجزائر · دج</div>
          <button className="sw" role="switch" aria-checked={theme === "dark"} onClick={toggleTheme} aria-label="الوضع الداكن">
            <Icon name="sun" size={16} /><span className="sk"><i /></span><Icon name="moon" size={16} />
          </button>
          <Link to="/" className="ni" title="العودة إلى المتجر">
            <Icon name="store" size={20} /><span className="nl">العودة إلى المتجر</span>
          </Link>
        </div>
      </nav>

      <div className="ct">
        <header className="tp">
          {hideSearch || !setQuery ? <span style={{ flex: 1 }} /> : (
            <label className="tsr">
              <Icon name="search" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} maxLength={60} aria-label="بحث"
                placeholder={placeholder || "ابحث عن طلب أو عميل أو رقم هاتف..."} />
            </label>
          )}
          <button className="ib bell" onClick={onBell || (() => navigate(MANAGE_PATH))} aria-label={`طلبيات جديدة: ${newCount}`}>
            <Icon name="bell" />{newCount > 0 && <span className="bb">{newCount}</span>}
          </button>
          <span className="sepv" aria-hidden="true" />
          <div className="adc"><span className="av"><img src="/Logoi.jpg" alt="" /></span><span className="an">{me ? me.name : ""}</span></div>
          <button className="ib" onClick={logout} aria-label="تسجيل الخروج"><Icon name="logout" /></button>
        </header>
        <main className="mn">{children}</main>
      </div>

      <nav className="bn" aria-label="التنقل السريع">
        {items.filter((n) => n.mobile).map((n) => (
          <Link key={n.to} to={n.to} className={`bi${isOn(n.to) ? " on" : ""}`}>
            <Icon name={n.icon} size={22} /><span>{n.label}</span>
          </Link>
        ))}
      </nav>

      {overlays}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
