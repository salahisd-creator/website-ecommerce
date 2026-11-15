import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from './data';

const fmt = (n) => Number(n).toLocaleString('en-US') + ' دج';

export default function Favorites() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState(
    () => JSON.parse(localStorage.getItem('favs') || '[]')
  );

  const items = PRODUCTS.filter((x) =>
    favs.some((f) => f.toLowerCase() === String(x.id).toLowerCase())
  );

  const remove = (id) => {
    const next = favs.filter((f) => f.toLowerCase() !== String(id).toLowerCase());
    setFavs(next);
    localStorage.setItem('favs', JSON.stringify(next));
  };

  const imgOf = (x) => {
    const i = x.images ?? x.image ?? [];
    return Array.isArray(i) ? i[0] : i;
  };

  return (
    <div style={{ minHeight: '100vh', padding: 16, direction: 'rtl',
      background: 'linear-gradient(180deg,#c9a27e,#b78d68)', color: '#3b2a1a' }}>
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' }}>
        ← رجوع
      </button>
      <h2 style={{ textAlign: 'center' }}>المفضلة ❤️</h2>

      {items.length === 0 && (
        <p style={{ textAlign: 'center' }}>لا توجد منتجات في المفضلة بعد.</p>
      )}

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gap: 12 }}>
        {items.map((x) => (
          <div key={x.id} style={{ display: 'flex', gap: 12, padding: 10,
            background: 'rgba(255,255,255,.55)', borderRadius: 18 }}>
            <img src={imgOf(x)} alt={x.name}
              style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <b>{x.name}</b>
              <div style={{ color: '#8a6508', margin: '4px 0' }}>
                {fmt(Number(String(x.price).replace(/[^\d]/g, '')))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/order/${x.id}`}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 0',
                    borderRadius: 10, background: '#3b2a1a', color: '#f5d98b',
                    textDecoration: 'none', fontWeight: 'bold' }}>
                  اشتري الآن
                </Link>
                <button onClick={() => remove(x.id)}
                  style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    border: '1.5px solid #3b2a1a', background: 'transparent' }}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}