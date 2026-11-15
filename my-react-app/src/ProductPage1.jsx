import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from './data';

const SHEET_URL = "https://script.google.com/macros/s/AKfycbz6uTriEA5WRdmxDBgQse7BiDC04me_JU32lJibGR2iiR62XB8ukcDn68HeyEu2cFQ/exec";

const PHONE = '213774812167';

const WILAYAS = [
  'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة',
  'تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة',
  'سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة',
  'وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة',
  'سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان','تيميمون',
  'برج باجي مختار','أولاد جلال','بني عباس','عين صالح','عين قزام','تقرت','جانت','المغير','المنيعة',
];

const DELIVERY = { home: 800, office: 500 };

const fmt = (n) => Number(n).toLocaleString('en-US') + ' دج';

const styles = `
.pp-root {
  --bg: #c9a27e;
  --bg-deep: #b78d68;
  --ink: #3b2a1a;
  --ink-soft: #6b5239;
  --gold: #8a6508;
  --gold-bright: #f5d98b;
  --glass: rgba(255,255,255,.45);
  --field: rgba(255,255,255,.82);
  --error: #b3341f;
  --btn: #3b2a1a;
  --btn-ink: #f5d98b;

  background: linear-gradient(180deg, var(--bg), var(--bg-deep));
  color: var(--ink);
  min-height: 100vh;
  direction: rtl;
  font-family: Tahoma, "Segoe UI", system-ui, sans-serif;
}

.pp-root * {
  box-sizing: border-box;
}

.pp-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 14px 16px 150px;
}

.pp-back {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: var(--ink);
  font-size: 15px;
  margin-bottom: 10px;
  padding: 0;
}

.pp-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 22px;
  display: block;
  box-shadow: 0 8px 22px rgba(0,0,0,.28);
}

.pp-title {
  font-family: Georgia, serif;
  font-size: 28px;
  margin: 18px 0 2px;
}

.pp-price {
  color: var(--gold);
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 6px;
}

.pp-desc {
  margin: 0 0 18px;
  line-height: 1.9;
  color: var(--ink-soft);
}

.pp-card {
  background: var(--glass);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,.14);
}

.pp-card h2 {
  margin: 0 0 14px;
  text-align: center;
  font-size: 19px;
}

.pp-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.pp-field {
  position: relative;
}

.pp-field input,
.pp-field select {
  width: 100%;
  padding: 22px 14px 8px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  background: var(--field);
  color: var(--ink);
  font: inherit;
  font-size: 16px;
  appearance: none;
}

.pp-field label {
  position: absolute;
  top: 15px;
  right: 14px;
  font-size: 15px;
  color: var(--ink-soft);
  pointer-events: none;
  transition: all .15s;
}

.pp-field input:focus + label,
.pp-field input:not(:placeholder-shown) + label,
.pp-field select:focus + label,
.pp-field select:valid + label {
  top: 6px;
  font-size: 11px;
}

.pp-field input:focus,
.pp-field select:focus {
  outline: none;
  border-color: var(--ink);
}

.pp-field.bad input,
.pp-field.bad select {
  border-color: var(--error);
}

.pp-hint {
  display: none;
  color: var(--error);
  font-size: 12px;
  margin: 4px 6px 0;
}

.pp-field.bad .pp-hint {
  display: block;
}

.pp-legend {
  margin: 16px 0 8px;
  font-weight: bold;
}

.pp-ship {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.pp-ship button {
  font: inherit;
  color: var(--ink);
  background: var(--field);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 14px 8px;
  cursor: pointer;
  text-align: center;
}

.pp-ship button b {
  display: block;
  font-size: 16px;
}

.pp-ship button small {
  display: block;
  margin-top: 4px;
  color: var(--gold);
  font-size: 14px;
}

.pp-ship button[aria-pressed="true"] {
  border-color: var(--ink);
  background: var(--glass);
  box-shadow: inset 0 0 0 1px var(--ink);
}

.pp-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 17px;
}

.pp-qty div {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pp-qty button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: var(--btn);
  color: var(--btn-ink);
  font-size: 22px;
  cursor: pointer;
}

.pp-qty output {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}

.pp-sum {
  margin-top: 16px;
  border-top: 1px dashed var(--ink-soft);
  padding-top: 12px;
}

.pp-sum p {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  color: var(--ink-soft);
}

.pp-trust {
  text-align: center;
  color: var(--ink-soft);
  font-size: 14px;
  margin: 16px 0 0;
}

.pp-toast {
  text-align: center;
  color: var(--gold);
  font-weight: bold;
  margin-top: 10px;
  min-height: 22px;
}

.pp-chat {
  position: fixed;
  left: 12px;
  bottom: 96px;
  display: flex;
  direction: ltr;
  z-index: 5;
}

.pp-chat a {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.28);
}

.pp-chat .viber {
  background: #7360f2;
  position: relative;
  z-index: 1;
}

.pp-chat .wa {
  background: #4fce5d;
  margin-left: -18px;
}

.pp-chat svg {
  width: 30px;
  height: 30px;
  fill: #fff;
}

.pp-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  background: var(--bg-deep);
  border-top: 1px solid rgba(0,0,0,.12);
  box-shadow: 0 -4px 16px rgba(0,0,0,.2);
  padding: 12px 16px;
  z-index: 4;
}

.pp-bar-in {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.pp-bar-total small {
  display: block;
  font-size: 12px;
  color: var(--ink-soft);
}

.pp-bar-total b {
  font-size: 22px;
  color: var(--gold);
}

.pp-order {
  flex: 1;
  border: none;
  border-radius: 14px;
  padding: 16px;
  background: var(--btn);
  color: var(--btn-ink);
  font: inherit;
  font-size: 19px;
  font-weight: bold;
  cursor: pointer;
}

.pp-order:disabled {
  opacity: .6;
  cursor: wait;
}
`;

