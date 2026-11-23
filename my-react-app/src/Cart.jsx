/* =========================================================
   Cart.jsx  ←  src/Cart.jsx
   صفحة السلة: عدّة منتجات في طلب واحد.
   ========================================================= */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrefs } from './prefs';
import { useCart } from './cartStore';
import { track } from './pixels';
import { CheckoutBar, CheckoutCard, ppStyles, useCheckout } from './Checkout';

export default function Cart() {
  const { t, money } = usePrefs();
  const cart = useCart();
  const { items, refresh } = cart;
  const co = useCheckout(items, () => cart.clear());

  useEffect(() => { refresh(); }, [refresh]);
  const seen = items.length;
  useEffect(() => {
    if (seen) track('ViewContent', { ids: items.map((i) => i.slug), value: items.reduce((s, i) => s + i.price * i.qty, 0) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empty = items.length === 0 && !co.done;

  return (
    <div className="pp-root">
      <style>{ppStyles}</style>
      <main className="pp-page">
        <h1 className="pp-title">{t('سلة المشتريات')}</h1>

        {empty ? (
          <div className="cart-empty pp-card">
            <p>{t('سلتك فارغة')}</p>
            <Link to="/">{t('تسوق الآن')}</Link>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <section className="pp-card" aria-label={t('سلة المشتريات')}>
                {items.map((i) => (
                  <div className="cart-line" key={i.key}>
                    {i.image ? <img src={i.image} alt="" loading="lazy" decoding="async" /> : <span style={{ width: 72 }} />}
                    <div className="cart-info">
                      <Link to={`/order/${encodeURIComponent(i.slug)}`}>{i.name || i.slug}</Link>
                      <span>{money(i.price)}</span>
                      {i.color ? <span className="cart-col"><i style={{ background: i.hex || '#888' }} />{i.color}</span> : null}
                      <div className="cart-q">
                        <button type="button" aria-label={t('زيادة')} onClick={() => cart.setQty(i.key, i.qty + 1)}>+</button>
                        <output>{i.qty}</output>
                        <button type="button" aria-label={t('نقصان')} onClick={() => cart.setQty(i.key, i.qty - 1)}>−</button>
                        <button type="button" className="cart-rm" onClick={() => cart.remove(i.key)}>{t('حذف')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}
            {items.length > 0 && (
              <div style={{ height: 16 }} />
            )}
            {items.length > 0 && <CheckoutCard co={co} title={t('أكمل طلب السلة')} />}
            <div className="pp-toast" role="status">
              {co.done ? t('تم استلام طلبك ✓') : ''}
            </div>
          </>
        )}
      </main>
      {items.length > 0 ? <CheckoutBar co={co} /> : null}
      
    </div>
  );
}
