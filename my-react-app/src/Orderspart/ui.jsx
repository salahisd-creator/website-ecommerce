/* =========================================================
   ui.jsx  ←  ضعه في: src/admin/ui.jsx
   مكوّنات صغيرة مشتركة (الأيقونات، القوائم المنسدلة، الترقيم...).
   ========================================================= */
import { PAGE_SIZE, STATUS } from "./config";
export const ICONS = {
  home: ["M3 11l9-8 9 8", "M5 10v10h14V10"],
  radar: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 12l6-4", "M12 12h.01"],
  list: ["M9 6h11", "M9 12h11", "M9 18h11", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
  box: ["M21 8l-9-5-9 5v8l9 5 9-5z", "M3 8l9 5 9-5", "M12 13v8"],
  tag: ["M3 12V3h9l9 9-9 9z"],
  users: ["M16 20c0-3-3-5-7-5s-7 2-7 5", "M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M17 5a3.5 3.5 0 0 1 0 7", "M22 20c0-3-2-5-4-5.5"],
  truck: ["M3 7h11v9H3z", "M14 10h4l3 3v3h-7z", "M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-8", "M22 20H2"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3"],
  search: ["M21 21l-4.3-4.3", "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
  chat: ["M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.9A8.5 8.5 0 1 1 21 11.5z"],
  check: ["M5 12l5 5L20 7"],
  x: ["M6 6l12 12", "M18 6L6 18"],
  dl: ["M12 3v12", "M7 10l5 5 5-5", "M4 20h16"],
  refresh: ["M20 11a8 8 0 1 0-2.3 5.7", "M20 4v7h-7"],
  bell: ["M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z", "M10 21h4"],
  plus: ["M12 5v14", "M5 12h14"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  chev: ["M6 9l6 6 6-6"],
  right: ["M9 6l6 6-6 6"],
  left: ["M15 6l-6 6 6 6"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
  sun: ["M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M12 2v2", "M12 20v2", "M2 12h2", "M20 12h2", "M5 5l1.5 1.5", "M17.5 17.5L19 19", "M19 5l-1.5 1.5", "M6.5 17.5L5 19"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"],
  logout: ["M9 4H5v16h4", "M16 8l4 4-4 4", "M20 12H9"],
  bag: ["M5 8h14l-1 12H6z", "M9 8V6a3 3 0 0 1 6 0v2"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  alert: ["M12 3l10 18H2z", "M12 10v5", "M12 18h.01"],
  dot: ["M12 12h.01"],
  store: ["M4 9l1-5h14l1 5", "M4 9v11h16V9", "M9 20v-6h6v6"],
  shield: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", "M9 12l2 2 4-4"],
  edit: ["M4 20h4L19 9l-4-4L4 16z", "M14 6l4 4"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  key: ["M14 10a4 4 0 1 0-3.5 4L21 14v3h-3v3h-3l-3.5-3.5", "M7.5 10h.01"],
  card: ["M3 6h18v12H3z", "M3 10h18", "M7 15h3"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21c0-4 3.5-6 8-6s8 2 8 6"],
  trend: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  star: ["M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2 6.5 20.2l1-6.2L3 9.6l6.2-.9z"],
  lock: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"],
};
export const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name].map((p, i) => <path key={i} d={p} />)}
  </svg>
);
export const Pill = ({ s }) => <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>;

export const Spark = ({ data, color }) => {
  const w = 100, h = 30;
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - (v / max) * (h - 6)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const Dots = ({ n }) => (
  <span className="dots" title={`${n} محاولة`}>
    {[0, 1, 2].map((k) => <i key={k} className={k < n ? "f" : ""} />)}
  </span>
);

/* قائمة منسدلة قابلة للضغط — القائمة المفتوحة واحدة فقط في الصفحة (openKey) */
export function Dropdown({ k, openKey, setOpenKey, trigger, items, current, onPick, up, triggerClass = "trg", triggerStyle, label }) {
  const open = openKey === k;
  return (
    <div className="dd" onClick={(e) => e.stopPropagation()}>
      <button type="button" className={triggerClass} style={triggerStyle} aria-haspopup="menu" aria-expanded={open}
        aria-label={label} onClick={() => setOpenKey(open ? null : k)}>
        {trigger}<Icon name="chev" size={14} />
      </button>
      {open && (
        <div className={`menu${up ? " up" : ""}`} role="menu">
          {items.map((it) => (
            <button key={it.key} type="button" role="menuitem" className="it"
              onClick={() => { setOpenKey(null); onPick(it.key); }}>
              <Icon name={current === it.key ? "check" : "dot"} size={14} />{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pager({ page, pages, total, onPage }) {
  if (total <= PAGE_SIZE) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  return (
    <div className="pg">
      <span className="muted">عرض {from}–{to} من {total}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="ib sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="الصفحة السابقة"><Icon name="right" size={16} /></button>
        <span style={{ fontWeight: 700 }}>{page} / {pages}</span>
        <button className="ib sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="الصفحة التالية"><Icon name="left" size={16} /></button>
      </div>
    </div>
  );
}

export const Timeline = ({ status }) => {
  if (status === "cancelled") return <div className="alert g">هذه الطلبية ملغاة.</div>;
  const steps = ["new", "confirmed", "shipping", status === "returned" ? "returned" : "delivered"];
  const idx = steps.indexOf(status);
  return (
    <ol className="tl">
      {steps.map((s, i) => (
        <li key={s} className={i <= idx ? "done" : ""}>
          <span className="dotl">{i <= idx && <Icon name="check" size={12} />}</span>{STATUS[s].label}
        </li>
      ))}
    </ol>
  );
};
