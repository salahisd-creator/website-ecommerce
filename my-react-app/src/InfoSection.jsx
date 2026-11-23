import { useState } from "react";
import { Link } from "react-router-dom";
import { usePrefs } from "./prefs";

/* النصوص تأتي من القاموس العام (prefs.jsx) حسب لغة الزائر */
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const FAQ = [
  ["هل الساعات أصلية؟", "نعم، جميع ساعاتنا أصلية ومرفقة بضمان لمدة سنة."],
  ["كيف أطلب؟", "اختر الساعة، املأ الاسم والهاتف والولاية، وسنتصل بك لتأكيد الطلب."],
  ["هل الدفع عند الاستلام متاح؟", "نعم، تدفع عند استلام الساعة وفحصها."],
  ["كم تستغرق مدة التوصيل؟", "من 24 إلى 72 ساعة حسب الولاية."],
  ["هل يمكنني الإرجاع أو الاستبدال؟", "نعم، خلال 7 أيام من الاستلام بشرط سلامة الساعة."],
];
const LINKS = [
  ["من نحن", "/about"],
  ["التوصيل والإرجاع", "/shipping"],
  ["سياسة الخصوصية", "/privacy"],
  ["شروط البيع", "/terms"],
  ["اتصل بنا", "/contact"],
];

/* الأيام المغلقة: 5 = الجمعة */
const CLOSED_DAYS = [5];
const OPEN = "09:00 - 21:00";

export default function InfoSection() {
  const { t, dir } = usePrefs();
  const [open, setOpen] = useState(0);
  const today = new Date().getDay();

  return (
    <section className="isd-info" dir={dir}>
      <style>{css}</style>

      <div className="isd-grid">
        {/* أيام العمل */}
        <div className="isd-card">
          <h3>{t("أيام العمل")}</h3>
          <ul className="isd-days">
            {DAYS.map((d, i) => (
              <li key={d} className={i === today ? "now" : ""}>
                <span>{t(d)}</span>
                <span>{CLOSED_DAYS.includes(i) ? t("مغلق") : OPEN}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* الأسئلة الشائعة */}
        <div className="isd-card">
          <h3>{t("أسئلة شائعة")}</h3>
          {FAQ.map(([q, a], i) => (
            <div key={q} className="isd-q">
              <button
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span>{t(q)}</span>
                <b>{open === i ? "−" : "+"}</b>
              </button>
              {open === i && <p>{t(a)}</p>}
            </div>
          ))}
        </div>

        {/* الروابط */}
        <div className="isd-card">
          <h3>{t("روابط مهمة")}</h3>
          <ul className="isd-links">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <Link to={href}>{t(label)}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const css = `
.isd-info{--gold:var(--c-g1);--cream:var(--c-g2);--line:rgba(232,195,106,.45);
  font-family:"Times New Roman",Georgia,serif;color:var(--cream);
  max-width:1100px;margin:0 auto;padding:24px 16px}
.isd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.isd-card{border:1px solid var(--line);border-radius:14px;padding:18px;
  background:rgba(255,255,255,.04)}
.isd-card h3{margin:0 0 12px;color:var(--gold);font-size:18px;font-weight:700}
.isd-days,.isd-links{list-style:none;margin:0;padding:0}
.isd-days li{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;
  border-radius:8px;font-weight:700;font-size:14px}
.isd-days li.now{background:rgba(232,195,106,.18);border:1px solid var(--line)}
.isd-q{border-bottom:1px solid rgba(232,195,106,.2)}
.isd-q:last-child{border:0}
.isd-q button{all:unset;box-sizing:border-box;width:100%;display:flex;
  justify-content:space-between;gap:10px;padding:10px 0;cursor:pointer;
  font-weight:700;font-size:14px;font-family:inherit}
.isd-q button:focus-visible,.isd-links a:focus-visible{
  outline:2px solid var(--gold);outline-offset:2px}
.isd-q b{color:var(--gold)}
.isd-q p{margin:0 0 10px;font-size:14px;line-height:1.7;opacity:.9}
.isd-links a{display:block;padding:9px 10px;border-radius:8px;color:var(--cream);
  text-decoration:none;font-weight:700;font-size:14px}
.isd-links a:hover{background:rgba(232,195,106,.15);color:var(--gold)}
`;