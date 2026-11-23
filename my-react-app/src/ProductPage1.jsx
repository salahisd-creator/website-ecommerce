import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct } from './useProduct';
import { usePrefs } from './prefs';
import { useCart } from './cartStore';
import { supabase } from './supabaseClient';
import { track } from './pixels';
import ProductReviews from './ProductReviews';
import { useSeo } from './seo';
import { CheckoutBar, CheckoutCard, PHONE, ppStyles, useCheckout } from './Checkout';
import Skeleton from './Skeleton';

function Gallery({ images, name }) {
  const { t } = usePrefs();
  const list = (images || []).filter(Boolean);
  const n = list.length;
  const [idx, setIdx] = useState(0);
  const [hold, setHold] = useState(false);
  const startX = useRef(null);
  const swiped = useRef(false);
  const [zoom, setZoom] = useState(false);
  const [big, setBig] = useState(false);

  useEffect(() => {
    if (!zoom) return undefined;
    const k = (e) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowLeft') setIdx((i) => (i + 1) % n);
      if (e.key === 'ArrowRight') setIdx((i) => (i - 1 + n) % n);
    };
    document.addEventListener('keydown', k);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = old; };
  }, [zoom, n]);

  // تغيير تلقائي كل 4 ثوانٍ، يتوقف أثناء اللمس
  useEffect(() => {
    if (n < 2 || hold) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % n), 4000);
    return () => clearTimeout(t);
  }, [idx, n, hold]);

  if (n === 0) return <div className="pp-stage" />;

  const go = (i) => setIdx(((i % n) + n) % n);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setHold(true);
  };
  const onTouchEnd = (e) => {
    if (startX.current !== null) {
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > 40) { swiped.current = true; go(dx < 0 ? idx + 1 : idx - 1); }
    }
    startX.current = null;
    setHold(false);
  };

  return (
    <div className="pp-gal">
      <div
        className="pp-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => { startX.current = null; setHold(false); }}
        onClick={() => { if (swiped.current) { swiped.current = false; return; } setBig(false); setZoom(true); }}
        style={{ cursor: 'zoom-in' }}
      >
        {list.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${name} ${i + 1}`}
            className={i === idx ? 'on' : ''}
            draggable={false}
          />
        ))}

        {n > 1 && (
          <>
            <button type="button" className="pp-arrow prev" aria-label={t('السابق')} onClick={() => go(idx - 1)}>›</button>
            <button type="button" className="pp-arrow next" aria-label={t('التالي')} onClick={() => go(idx + 1)}>‹</button>
          </>
        )}
      </div>

      {zoom && (
        <div className="pp-zoom" role="dialog" aria-modal="true" aria-label={t('تكبير الصورة')}>
          <div className="pp-zoom-bg" style={{ backgroundImage: `url(${list[idx]})` }} />
          <button type="button" className="pp-zoom-x" aria-label={t('إغلاق')} onClick={() => setZoom(false)}>✕</button>
          {n > 1 && <button type="button" className="pp-zoom-a prev" aria-label={t('السابق')} onClick={() => { setBig(false); go(idx - 1); }}>›</button>}
          {n > 1 && <button type="button" className="pp-zoom-a next" aria-label={t('التالي')} onClick={() => { setBig(false); go(idx + 1); }}>‹</button>}
          <div className="pp-zoom-sc" onClick={(e) => { if (e.target === e.currentTarget) setZoom(false); }}>
            <img
              src={list[idx]}
              alt={`${name} ${idx + 1}`}
              className={big ? 'big' : ''}
              draggable={false}
              onClick={() => setBig((b) => !b)}
            />
          </div>
          <div className="pp-zoom-n" dir="ltr">{idx + 1} / {n}</div>
        </div>
      )}

      {n > 1 && (
        <div className="pp-thumbs">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={`pp-thumb ${i === idx ? 'on' : ''}`}
              onClick={() => go(i)}
              aria-label={`${t('صورة')} ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


const firstImg = (v) => { const a = Array.isArray(v) ? v : [v]; return a.find((x) => typeof x === 'string' && x) || ''; };
const priceOf = (v) => Number(String(v).replace(/[^\d]/g, '')) || 0;

/* منتجات مشابهة: من نفس العلامة أولاً ثم نفس الفئة */
function Related({ product, slug }) {
  const { t, money } = usePrefs();
  const [list, setList] = useState([]);
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const cols = 'slug,name,price,images';
        let rows = [];
        if (product.brand) {
          const r = await supabase.from('watches').select(cols).eq('brand', product.brand).neq('slug', slug).limit(4);
          if (Array.isArray(r.data)) rows = r.data;
        }
        if (rows.length < 4 && product.category) {
          const r = await supabase.from('watches').select(cols).eq('category', product.category).neq('slug', slug).limit(8);
          if (Array.isArray(r.data)) r.data.forEach((x) => { if (rows.length < 4 && !rows.some((y) => y.slug === x.slug)) rows.push(x); });
        }
        if (!off) setList(rows.filter((x) => x && typeof x.slug === 'string').slice(0, 4));
      } catch { /* بدون مشابهة */ }
    })();
    return () => { off = true; };
  }, [product.brand, product.category, slug]);
  if (!list.length) return null;
  return (
    <section className="pp-rel" aria-label={t('منتجات مشابهة')}>
      <h2>{t('منتجات مشابهة')}</h2>
      <div className="pp-rel-grid">
        {list.map((r) => (
          <Link key={r.slug} className="pp-rel-card" to={`/order/${encodeURIComponent(r.slug)}`}>
            <img src={firstImg(r.images)} alt={r.name} loading="lazy" decoding="async" />
            <div><b>{r.name}</b><span>{money(priceOf(r.price))}</span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductPage() {
  const { productId } = useParams();
  const { product, loading } = useProduct(productId);
  const { t, money } = usePrefs();
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [colorSel, setColorSel] = useState('');
  const [colorErr, setColorErr] = useState(false);

  const raw = product;
  const imgs = raw ? (raw.images ?? raw.image ?? []) : [];
  const p = raw ? {
    ...raw,
    desc: raw.desc ?? raw.bio ?? '',
    images: Array.isArray(imgs) ? imgs : [imgs],
    price: priceOf(raw.price),
  } : null;

  const colors = p && Array.isArray(p.colors) ? p.colors.filter((c) => c && typeof c.name === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.hex || '')) : [];
  const chosen = colors.find((c) => c.name === colorSel) || null;
  const items = p ? [{ slug: productId, name: p.name, price: p.price, qty, color: chosen ? chosen.name : undefined }] : [];
  useSeo(p ? { title: `${p.name} | ISD +213`, description: (p.desc || '').slice(0, 160) || undefined, image: firstImg(p.images) || undefined } : {});
  const needColor = colors.length > 0 && !chosen;
  const co = useCheckout(items, undefined, () => { if (needColor) { setColorErr(true); try { document.querySelector('.pp-colors').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {} return false; } return true; });

  useEffect(() => { setQty(1); setAdded(false); setColorSel(''); setColorErr(false); }, [productId]);
  const viewed = useRef('');
  useEffect(() => {
    if (p && viewed.current !== productId) {
      viewed.current = productId;
      track('ViewContent', { id: productId, value: p.price });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p && p.id, productId]);

  if (loading) return <Skeleton />;
  if (!p) return <p style={{ textAlign: 'center' }}>{t('المنتج غير متوفر')}</p>;

  const addToCart = () => {
    if (colors.length && !chosen) { setColorErr(true); return; }
    cart.add({ slug: productId, name: p.name, price: p.price, image: firstImg(p.images), color: chosen ? chosen.name : '', hex: chosen ? chosen.hex : '' }, qty);
    track('AddToCart', { id: productId, qty, value: p.price * qty });
    setAdded(true);
  };

  return (
    <div className="pp-root" id={`product-${p.id}`}>
      <style>{ppStyles}</style>

      <main className="pp-page">
        <Gallery key={p.id} images={p.images} name={p.name} />

        <h1 className="pp-title">{p.name}</h1>
        <p className="pp-price">{money(p.price)}</p>
        <p className="pp-desc">{p.desc}</p>

        {colors.length > 0 && (
          <section className={`pp-colors${colorErr && !chosen ? ' err' : ''}`} aria-label={t('اللون')}>
            <div className="pp-colors-h"><b>{t('اللون')}</b>{chosen ? <span>{chosen.name}</span> : <span className="req">{t('اختر لوناً')}</span>}</div>
            <div className="pp-sw" role="radiogroup">
              {colors.map((c) => (
                <button key={c.name} type="button" role="radio" aria-checked={chosen === c} className={`pp-swb${chosen === c ? ' on' : ''}`} onClick={() => { setColorSel(c.name); setColorErr(false); }}>
                  <i style={{ background: c.hex }} /><span>{c.name}</span>
                </button>
              ))}
            </div>
            {colorErr && !chosen ? <p className="pp-colerr" role="alert">{t('الرجاء اختيار اللون أولاً')}</p> : null}
          </section>
        )}

        <CheckoutCard co={co}>
          <div className="pp-qty">
            <span>{t('الكمية')}</span>
            <div>
              <button type="button" aria-label={t('زيادة')} onClick={() => setQty(Math.min(20, qty + 1))}>+</button>
              <output>{qty}</output>
              <button type="button" aria-label={t('نقصان')} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            </div>
          </div>
          <button type="button" className="pp-addcart" onClick={addToCart}>🛒 {t('أضف إلى السلة')}</button>
          {added ? <p className="pp-added" role="status">{t('تمت الإضافة إلى السلة')} · <Link to="/cart">{t('عرض السلة')}</Link></p> : null}
        </CheckoutCard>

        <CheckoutBar co={co} />

        <p className="pp-trust">{t('الدفع عند الاستلام، والتوصيل لكل الولايات')}</p>

        <div className="pp-toast" role="status">
          {co.done ? t('تم استلام طلبك ✓') : ''}
        </div>

        <ProductReviews slug={productId} />

        <Related product={p} slug={productId} />
      </main>

      {/* أزرار التواصل */}

      <nav className="pp-chat" aria-label={t("تواصل معنا")}>

        <a
          className="viber"
          href={`viber://chat?number=%2B${PHONE}`}
          aria-label="Viber"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </a>

        <a
          className="wa"
          href={`https://wa.me/${PHONE}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .4l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
          </svg>
        </a>

      </nav>

    </div>
  );
}

export default ProductPage
