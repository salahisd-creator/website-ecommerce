import { useEffect, useState } from "react";
import { usePrefs } from './prefs';
import { Link, useSearchParams } from "react-router-dom";
import Skeleton from './Skeleton';
import { supabase } from "./supabaseClient"; // عدّل المسار إن كان ملفك في مكان آخر

// توحيد النص: أحرف صغيرة، حذف التشكيل، توحيد الهمزات، تحويل - و _ إلى مسافة
const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// مسافة Levenshtein لقياس التشابه الإملائي
function lev(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[m][n];
}

// درجة التشابه بين كلمة البحث واسم المنتج (0 إلى 1)
function score(q, name) {
  const words = [name, ...name.split(" ")];
  return Math.max(
    ...words.map((w) => {
      if (!w) return 0;
      if (w.startsWith(q)) return 0.8;
      return 1 - lev(q, w) / Math.max(q.length, w.length, 1);
    })
  );
}

function Card({ p }) {
  return (
    <Link to={`/order/${p.slug}`} className="search-card">
      <img src={p.images?.[0]} alt={p.name} loading="lazy" decoding="async" />
      <h3>{p.name}</h3>
      <span>{p.price}</span>
    </Link>
  );
}

export default function SearchPage() {
  const { t } = usePrefs();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("watches").select("*");
      if (error) setError(error.message);
      else setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const raw = params.get("q") || "";
  const q = normalize(raw);

  if (loading) return <Skeleton />;
  if (error) return <p>{t("حدث خطأ:")} {error}</p>;
  if (!q) return <p>{t("اكتب اسم المنتج للبحث.")}</p>;

  // تطابق مباشر داخل اسم المنتج
  const exact = products.filter((p) => normalize(p.name).includes(q));

  // منتجات مشابهة إن لم يوجد تطابق
  const similar =
    exact.length === 0
      ? products
          .map((p) => ({ p, s: score(q, normalize(p.name)) }))
          .filter((x) => x.s >= 0.4)
          .sort((a, b) => b.s - a.s)
          .slice(0, 6)
          .map((x) => x.p)
      : [];

  return (
    <div className="search-page">
      {exact.length > 0 ? (
        <>
          <h2>{t("نتائج")} "{raw}"</h2>
          <div className="search-grid">
            {exact.map((p) => (
              <Card key={p.id} p={p} />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2>{t("المنتج")} "{raw}" {t("غير متوفر")}</h2>
          {similar.length > 0 ? (
            <>
              <p>{t("ربما تقصد:")}</p>
              <div className="search-grid">
                {similar.map((p) => (
                  <Card key={p.id} p={p} />
                ))}
              </div>
            </>
          ) : (
            <p>{t("لا توجد منتجات مشابهة.")}</p>
          )}
        </>
      )}
    </div>
  );
}