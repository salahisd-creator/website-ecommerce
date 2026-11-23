/* آراء الزبائن تحت المنتج + نموذج لإضافة رأي (يُنشر بعد موافقة المتجر) */
import { useEffect, useState } from 'react';
import { usePrefs } from './prefs';
import { compressImage } from './compressImage';

const readData = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
const Stars = ({ n }) => <span className="prv-st" aria-label={`${n}/5`}>{'★'.repeat(n)}<i>{'★'.repeat(5 - n)}</i></span>;

const css = `
.prv{margin:26px 0 8px;padding:18px;border-radius:20px;border:1px solid rgba(212,175,55,.45);background:rgba(128,128,128,.06);color:var(--c-ink2,inherit)}
.prv h3{margin:0 0 4px;font-size:19px}
.prv-avg{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:14px;opacity:.9}
.prv-st{color:#D4AF37;letter-spacing:2px}.prv-st i{font-style:normal;color:rgba(128,128,128,.45)}
.prv-item{padding:12px 0;border-top:1px solid rgba(128,128,128,.25)}
.prv-item p{margin:6px 0;line-height:1.7}
.prv-item small{opacity:.7}
.prv-item img{width:100%;max-width:240px;border-radius:12px;display:block;margin-top:6px}
.prv-form{display:grid;gap:10px;margin-top:14px;padding-top:14px;border-top:1px dashed rgba(212,175,55,.6)}
.prv-form input,.prv-form textarea{padding:12px;border-radius:12px;border:1px solid rgba(128,128,128,.45);background:var(--c-pf,#fff);color:#111;font:inherit;box-sizing:border-box;width:100%}
.prv-form textarea{min-height:90px;resize:vertical}
.prv-pick{display:flex;gap:6px;direction:ltr;justify-content:flex-end}
.prv-pick button{background:none;border:0;font-size:30px;line-height:1;cursor:pointer;color:rgba(128,128,128,.5);padding:0 2px}
.prv-pick button.on{color:#D4AF37}
.prv-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.prv-file{padding:9px 14px;border-radius:999px;border:1px dashed rgba(128,128,128,.6);cursor:pointer;font-size:14px}
.prv-send{padding:13px;border:0;border-radius:14px;background:linear-gradient(135deg,#F6E27A,#D4AF37 55%,#A67C00);color:#1b1405;font:inherit;font-weight:800;cursor:pointer}
.prv-send:disabled{opacity:.6}
.prv-ok{padding:12px;border-radius:14px;background:rgba(46,190,126,.15);border:1px solid #2DBE7E;text-align:center}
.prv-er{color:#e5534b;font-size:14px}
`;

export default function ProductReviews({ slug }) {
  const { t } = usePrefs();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', city: '', rating: 5, text: '' });
  const [img, setImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    setList([]); setSent(false); setOpen(false);
    fetch('/api/reviews?product=' + encodeURIComponent(slug)).then((r) => (r.ok ? r.json() : { reviews: [] })).then((d) => { if (alive) setList(Array.isArray(d.reviews) ? d.reviews : []); }).catch(() => {});
    return () => { alive = false; };
  }, [slug]);

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    try {
      for (const [max, q] of [[1000, 0.78], [800, 0.65], [640, 0.55]]) { const d = await readData(await compressImage(file, { max, quality: q })); if (d.length < 480000) { setImg(d); setErr(''); return; } }
      setErr(t('الصورة كبيرة جداً، اختر صورة أصغر.'));
    } catch { setErr(t('تعذّر قراءة الصورة.')); }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr(t('اكتب اسمك.'));
    if (f.text.trim().length < 3) return setErr(t('اكتب رأيك.'));
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: slug, name: f.name, city: f.city, rating: f.rating, text: f.text, ...(img ? { image: img } : {}) }) });
      if (r.status === 429) setErr(t('محاولات كثيرة، حاول لاحقاً.'));
      else if (!r.ok) setErr(t('تعذّر إرسال رأيك، تأكد من البيانات.'));
      else { setSent(true); setOpen(false); setF({ name: '', city: '', rating: 5, text: '' }); setImg(null); }
    } catch { setErr(t('تعذّر الاتصال بالخادم.')); }
    setBusy(false);
  };
  const avg = list.length ? list.reduce((s, x) => s + x.rating, 0) / list.length : 0;

  return (
    <section className="prv" aria-label={t('آراء الزبائن')}>
      <style>{css}</style>
      <h3>{t('آراء الزبائن عن هذا المنتج')}</h3>
      {list.length > 0 ? <div className="prv-avg"><Stars n={Math.round(avg)} /><b>{avg.toFixed(1)}</b><span>({list.length})</span></div> : <p style={{ opacity: .75, margin: '4px 0 8px' }}>{t('لا توجد آراء بعد. كن أول من يقيّم هذا المنتج.')}</p>}
      {list.map((r) => (
        <div className="prv-item" key={r.id}>
          <Stars n={r.rating} />
          <p>{r.text}</p>
          {r.image ? <img src={r.image} alt="" loading="lazy" /> : null}
          <small>{r.name}{r.city ? ` · ${r.city}` : ''}</small>
        </div>
      ))}
      {sent ? <div className="prv-ok" role="status">{t('شكراً لك! سيظهر رأيك بعد مراجعته.')}</div> : null}
      {!open && !sent ? <button type="button" className="prv-send" style={{ width: '100%', marginTop: 12 }} onClick={() => setOpen(true)}>✍️ {t('أضف رأيك')}</button> : null}
      {open ? (
        <form className="prv-form" onSubmit={submit}>
          <input value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t('الاسم')} aria-label={t('الاسم')} />
          <input value={f.city} maxLength={40} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder={t('المدينة (اختياري)')} aria-label={t('المدينة')} />
          <div className="prv-pick" role="radiogroup" aria-label={t('التقييم')}>
            {[5, 4, 3, 2, 1].map((n) => <button type="button" key={n} role="radio" aria-checked={f.rating === n} className={f.rating >= n ? 'on' : ''} onClick={() => setF({ ...f, rating: n })} aria-label={`${n}`}>★</button>)}
          </div>
          <textarea value={f.text} maxLength={400} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder={t('اكتب رأيك في المنتج...')} aria-label={t('رأيك')} />
          <div className="prv-row">
            <label className="prv-file">📷 {img ? t('تغيير الصورة') : t('إرفاق صورة (اختياري)')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} style={{ display: 'none' }} /></label>
            {img ? <><img src={img} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} /><button type="button" className="prv-file" onClick={() => setImg(null)}>{t('إزالة')}</button></> : null}
          </div>
          {err ? <div className="prv-er" role="alert">{err}</div> : null}
          <button className="prv-send" type="submit" disabled={busy}>{busy ? t('جارٍ الإرسال...') : t('إرسال الرأي')}</button>
        </form>
      ) : null}
    </section>
  );
}
