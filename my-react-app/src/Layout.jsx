import { useCallback, useLayoutEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FaPhone, FaEnvelope, FaLocationDot, FaClock } from "react-icons/fa6";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTelegram, FaViber } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import InfoSection from "./InfoSection";
import SideMenu from "./SideMenu";
import { PrefsBar, usePrefs } from "./prefs";
import { useCart } from "./cartStore";
import Pixels from "./pixels";

function Layout() {
  const { t, dir } = usePrefs();
  const { count: cartCount } = useCart();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const goBack = () => { try { if (window.history.state && window.history.state.idx > 0) { navigate(-1); return; } } catch { /* تجاهل */ } navigate("/"); };
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { key, pathname } = useLocation();

  // عند الانتقال لأي صفحة (حتى لو ضغط على نفس الرابط): ابدأ من الأعلى وأغلق القائمة
  useLayoutEffect(() => {
    try { if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual"; } catch { /* تجاهل */ }
    setMenuOpen(false);
    let moved = false;
    const top = () => {
      if (moved) return;
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    top();
    // إن تحرّك الزائر بنفسه (عجلة، لمس، لوحة مفاتيح، أو سحب الشريط) نتوقف عن الضبط
    const stop = () => { if (window.scrollY > 0) moved = true; };
    const stopKey = () => { moved = true; };
    window.addEventListener("scroll", stop, { passive: true });
    window.addEventListener("wheel", stopKey, { passive: true });
    window.addEventListener("touchmove", stopKey, { passive: true });
    window.addEventListener("keydown", stopKey);
    // الصفحات تحمّل محتواها لاحقاً: نعيد الضبط أثناء التحميل
    const timers = [60, 200, 500, 1000].map((ms) => setTimeout(top, ms));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", stop);
      window.removeEventListener("wheel", stopKey);
      window.removeEventListener("touchmove", stopKey);
      window.removeEventListener("keydown", stopKey);
    };
  }, [key]);

  const contacts = [
    { icon: <FaPhone />, label: t("الهاتف"), value: "+213 774 81 21 67", href: "tel:+213774812167" },
    { icon: <FaEnvelope />, label: t("البريد الإلكتروني"), value: "cheribetsal@gmail.com", href: "mailto:cheribetsal@gmail.com" },
    { icon: <FaLocationDot />, label: t("الموقع"), value: t("الجزائر العاصمة، الجزائر") },
    { icon: <FaClock />, label: t("ساعات العمل"), value: t("09:00 - 21:00 · السبت - الخميس") },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      {/* ================= العنصر العلوي (Header) ================= */}
      <h1 id="titleh1">
        ISD | +213
        <img src="/Logoi.jpg" alt="isd +213" id="logoisdimg" />
        <button type="submit" className="user-btn">
          <Link to="/login">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4" />
              <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2z" />
            </svg>
          </Link>
        </button>
        <button type="button" className="menu-btn" aria-label={t("القائمة")} aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <a
          className="location-btn"
          href="https://maps.app.goo.gl/uXtenBHDi6aknz4q8?g_st=com.google.maps.preview.copy"
          target="_blank"
          rel="noreferrer"
          aria-label="Stor Location"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </a>
        <button className="cart-btn" aria-label={t("سلة المشتريات")}>
          <Link to="/cart">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2.5l2 11h10l2-8H7" />
              <circle cx="9.500" cy="19" r="1.600" />
              <circle cx="17" cy="19" r="1.600" />
            </svg>
            {cartCount > 0 && <span className="cart-badge" aria-label={String(cartCount)}>{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </button>
        <button className="heart-btn" aria-label={t("المفضلة")}>
          <Link to="/favorites">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" />
            </svg>
          </Link>
        </button>
      </h1>

      <Pixels />
      <SideMenu open={menuOpen} onClose={closeMenu} />

      <form className="isd-search" onSubmit={handleSearch}>
        <div className="isd-search__row">
        <label className="isd-search__field">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ابحث عن منتج...")}
          />
          <button type="submit" aria-label={t("بحث")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </label>
        <Link className="trk-pill" to="/track" aria-label={t("تتبع طلبي")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
          </svg>
          <span>{t("تتبع طلبي")}</span>
        </Link>
        </div>
      </form>

      {pathname !== "/" && !pathname.startsWith("/admin") && (
        <div className="back-row" dir={dir}>
          <button type="button" className="back-btn" onClick={goBack} aria-label={t("رجوع")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === "rtl" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} /></svg>
            <span>{t("رجوع")}</span>
          </button>
        </div>
      )}

      {/* ================= محتوى الصفحة ================= */}
      <Outlet />

      {/* ================= العنصر السفلي (Footer) ================= */}
      <div id="footer">
        <footer className="footer">
          <img src="/Logoi.jpg" alt="isd +213" id="logoisdimgar" />
          <h1 id="footer-title">ISD+213 </h1>

          <h3>{t("قنواتنا الرسمية")}</h3>
          <div className="socials">
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaXTwitter /></a>
            <a href="#"><FaWhatsapp /></a>
            <a href="#"><FaTelegram /></a>
            <a href="#"><FaViber /></a>
          </div>

          <div className="contact-grid">
            {contacts.map((c) => {
              const Tag = c.href ? "a" : "div";
              return (
                <Tag key={c.label} className="contact-card" href={c.href}>
                  <span className="contact-icon">{c.icon}</span>
                  <span className="contact-text">
                    <small>{c.label}</small>
                    <strong>{c.value}</strong>
                  </span>
                </Tag>
              );
            })}
          </div>

          <PrefsBar />

          <InfoSection />
          <p>{t("© 2026 جميع الحقوق محفوظة (Created by Salah Cherihet)")}</p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;