function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [place, setPlace] = useState('home');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: ''
  });

  const raw = PRODUCTS.find(
    (x) =>
      String(x?.id ?? '').toLowerCase() ===
      String(productId).toLowerCase()
  );

  if (!raw) {
    return <h2 style={{ textAlign: 'center' }}>المنتج غير موجود</h2>;
  }

  const imgs = raw.images ?? raw.image ?? [];

  const p = {
    ...raw,
    images: Array.isArray(imgs) ? imgs : [imgs],
    price: Number(String(raw.price).replace(/[^\d]/g, '')) || 0,
  };

  const total = p.price * qty + DELIVERY[place];

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.value });

  // إرسال الطلب إلى Google Sheets ثم فتح WhatsApp
  const submit = async () => {
    if (loading) return;

    const validationErrors = {
      name: form.name.trim().length < 2,
      phone: !/^0[567]\d{8}$/.test(form.phone.trim()),
      wilaya: !form.wilaya,
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      setDone(false);
      return;
    }

    setLoading(true);
    setDone(false);

    // تجهيز رسالة WhatsApp
    const msg = [
      'طلب جديد 🛒',
      `المنتج: ${p.name}`,
      `الكمية: ${qty}`,
      `الاسم: ${form.name.trim()}`,
      `الهاتف: ${form.phone.trim()}`,
      `الولاية: ${form.wilaya}`,
      `البلدية: ${form.commune || '-'}`,
      `التوصيل: ${place === 'home' ? 'للمنزل' : 'لمكتب التوصيل'}`,
      `سعر المنتجات: ${fmt(p.price * qty)}`,
      `سعر التوصيل: ${fmt(DELIVERY[place])}`,
      `السعر الإجمالي: ${fmt(total)}`,
    ].join('\n');

    // فتح نافذة مسبقاً لتجنب حظرها من المتصفح
    const waWindow = window.open('about:blank', '_blank');

    const data = {
      product: p.name,
      name: form.name.trim(),
      phone: form.phone.trim(),
      wilaya: form.wilaya,
      commune: form.commune.trim(),
      quantity: qty,
      delivery: DELIVERY[place],
      total: total,
    };

    try {
      // إرسال البيانات إلى Google Sheets
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      });

      setDone(true);

      // الانتقال إلى WhatsApp
      const whatsappURL =
        `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

      if (waWindow) {
        waWindow.location.href = whatsappURL;
      } else {
        window.location.href = whatsappURL;
      }

    } catch (error) {
      console.error('Order error:', error);

      if (waWindow) {
        waWindow.close();
      }

      alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-root" id={`product-${p.id}`}>
      <style>{styles}</style>

      <main className="pp-page">

        <button
          className="pp-back"
          onClick={() => navigate(-1)}
        >
          ← رجوع
        </button>

        <img
          className="pp-img"
          src={p.images[0]}
          alt={p.name}
        />

        <h1 className="pp-title">{p.name}</h1>

        <p className="pp-price">{fmt(p.price)}</p>

        <p className="pp-desc">{p.desc}</p>

        <section className="pp-card">

          <h2>املأ الاستمارة للطلب</h2>

          <div className="pp-row">

            <div className={`pp-field ${errors.name ? 'bad' : ''}`}>
              <input
                id="pp-name"
                placeholder=" "
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
              />

              <label htmlFor="pp-name">الاسم واللقب</label>

              <div className="pp-hint">
                اكتب اسمك الكامل
              </div>
            </div>

            <div className={`pp-field ${errors.phone ? 'bad' : ''}`}>
              <input
                id="pp-phone"
                type="tel"
                inputMode="numeric"
                placeholder=" "
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
              />

              <label htmlFor="pp-phone">رقم الهاتف</label>

              <div className="pp-hint">
                مثال: 0555123456
              </div>
            </div>

          </div>

          <div className="pp-row">

            <div className={`pp-field ${errors.wilaya ? 'bad' : ''}`}>
              <select
                id="pp-wilaya"
                required
                value={form.wilaya}
                onChange={set('wilaya')}
              >
                <option value="" hidden></option>

                {WILAYAS.map((w, i) => (
                  <option key={w} value={w}>
                    {i + 1} - {w}
                  </option>
                ))}
              </select>

              <label htmlFor="pp-wilaya">الولاية</label>

              <div className="pp-hint">
                اختر ولايتك
              </div>
            </div>

            <div className="pp-field">
              <input
                id="pp-commune"
                placeholder=" "
                value={form.commune}
                onChange={set('commune')}
              />

              <label htmlFor="pp-commune">البلدية</label>
            </div>

          </div>

          <div className="pp-legend">
            مكان التوصيل
          </div>

          <div className="pp-ship">

            <button
              type="button"
              aria-pressed={place === 'home'}
              onClick={() => setPlace('home')}
            >
              <b>🏠 للمنزل</b>
              <small>{fmt(DELIVERY.home)}</small>
            </button>

            <button
              type="button"
              aria-pressed={place === 'office'}
              onClick={() => setPlace('office')}
            >
              <b>🏢 لمكتب التوصيل</b>
              <small>{fmt(DELIVERY.office)}</small>
            </button>

          </div>

          <div className="pp-qty">

            <span>الكمية</span>

            <div>

              <button
                type="button"
                aria-label="زيادة"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>

              <output>{qty}</output>

              <button
                type="button"
                aria-label="نقصان"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>

            </div>
          </div>

          <div className="pp-sum">

            <p>
              <span>سعر المنتجات</span>
              <span>{fmt(p.price * qty)}</span>
            </p>

            <p>
              <span>سعر التوصيل</span>
              <span>{fmt(DELIVERY[place])}</span>
            </p>

          </div>

        </section>

        <p className="pp-trust">
          الدفع عند الاستلام، والتوصيل لكل الولايات
        </p>

        <div className="pp-toast" role="status">
          {done ? 'تم إرسال بيانات الطلب، أكمل الإرسال من واتساب ✓' : ''}
        </div>

      </main>

      {/* أزرار التواصل */}

      <nav className="pp-chat" aria-label="تواصل معنا">

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

      {/* شريط الطلب السفلي */}

      <div className="pp-bar">

        <div className="pp-bar-in">

          <div className="pp-bar-total">
            <small>التكلفة الإجمالية</small>
            <b>{fmt(total)}</b>
          </div>

          <button
            className="pp-order"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'جارٍ إرسال الطلب...' : 'اطلب الآن'}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductPage