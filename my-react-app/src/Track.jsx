/* صفحة «تتبع طلبي»: رقم الطلب + رقم الهاتف → حالة الطلب في مراحل واضحة */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePrefs } from './prefs';
import { useSeo } from './seo';

const EV = {
  new: { label: 'تم استلام الطلب', color: '#E0B84A', d: 'M3 7l9-4 9 4v10l-9 4-9-4V7zm9-1.8L6.3 7.6 12 10l5.7-2.4L12 5.2zM5 9.2v6.6l6 2.6v-6.6L5 9.2zm14 0l-6 2.6v6.6l6-2.6V9.2z' },
  confirmed: { label: 'تم تأكيد الطلب', color: '#3B82F6', d: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-1.3 14.3L6.4 12l1.4-1.4 2.9 2.9 5.5-5.5 1.4 1.4-6.9 6.9z' },
  shipping: { label: 'قيد التوصيل', color: '#E8744A', d: 'M3 6h11v9H3V6zm11 3h4l3 3v3h-2a2.5 2.5 0 00-5 0h-1V9zM7.5 15a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm9 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5z' },
  delivered: { label: 'تم التسليم', color: '#22C55E', d: 'M20 6L9 17l-5-5 1.5-1.5L9 14l9.5-9.5L20 6z' },
  returned: { label: 'تم إرجاع الطلب', color: '#E5534B', d: 'M12 5V1L7 6l5 5V7a6 6 0 11-6 6H4a8 8 0 108-8z' },
  cancelled: { label: 'تم إلغاء الطلب', color: '#E5534B', d: 'M12 2a10 10 0 100 20 10 10 0 000-20zm5 13.6L15.6 17 12 13.4 8.4 17 7 15.6 10.6 12 7 8.4 8.4 7l3.6 3.6L15.6 7 17 8.4 13.4 12l3.6 3.6z' },
};
const fmt = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-GB', { month: 'long' });
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${mon} ${d.getFullYear()} -- ${hh}:${mm}`;
};
const dShort = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-GB', { month: 'short' })}`; };
const css = `
.trk .eta{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px 14px;border-radius:16px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.45)}
.trk .eta svg{flex:none;color:#22C55E}
.trk .eta small{display:block;font-size:13px;opacity:.75}
.trk .eta b{font-size:18px}
.trk{max-width:560px;margin:0 auto;padding:6px 16px 50px;color:var(--c-ink2,inherit)}
.trk h2{text-align:center;margin:6px 0 4px;font-size:24px}
.trk .sub{text-align:center;opacity:.8;margin:0 0 16px;font-size:14px;line-height:1.7}
.trk form{display:grid;gap:10px;padding:16px;border-radius:20px;border:1px solid rgba(212,175,55,.5);background:rgba(128,128,128,.07)}
.trk input{padding:13px 14px;border-radius:14px;border:1px solid rgba(128,128,128,.45);background:var(--c-pf,#fff);color:#111;font:inherit;font-size:16px;box-sizing:border-box;width:100%}
.trk button.go{padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#F6E27A,#D4AF37 55%,#A67C00);color:#1b1405;font:inherit;font-weight:800;font-size:16px;cursor:pointer}
.trk button.go:disabled{opacity:.6}
.trk .err{margin-top:12px;padding:12px 14px;border-radius:14px;border:1px solid #e5534b;background:rgba(229,83,75,.1);text-align:center}
.trk .sec{margin-top:14px;padding:16px 18px;border-radius:20px;border:1px solid rgba(128,128,128,.28);background:rgba(128,128,128,.07)}
.trk .sec h3{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:19px}
.trk .sec h3 svg{flex:none;color:#3B82F6}
.trk .lb{font-size:13px;opacity:.65;margin:10px 0 2px}
.trk .vl{font-size:17px;font-weight:600;line-height:1.5}
.trk .row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.trk .tl{list-style:none;margin:0;padding:0}
.trk .tl li{display:flex;gap:14px;position:relative;padding-bottom:22px}
.trk .tl li:last-child{padding-bottom:0}
.trk .tl li:not(:last-child)::after{content:"";position:absolute;inset-inline-start:21px;top:48px;bottom:2px;width:3px;border-radius:2px;background:#3B82F6;opacity:.75}
.trk .tl .ic{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:12px;background:color-mix(in srgb,var(--ec) 16%,transparent);color:var(--ec)}
.trk .tl .tx{min-width:0;padding-top:1px}
.trk .tl .tx small{display:block;font-size:13px;opacity:.65}
.trk .tl .tx b{display:block;font-size:18px;line-height:1.4}
.trk .tl .tx i{display:block;font-style:normal;font-size:13.5px;opacity:.8;margin-top:2px}
.trk .tl li.cur .ic{box-shadow:0 0 0 4px color-mix(in srgb,var(--ec) 28%,transparent)}
.trk .tl li.old .tx{opacity:.8}
.trk .bad{padding:12px;border-radius:14px;background:rgba(229,83,75,.12);border:1px solid #e5534b;text-align:center;font-weight:700;margin-top:14px}
.trk .kv{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(128,128,128,.22);font-size:14.5px}
.trk .kv:first-of-type{border-top:0}
.trk .kv span{opacity:.7}
`;
const Ico = ({ d, s = 24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;

export default function Track() {
  const { t, money } = usePrefs();
  useSeo({ title: t('تتبع طلبي') + ' | ISD +213', description: t('تتبع حالة طلبك بإدخال رقم الطلب ورقم الهاتف.') });
  const [q] = useSearchParams();
  const last = (() => { try { return JSON.parse(localStorage.getItem('isd-last-order') || '{}') || {}; } catch { return {}; } })();
  const [id, setId] = useState(q.get('id') || last.id || '');
  const [phone, setPhone] = useState(q.get('phone') || last.phone || '');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const look = async (e) => {
    if (e) e.preventDefault();
    const i = id.replace(/\D/g, ''), p = phone.replace(/\D/g, '');
    if (!i || p.length < 9) { setErr(t('أدخل رقم الطلب ورقم الهاتف.')); setRes(null); return; }
    setBusy(true); setErr(''); setRes(null);
    try {
      const r = await fetch(`/api/track?id=${encodeURIComponent(i)}&phone=${encodeURIComponent(p)}`);
      if (r.status === 429) setErr(t('محاولات كثيرة، انتظر قليلاً ثم حاول مرة أخرى'));
      else if (r.status === 404) {
        let j = null; try { j = await r.json(); } catch { /* تجاهل */ }
        setErr(j && j.error === 'no_order' ? t('لم نجد طلباً بهذه البيانات. تأكد من الرقم والهاتف.') : t('تعذّر التتبع حالياً، حاول لاحقاً.'));
      } else if (!r.ok) setErr(t('تعذّر الاتصال بالخادم. حاول لاحقاً.'));
      else setRes(await r.json());
    } catch { setErr(t('تعذّر الاتصال بالخادم. حاول لاحقاً.')); }
    setBusy(false);
  };
  useEffect(() => { if (q.get('id') && q.get('phone')) look(); /* eslint-disable-next-line */ }, []);

  const events = (() => {
    if (!res) return [];
    let h = Array.isArray(res.hist) ? res.hist.filter((x) => EV[x.s]) : [];
    if (!h.length) h = [{ s: 'new', at: res.createdAt }];
    if (h[h.length - 1].s !== res.status && EV[res.status]) h = h.concat({ s: res.status, at: '' });
    return h.slice().reverse();
  })();
  const placeTxt = res && res.place === 'office' ? t('مكتب توصيل') : res && res.place === 'home' ? t('للمنزل') : '';
  return (
    <div className="trk">
      <style>{css}</style>
      <h2>🚚 {t('تتبع طلبي')}</h2>
      <p className="sub">{t('أدخل رقم طلبك (الذي ظهر لك بعد إتمام الطلب) ورقم هاتفك.')}</p>
      <form onSubmit={look}>
        <input inputMode="numeric" value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder={t('رقم الطلب')} aria-label={t('رقم الطلب')} dir="ltr" />
        <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 20))} placeholder={t('رقم الهاتف')} aria-label={t('رقم الهاتف')} dir="ltr" />
        <button className="go" type="submit" disabled={busy}>{busy ? t('جارٍ البحث...') : t('تتبع')}</button>
      </form>
      {err ? <div className="err" role="alert">{err}</div> : null}
      {res ? (
        <>
          <div className="sec">
            <div className="row"><span>{t('رقم الطلب')}</span><b dir="ltr" style={{ fontSize: 22 }}>#{res.id}</b></div>
          </div>
          <div className="sec">
            <h3><Ico s={26} d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.4l4 2.4-.8 1.3L11 13V7h2z" />{t('حالة الطلب')}</h3>
            {res.eta ? (
              <div className="eta">
                <Ico s={30} d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zM7 12h4v4H7v-4z" />
                <div><small>{t('الوقت المتوقع للوصول')}</small><b dir="ltr">{dShort(res.eta.from)} → {dShort(res.eta.to)}</b></div>
              </div>
            ) : null}
            <ol className="tl">
              {events.map((e, i) => {
                const ev = EV[e.s];
                return (
                  <li key={i} className={i === 0 ? 'cur' : 'old'} style={{ '--ec': ev.color }}>
                    <span className="ic"><Ico d={ev.d} /></span>
                    <div className="tx">
                      <small>{t(ev.label)}</small>
                      <b dir="ltr" style={{ textAlign: 'start' }}>{e.at ? fmt(e.at) : '—'}</b>
                      {e.s === 'shipping' && res.tracking ? <i>{res.company ? res.company + ' · ' : ''}<span dir="ltr">{res.tracking}</span></i> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="sec">
            <h3><Ico s={26} d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />{t('تفاصيل التوصيل')}</h3>
            <div className="lb">{t('الولاية')}</div>
            <div className="vl">{res.wilaya}{res.commune ? ` - ${res.commune}` : ''}</div>
            {placeTxt ? (<><div className="lb">{t('نوع التوصيل')}</div><div className="vl">{placeTxt}</div></>) : null}
            {res.tracking ? (<><div className="lb">{res.company || t('رقم التتبع')}</div><div className="vl" dir="ltr" style={{ textAlign: 'start' }}>{res.tracking}</div></>) : null}
          </div>
          <div className="sec">
            <h3><Ico s={26} d="M7 4h10l3 4v12H4V8l3-4zm1 6a4 4 0 008 0h-2a2 2 0 01-4 0H8z" />{t('المنتجات')}</h3>
            {(res.items || []).map((it, i) => <div className="kv" key={i}><span>{it.name}{it.color ? ` (${it.color})` : ''}</span><b>× {it.qty}</b></div>)}
            <div className="kv"><span>{t('المجموع')}</span><b>{money(res.total)}</b></div>
          </div>
        </>
      ) : null}
    </div>
  );
}
