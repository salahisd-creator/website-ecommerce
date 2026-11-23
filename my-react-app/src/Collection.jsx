/* Collection.jsx ← src/Collection.jsx — مسار: /collection/:slug (original | mid | glasses) */
import React from "react";
import { Link, useParams } from "react-router-dom";
import { usePrefs } from "./prefs";
import { useWatches } from "./useWatches";
import { CardActions, cardStyles, useFavs } from "./ProductCard1";
import Skeleton from './Skeleton';

export const COLLECTIONS = {
  original: { brand: "original", title: "ساعات أصلية" },
  mid: { brand: "mid", title: "ساعات متوسطة" },
  glasses: { brand: "glasses-std", title: "نظارات جودة عادية" },
};
const fmt = (n) => Number(n || 0).toLocaleString("en-US") + " DA";

export default function Collection() {
  const { slug } = useParams();
  const { t } = usePrefs();
  const cfg = COLLECTIONS[slug];
  const { watches, loading } = useWatches(cfg ? cfg.brand : "__none__");
  const { favs, toggleFav } = useFavs();
  if (!cfg) return <p style={{ textAlign: "center" }}>{t("الصفحة غير موجودة")}</p>;
  if (loading) return <Skeleton />;
  return (
    <div>
      <style>{cardStyles}</style>
      <h2 style={{ textAlign: "center", margin: "18px 0 0" }}>{t(cfg.title)}</h2>
      {!watches.length && <p style={{ textAlign: "center" }}>—</p>}
      {watches.map((w) => (
        <div className="watchty-list" key={w.id}>
          <Link to={`/order/${w.slug}`} className="watchty-card">
            <img src={w.images?.[0]} alt={w.name} loading="lazy" />
            <div className="watchty-info">
              <h3>{w.name}</h3>
              <p>{fmt(w.price)}</p>
              <CardActions price={w.price} id={w.slug} favs={favs} toggleFav={toggleFav} />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
