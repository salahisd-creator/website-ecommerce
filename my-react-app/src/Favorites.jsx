import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from './data';
import { readFavs } from './ProductCard1';
import { usePrefs } from './prefs';


export default function Favorites() {
  const { t, money } = usePrefs();
  const [favs, setFavs] = useState(readFavs);

  const items = PRODUCTS.filter((x) =>
    favs.some((f) => f.toLowerCase() === String(x.id).toLowerCase())
  );

  const remove = (id) => {
    const next = favs.filter((f) => f.toLowerCase() !== String(id).toLowerCase());
    setFavs(next);
    try { localStorage.setItem('favs', JSON.stringify(next)); } catch { /* تجاهل */ }
  };

  const imgOf = (x) => {
    const i = x.images ?? x.image ?? [];
    return Array.isArray(i) ? i[0] : i;
  };

  return (
    <div className="fav-page" style={{ minHeight: '100vh', padding: 16,       color: 'var(--st-ink, var(--c-d1))' }}>
      <h2 style={{ textAlign: 'center' }}>{t('المفضلة ❤️')}</h2>

      {items.length === 0 && (
        <p style={{ textAlign: 'center' }}>{t('لا توجد منتجات في المفضلة بعد.')}</p>
      )}

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gap: 12 }}>
        {items.map((x) => (
          <div key={x.id} style={{ display: 'flex', gap: 12, padding: 10,
            background: 'var(--st-card, rgba(255,255,255,.55))', borderRadius: 18 }}>
            <img src={imgOf(x)} alt={x.name}
              style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <b>{x.name}</b>
              <div style={{ color: 'var(--st-gold, var(--c-g0))', margin: '4px 0' }}>
                {money(Number(String(x.price).replace(/[^\d]/g, '')))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/order/${x.id}`}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 0',
                    borderRadius: 10, background: 'var(--st-btn, var(--c-d1))', color: 'var(--st-btn-ink, var(--c-g2))',
                    textDecoration: 'none', fontWeight: 'bold' }}>
                  {t('اشتري الآن')}
                </Link>
                <button onClick={() => remove(x.id)}
                  style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    border: '1.5px solid var(--st-ink, var(--c-d1))', background: 'transparent', color: 'inherit' }}>
                  {t('حذف')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}