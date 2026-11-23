/* =========================================================
   ReviewsSection.jsx  ←  src/ReviewsSection.jsx
   آراء الزبائن في الصفحة الرئيسية. تُخفى كلياً إن لم يوجد تقييم منشور.
   ========================================================= */
import { useEffect, useState } from "react";
import { usePrefs } from "./prefs";

const CSS = `
.rv{margin:34px 0 10px}
.rv h2{text-align:center;margin:0 0 14px;font-size:22px}
.rv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.rv-card{border:1px solid rgba(201,162,126,.55);border-radius:18px;padding:16px;background:rgba(127,127,127,.1)}
.rv-stars{color:var(--c-tan);letter-spacing:2px;font-size:18px;direction:ltr;text-align:start}
.rv-img{width:100%;max-height:260px;object-fit:cover;border-radius:12px;margin-top:10px}
.rv-card p{margin:8px 0 10px;line-height:1.8}
.rv-card b{display:block}
.rv-card small{opacity:.7}
`;

export default function ReviewsSection() {
  const { t, dir } = usePrefs();
  const [list, setList] = useState([]);
  useEffect(() => {
    let off = false;
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && Array.isArray(d.reviews)) setList(d.reviews.slice(0, 12)); })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  if (!list.length) return null;
  return (
    <section className="rv" aria-label={t("آراء زبائننا")} dir={dir}>
      <style>{CSS}</style>
      <h2>{t("آراء زبائننا")}</h2>
      <div className="rv-grid">
        {list.map((r) => {
          const n = Math.max(1, Math.min(5, Number(r.rating) || 5));
          return (
            <article className="rv-card" key={r.id}>
              <div className="rv-stars" role="img" aria-label={`${n}/5`}>{"★".repeat(n)}{"☆".repeat(5 - n)}</div>
              {r.image ? <img className="rv-img" src={r.image} alt="" loading="lazy" decoding="async" /> : null}
              <p>{r.text}</p>
              <b>{r.name}</b>
              {r.city ? <small>{r.city}</small> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
