import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DARK = "#3a3b3f";
const GOLD = "#f4c542";

/* غيّر الاسم هنا أو اربطه ببيانات المستخدم بعد تسجيل الدخول */
const USER_NAME = "صلاح الدين";

/* عدد الطلبيات الجديدة — اربطه لاحقاً بالـ API */
const NEW_ORDERS = 5;

const PackageIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={GOLD}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M12 12l8-4.5" />
    <path d="M12 12v9" />
    <path d="M12 12L4 7.5" />
    <path d="M8 5.2l8 4.6" />
  </svg>
);

const BagIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={GOLD}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8h12l1 12H5L6 8z" />
    <path d="M9 8V7a3 3 0 0 1 6 0v1" />
  </svg>
);

const OPTIONS = [
  {
    key: "2",
    path: "/admin/orders",
    title: "إدارة الطلبيات",
    desc: "تأكيد الطلبيات وإرسالها للتوصيل",
    Icon: PackageIcon,
  },
  {
    key: "1",
    path: "/",
    title: "المتجر",
    desc: "تصفّح المنتجات والواجهة",
    Icon: BagIcon,
  },
];

export default function ChooseDestination() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);

  let last = null;
  try {
    last = localStorage.getItem("lastDestination");
  } catch (e) {
    last = null;
  }

  const go = (o) => {
    try {
      localStorage.setItem("lastDestination", o.path);
    } catch (e) {}
    navigate(o.path);
  };

  /* اختصارات لوحة المفاتيح: 1 للمتجر و2 للطلبيات */
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const o = OPTIONS.find((x) => x.key === e.key);
      if (o) go(o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, []);

  return (
    <div dir="rtl" style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.head}>
          <h2 style={styles.hello}>مرحباً {USER_NAME}</h2>
          <p style={styles.sub}>إلى أين تريد الذهاب؟</p>
        </div>

        <div style={styles.list}>
          {OPTIONS.map((o) => {
            const isLast = last === o.path;
            const isHover = hover === o.path;
            return (
              <button
                key={o.path}
                onClick={() => go(o)}
                onMouseEnter={() => setHover(o.path)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(o.path)}
                onBlur={() => setHover(null)}
                style={{
                  ...styles.card,
                  border: isLast || isHover ? `2px solid ${GOLD}` : "2px solid transparent",
                  transform: isHover ? "translateY(-4px)" : "none",
                }}
              >
                <div style={styles.iconBox}>
                  <o.Icon />
                </div>

                <div style={styles.text}>
                  <div style={styles.title}>{o.title}</div>
                  <div style={styles.desc}>{o.desc}</div>
                </div>

                {o.key === "2" && NEW_ORDERS > 0 && (
                  <span style={styles.newBadge}>{NEW_ORDERS} جديدة</span>
                )}
                {isLast && <span style={styles.lastBadge}>آخر اختيار</span>}
              </button>
            );
          })}
        </div>

        <p style={styles.hint}>اختصار: اضغط 1 للمتجر أو 2 للطلبيات</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    padding: "32px 16px 48px",
    boxSizing: "border-box",
  },
  wrap: { width: "100%", maxWidth: 460 },
  head: { textAlign: "center", marginBottom: 24 },
  hello: { margin: 0, fontSize: 22, fontWeight: 500, color: DARK },
  sub: { margin: "6px 0 0", fontSize: 14, color: "#5f5e5a" },
  list: { display: "flex", flexDirection: "column", gap: 22 },
  card: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    padding: "22px 16px",
    background: DARK,
    borderRadius: 18,
    cursor: "pointer",
    textAlign: "right",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "transform .2s, border-color .2s",
  },
  iconBox: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 14,
    background: "#4a4b50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: 19, fontWeight: 500, color: GOLD },
  desc: { fontSize: 14, color: "#d3d1c7", marginTop: 4 },
  newBadge: {
    position: "absolute",
    top: -12,
    left: 16,
    background: "#E24B4A",
    color: "#fff",
    borderRadius: 14,
    padding: "3px 12px",
    fontSize: 13,
    fontWeight: 500,
  },
  lastBadge: {
    position: "absolute",
    bottom: -12,
    right: 16,
    background: GOLD,
    color: DARK,
    borderRadius: 14,
    padding: "3px 12px",
    fontSize: 12,
    fontWeight: 500,
  },
  hint: { textAlign: "center", margin: "28px 0 0", fontSize: 13, color: "#888780" },
};