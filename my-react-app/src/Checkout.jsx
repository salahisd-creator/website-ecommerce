/* =========================================================
   Checkout.jsx  ←  src/Checkout.jsx
   منطق الطلب المشترك بين صفحة المنتج وصفحة السلة:
   الاستمارة + أسعار التوصيل الحقيقية لكل ولاية + طريقة الدفع + الإرسال للخادم.
   السعر النهائي يحسبه الخادم، وما يظهر هنا للعرض فقط.
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { usePrefs } from './prefs';
import { useStoreSettings } from './settings';
import { track } from './pixels';
import { compressImage } from './compressImage';

const readDataUrl = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
/* يصغّر صورة الوصل حتى لا تتجاوز ~350KB */
async function receiptToDataUrl(file) {
  for (const [max, q] of [[1100, 0.78], [900, 0.65], [700, 0.55]]) {
    const f = await compressImage(file, { max, quality: q });
    const d = await readDataUrl(f);
    if (d.length < 480000) return d;
  }
  return null;
}

export const PHONE = '213774812167';

const WILAYAS = [
  'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة',
  'تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة',
  'سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة',
  'وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة',
  'سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان','تيميمون',
  'برج باجي مختار','أولاد جلال','بني عباس','عين صالح','عين قزام','تقرت','جانت','المغير','المنيعة',
];


export const fmt = (n) => Number(n).toLocaleString('en-US') + ' دج';

export const ppStyles = `
.pp-ordno{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:8px 0 12px;padding:12px 14px;border-radius:16px;border:2px dashed #D4AF37;background:rgba(212,175,55,.12)}
.pp-ordno span{font-size:14px;opacity:.8}.pp-ordno b{font-size:26px;letter-spacing:1px;color:inherit}
.pp-ordno button{border:1px solid rgba(128,128,128,.5);background:transparent;color:inherit;border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
.pp-trkhint{font-size:13px;line-height:1.7;opacity:.85;margin:6px 0 10px}
.pp-done-trk{display:block;text-align:center;padding:13px;border-radius:14px;background:linear-gradient(135deg,#F6E27A,#D4AF37 55%,#A67C00);color:#1b1405;font-weight:800;text-decoration:none;margin-bottom:8px}
.pp-colors{margin:14px 0;padding:14px;border-radius:16px;border:1px solid rgba(128,128,128,.35);background:rgba(128,128,128,.07);color:var(--c-ink2,inherit)}
.pp-colors.err{border-color:#e5534b;animation:ppshake .4s}
.pp-colors-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.pp-colors-h .req{color:#e5534b;font-size:13px}
.pp-sw{display:flex;flex-wrap:wrap;gap:8px}
.pp-swb{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:2px solid rgba(128,128,128,.4);background:transparent;color:var(--c-ink2,inherit);font:inherit;font-size:14px;cursor:pointer;transition:transform .15s,border-color .15s}
.pp-swb i{width:20px;height:20px;border-radius:50%;border:1px solid rgba(128,128,128,.55);display:inline-block}
.pp-swb:hover{transform:translateY(-1px)}
.pp-swb.on{border-color:var(--c-g0,#D4AF37);box-shadow:0 0 0 3px rgba(212,175,55,.25);font-weight:bold}
.pp-colerr{color:#e5534b;margin:8px 0 0;font-size:13px}
.cart-col{display:inline-flex;align-items:center;gap:6px;font-size:13px;opacity:.85}
.cart-col i{width:14px;height:14px;border-radius:50%;border:1px solid rgba(128,128,128,.55);display:inline-block}
.pp-root {
  --bg: var(--c-tan);
  --bg-deep: var(--c-tan);
  --ink: var(--c-d1);
  --ink-soft: var(--c-ink4);
  --gold: var(--c-g0);
  --gold-bright: var(--c-g2);
  --glass: rgba(255,255,255,.45);
  --field: rgba(255,255,255,.82);
  --error: #b3341f;
  --btn: var(--c-d1);
  --btn-ink: var(--c-g2);
  --line: rgba(59,42,26,.18);
  --pop: var(--c-cream);
  --bar: var(--c-tan);

  color: var(--ink);
  font-family: Tahoma, "Segoe UI", system-ui, sans-serif;
}

.pp-root * {
  box-sizing: border-box;
}

.pp-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 14px 16px 28px;
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

.pp-paywrap { position: relative; }

.pp-paybtn {
  width: 100%;
  font: inherit;
  color: var(--ink);
  background: var(--field);
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: start;
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
  transition: border-color .2s, box-shadow .2s;
}

.pp-paybtn:hover,
.pp-paybtn.open { border-color: var(--ink); box-shadow: 0 4px 16px rgba(0,0,0,.16); }

.pp-payico {
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--btn);
  color: var(--btn-ink);
}

.pp-payico.sm { width: 36px; height: 36px; border-radius: 12px; }

.pp-paytxt { flex: 1; min-width: 0; }
.pp-paytxt b { font-size: 16px; }

.pp-chev { flex: none; transition: transform .25s; color: var(--ink-soft); }
.pp-paybtn.open .pp-chev { transform: rotate(180deg); }

.pp-paylist {
  list-style: none;
  margin: 8px 0 0;
  padding: 6px;
  position: absolute;
  inset-inline: 0;
  top: 100%;
  z-index: 20;
  background: var(--pop);
  border: 1.5px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(0,0,0,.28);
  animation: pp-pop .16s ease-out;
}

@keyframes pp-pop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

.pp-paylist li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 13px;
  cursor: pointer;
  color: var(--ink);
}

.pp-paylist li:hover,
.pp-paylist li:focus-visible { background: var(--glass); outline: none; }

.pp-paylist li.on { background: var(--glass); }
.pp-paylist li.on svg:last-child { color: var(--gold); }

.pp-paynote {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--glass);
  font-size: 14px;
  word-break: break-word;
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
  position: sticky;
  bottom: 0;
  background: var(--bar);
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

/* ===== معرض الصور ===== */
.pp-gal { position: relative; }
.pp-stage {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(0,0,0,.28);
  touch-action: pan-y;
  background: rgba(0,0,0,.08);
}
.pp-stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity .45s;
  user-select: none;
  -webkit-user-drag: none;
}
.pp-stage img.on { opacity: 1; }
.pp-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,.55);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
}
.pp-arrow.prev { right: 10px; }
.pp-arrow.next { left: 10px; }
.pp-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
  padding: 4px 2px;
}
.pp-thumb {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  opacity: .65;
  background: none;
}
.pp-thumb.on { border-color: var(--ink); opacity: 1; }
.pp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.pp-addcart{width:100%;margin-top:14px;padding:13px;border-radius:14px;border:2px solid var(--ink);background:transparent;color:var(--ink);font:inherit;font-size:16px;font-weight:bold;cursor:pointer}
.pp-addcart:hover{background:var(--glass)}
.pp-added{margin:8px 0 0;text-align:center;color:var(--gold);font-weight:bold}
.pp-added a{color:inherit;text-decoration:underline}
.pp-ship button:disabled{opacity:.45;cursor:not-allowed}
.pp-ship small.na{color:var(--ink-soft)}
.pp-err{margin:10px 0 0;padding:10px 12px;border-radius:12px;background:rgba(179,52,31,.12);color:var(--error);font-weight:bold;text-align:center}
.pp-rel{margin-top:26px}
.pp-rel h2{font-size:19px;margin:0 0 12px}
.pp-rel-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pp-rel-card{display:block;text-decoration:none;color:var(--ink);background:var(--glass);border-radius:18px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,.12)}
.pp-rel-card img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:rgba(0,0,0,.08)}
.pp-rel-card div{padding:10px 12px}
.pp-rel-card b{display:block;font-size:14px;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pp-rel-card span{color:var(--gold);font-weight:bold;font-size:14px}
/* السلة */
.cart-line{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
.cart-line:last-child{border:0}
.cart-line img{width:72px;height:72px;object-fit:cover;border-radius:14px;flex:none;background:rgba(0,0,0,.08)}
.cart-info{flex:1;min-width:0}
.cart-info a{color:var(--ink);text-decoration:none;font-weight:bold;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cart-info span{color:var(--gold);font-weight:bold;font-size:14px}
.cart-q{display:flex;align-items:center;gap:8px;margin-top:6px}
.cart-q button{width:32px;height:32px;border:0;border-radius:10px;background:var(--btn);color:var(--btn-ink);font-size:18px;cursor:pointer}
.cart-q output{min-width:18px;text-align:center;font-weight:bold}
.cart-q button.cart-rm{width:auto;height:auto;background:none;border:0;color:var(--error);cursor:pointer;font:inherit;font-size:13px;margin-inline-start:auto;padding:4px 6px;border-radius:8px}
.cart-empty{text-align:center;padding:40px 10px}
.cart-empty a{display:inline-block;margin-top:14px;padding:12px 22px;border-radius:14px;background:var(--btn);color:var(--btn-ink);text-decoration:none;font-weight:bold}
/* ===== الشكل الجديد للاستمارة ===== */
.pp-root{--pf:var(--c-pf);--sh:0 6px 18px rgba(18,32,58,.13)}
.pp-card{background:transparent;box-shadow:none;padding:6px 0 0}
.pp-card h2{font-size:26px;font-weight:800;margin:0 0 16px;color:var(--ink)}
.pp-row{gap:12px;margin-bottom:12px}
.pp-card>.pp-field{margin-bottom:12px}
.pp-field .pp-ic{position:absolute;inset-inline-start:15px;top:28px;transform:translateY(-50%);color:var(--gold);pointer-events:none;z-index:1}
.pp-field input,.pp-field select{height:56px;padding:0 14px;padding-inline:48px 14px;border-radius:22px;border:1.5px solid transparent;background:var(--pf);color:var(--ink);box-shadow:var(--sh);font-size:16px}
.pp-field input::placeholder{color:var(--ink-soft);opacity:.9}
.pp-field select.empty{color:var(--ink-soft)}
.pp-field select option{color:#12203A;background:#fff}
.pp-field input:focus,.pp-field select:focus{border-color:var(--gold)}
.pp-field.bad input,.pp-field.bad select{border-color:var(--error)}
.pp-field label{display:none}
.pp-legend{font-size:20px;font-weight:800;margin:20px 0 10px}
.pp-ship{gap:12px}
.pp-ship button{display:flex;align-items:center;gap:10px;text-align:start;background:var(--pf);border:2px solid transparent;border-radius:22px;box-shadow:var(--sh);padding:12px 14px;min-height:64px}
.pp-ship button .pp-shi{color:var(--gold);display:grid;place-items:center;flex:none}
.pp-ship button .pp-sht{display:block;min-width:0}
.pp-ship button b{font-size:15px;line-height:1.3}
.pp-ship button small{margin-top:2px;color:var(--ink-soft);font-size:14px}
.pp-ship button[aria-pressed="true"]{border-color:var(--gold);background:var(--pf);box-shadow:var(--sh),0 0 0 3px color-mix(in srgb,var(--gold) 18%,transparent)}
.pp-paybtn{background:var(--pf);border:1.5px solid color-mix(in srgb,var(--gold) 35%,transparent);border-radius:22px;box-shadow:var(--sh);min-height:56px}
.pp-qty{margin-top:20px}
.pp-qty>span{font-size:20px;font-weight:800}
.pp-qty button{width:48px;height:48px;border-radius:50%;background:var(--pf);color:var(--ink);box-shadow:var(--sh);font-size:24px}
.pp-qty output{font-size:20px;min-width:28px}
.pp-addcart{border-radius:22px}
.pp-sum{border-top:1px dashed color-mix(in srgb,var(--ink) 30%,transparent)}
.pp-bar{position:static;background:transparent;border:0;box-shadow:none;padding:6px 0 18px}
.pp-bar-in{flex-direction:column;align-items:stretch;gap:14px}
.pp-bar-total{display:flex;align-items:baseline;gap:8px;font-size:26px;font-weight:800;color:var(--ink)}
.pp-bar-total span{font-size:24px}
.pp-bar-total b{font-size:28px;color:var(--ink)}
.pp-order{flex:none;width:100%;border-radius:999px;padding:18px;font-size:22px;color:var(--c-bt);background:linear-gradient(90deg,var(--c-b1),var(--c-b2));box-shadow:0 8px 22px rgba(18,32,58,.25)}


.pp-done{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px}
.pp-done-box{max-height:92vh;overflow:auto;background:var(--c-pf,#fff);color:var(--ink);border-radius:26px;padding:28px 22px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.pp-done-ic{width:68px;height:68px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:36px;color:var(--c-bt);background:linear-gradient(90deg,var(--c-b1),var(--c-b2))}
.pp-done-box h3{margin:0 0 8px;font-size:22px}
.pp-done-box p{margin:6px 0;font-size:15px;opacity:.85}
.pp-done-wa{display:block;margin:16px 0 10px;padding:14px;border-radius:999px;background:#25D366;color:#fff;text-decoration:none;font-weight:bold}
.pp-done-ok{width:100%;padding:14px;border-radius:999px;border:1px solid var(--line,#999);background:transparent;color:inherit;font:inherit;font-weight:bold;cursor:pointer}

.pp-zoom{position:fixed;inset:0;z-index:100000;background:#1b2a47;overflow:hidden;display:flex;align-items:center;justify-content:center}
.pp-zoom-bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(34px) saturate(1.2) brightness(.75);transform:scale(1.1)}
.pp-zoom-sc{position:absolute;z-index:1;inset:0;overflow:auto;display:flex;touch-action:pan-x pan-y pinch-zoom;-webkit-overflow-scrolling:touch}
.pp-zoom-sc img{margin:auto;max-width:96%;max-height:94%;border-radius:18px;box-shadow:0 12px 50px rgba(0,0,0,.45);object-fit:contain;cursor:zoom-in;user-select:none}
.pp-zoom-sc img.big{max-width:none;max-height:none;width:240%;cursor:zoom-out}
.pp-zoom-x{position:absolute;top:14px;left:14px;z-index:3;width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:22px;cursor:pointer}
.pp-zoom-a{position:absolute;top:50%;z-index:3;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:30px;cursor:pointer}
.pp-zoom-a.prev{right:10px}.pp-zoom-a.next{left:10px}
.pp-zoom-n{position:absolute;bottom:16px;left:0;right:0;text-align:center;color:#fff;font-size:14px;z-index:3;pointer-events:none}
.pp-desc{white-space:pre-line}

.pp-receipt{margin:10px 0;padding:12px;border-radius:18px;border:2px dashed var(--c-b2);background:rgb(var(--c-g1-rgb) / .12)}
.pp-receipt.bad{border-color:#d33;animation:ppshake .35s}
.pp-rc-warn{font-size:14px;line-height:1.8;padding:10px 12px;border-radius:12px;background:rgba(255,170,0,.16);border:1px solid rgba(255,170,0,.55);margin-bottom:10px}
.pp-rc-pick{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:var(--c-pf);cursor:pointer;font-weight:bold}
.pp-rc-pick input{display:none}
.pp-rc-pick img{width:64px;height:64px;border-radius:10px;object-fit:cover}
.pp-rc-ph{width:64px;height:64px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;background:rgb(var(--c-g1-rgb) / .25)}
.pp-rc-del{margin-top:8px;border:0;background:none;color:#c0392b;cursor:pointer;font:inherit;text-decoration:underline}
@keyframes ppshake{25%{transform:translateX(5px)}75%{transform:translateX(-5px)}}
.pp-field select:disabled{opacity:.6}
`;


const Ic = ({ d }) => (
  <svg className="pp-ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const IcUser = () => <Ic d={<><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5" /></>} />;
const IcPhone = () => <Ic d={<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />} />;
const IcMap = () => <Ic d={<><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>} />;
const IcPin = () => <Ic d={<><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>} />;
const IcHome = () => <Ic d={<><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>} />;
const IcTruck = () => <Ic d={<><path d="M2 6h11v10H2zM13 9h4l4 3v4h-8" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>} />;

export function PayIcon({ k }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (k === 'bank') return <svg {...p}><path d="M3 10 12 4l9 6M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18" /></svg>;
  if (k === 'redotpay' || k === 'paypal' || k === 'binance') return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.800 2.500 2.800 15.500 0 18M12 3c-2.800 2.500-2.800 15.500 0 18" /></svg>;
  if (k === 'ccp' || k === 'baridimob') return <svg {...p}><rect x="2.500" y="5" width="19" height="14" rx="2.500" /><path d="M2.500 10h19M6.500 15h4" /></svg>;
  return <svg {...p}><path d="M4 7.500A2.500 2.500 0 0 1 6.500 5H19v3" /><path d="M4 7.500V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.500A2.500 2.500 0 0 1 4 7.500z" /><circle cx="16.500" cy="13.500" r="1.200" fill="currentColor" /></svg>;
}


const ERR = {
  invalid_wilaya: 'اختر ولاية صحيحة',
  office_unavailable: 'التوصيل لمكتب غير متوفر في هذه الولاية، اختر التوصيل للمنزل',
  invalid_product: 'هذا المنتج غير متوفر أو بدون سعر حالياً. تواصل معنا أو اختر منتجاً آخر.',
  too_many: 'محاولات كثيرة، انتظر دقيقة ثم حاول مرة أخرى',
  receipt_required: 'أرفق صورة وصل الدفع (صورة واضحة) ثم أعد المحاولة',
  too_large: 'حجم الصورة كبير، اختر صورة أصغر',
};

/* items: [{ slug, name, price, qty }] — price للعرض فقط */
export function useCheckout(items, onPlaced, guard) {
  const { t } = usePrefs();
  const { payments, rateFor, rates } = useStoreSettings();
  const ratesReady = Object.keys(rates).length > 0;
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '' });
  const [place, setPlace] = useState('home');
  const [pay, setPay] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [serverErr, setServerErr] = useState('');
  const [receipt, setReceiptState] = useState(null); // { file, url }
  const [communes, setCommunes] = useState([]);
  const started = useRef(false);
  const leadSig = useRef('');

  /* سلة غير مكتملة: عند كتابة رقم صحيح نحفظه (بعد ثانيتين من التوقف) ليتمكن المتجر من التواصل إن لم يكمل الطلب */
  useEffect(() => {
    const phone = form.phone.trim();
    if (placed || !items.length || !/^0[567]\d{8}$/.test(phone)) return undefined;
    const payload = { phone, name: form.name.trim(), wilaya: form.wilaya, items: items.map((i) => ({ slug: i.slug, name: i.name, qty: i.qty, color: i.color || undefined })) };
    const sig = JSON.stringify(payload);
    if (sig === leadSig.current) return undefined;
    const t = setTimeout(() => {
      leadSig.current = sig;
      try { fetch('/api/cart-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: sig, keepalive: true }).catch(() => {}); } catch { /* تجاهل */ }
    }, 2000);
    return () => clearTimeout(t);
  }, [form.phone, form.name, form.wilaya, items, placed]);

  const payOpts = payments;
  const payKey = payOpts.some((x) => x.key === pay) ? pay : payOpts[0].key;
  const homeRate = rateFor(form.wilaya, 'home');
  const officeRate = rateFor(form.wilaya, 'office');
  const officeOff = !!form.wilaya && homeRate !== null && officeRate === null;
  const placeEff = place === 'office' && officeOff ? 'home' : place;
  const delivery = rateFor(form.wilaya, placeEff);
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub + (delivery || 0);

  useEffect(() => {
    let off = false;
    if (!form.wilaya) { setCommunes([]); return undefined; }
    import('./communes').then((m) => { if (!off) setCommunes((m.default && m.default[form.wilaya]) || []); }).catch(() => {});
    return () => { off = true; };
  }, [form.wilaya]);

  const setReceipt = (file) => {
    setReceiptState((old) => { if (old) URL.revokeObjectURL(old.url); return file ? { file, url: URL.createObjectURL(file) } : null; });
  };

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => (k === 'wilaya' ? { ...f, wilaya: v, commune: '' } : { ...f, [k]: v }));
    if (!started.current && items.length) {
      started.current = true;
      track('InitiateCheckout', { ids: items.map((i) => i.slug), contents: items.map((i) => ({ id: i.slug, quantity: i.qty })), value: sub });
    }
  };

  const submit = async () => {
    if (submitting || !items.length) return;
    if (guard && guard() === false) { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {} return; }
    const v = {
      name: form.name.trim().length < 2,
      phone: !/^0[567]\d{8}$/.test(form.phone.trim()),
      wilaya: !form.wilaya,
      commune: !!form.wilaya && communes.length > 0 && !form.commune,
      receipt: payKey !== 'cod' && !receipt,
    };
    setErrors(v);
    setServerErr('');
    if (Object.values(v).some(Boolean)) { setDone(false); return; }

    setSubmitting(true);
    setDone(false);

    let receiptData = null;
    if (payKey !== 'cod' && receipt) {
      receiptData = await receiptToDataUrl(receipt.file);
      if (!receiptData) { setSubmitting(false); setServerErr(t('تعذّر تجهيز صورة الوصل. اختر صورة أخرى.')); return; }
    }
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      wilaya: form.wilaya,
      commune: form.commune.trim(),
      place: placeEff,
      payment: payKey,
      /* price/name للاحتياط فقط: الخادم يتجاهلهما ويقرأ السعر الحقيقي من قاعدة البيانات */
      items: items.map((i) => ({ slug: i.slug, qty: i.qty, price: i.price, name: i.name, color: i.color || undefined })),
      ...(receiptData ? { receipt: receiptData } : {}),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(body),
      });
      let d = {};
      try { d = await res.json(); } catch { d = {}; }
      if (!res.ok) { const e = new Error('order failed'); e.code = d && d.error; throw e; }

      const realTotal = Number(d.total) || total;
      const realDelivery = Number.isFinite(Number(d.delivery)) ? Number(d.delivery) : delivery || 0;
      setDone(true);
      track('Purchase', { ids: items.map((i) => i.slug), contents: items.map((i) => ({ id: i.slug, quantity: i.qty })), value: realTotal });

      const lines = items.length === 1
        ? [`المنتج: ${items[0].name}`, items[0].color ? `اللون: ${items[0].color}` : null, `الكمية: ${items[0].qty}`]
        : ['المنتجات:', ...items.map((i) => `- ${i.name}${i.color ? ` (${i.color})` : ''} × ${i.qty}`)];
      const msg = [
        'طلب جديد 🛒',
        d.id ? `رقم الطلب: ${d.id}` : null,
        ...lines,
        `الاسم: ${body.name}`,
        `الهاتف: ${body.phone}`,
        `الولاية: ${body.wilaya}`,
        `البلدية: ${body.commune || '-'}`,
        `التوصيل: ${placeEff === 'home' ? 'للمنزل' : 'لمكتب التوصيل'}`,
        `طريقة الدفع: ${(payOpts.find((x) => x.key === payKey) || {}).label || 'الدفع عند الاستلام'}`,
        `سعر المنتجات: ${fmt(realTotal - realDelivery)}`,
        `سعر التوصيل: ${fmt(realDelivery)}`,
        `السعر الإجمالي: ${fmt(realTotal)}`,
      ].filter(Boolean).join('\n');
      const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
      try { localStorage.setItem('isd-last-order', JSON.stringify({ id: String(d.id), phone: body.phone })); } catch { /* تجاهل */ }
      setPlaced({ id: d.id, url, total: realTotal, phone: body.phone });
      if (onPlaced) onPlaced(d);
    } catch (e) {
      setServerErr(t(ERR[e && e.code] || 'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  return { ratesReady, communes, receipt, setReceipt, form, set, place: placeEff, setPlace, pay: payKey, setPay, payOpts, errors, submitting, done, serverErr, placed, closePlaced: () => setPlaced(null), officeOff, homeRate, officeRate, delivery, sub, total, submit };
}

/* بطاقة الاستمارة. children تظهر بين طريقة الدفع والملخص (مثل الكمية). */
export function CheckoutCard({ co, children, title }) {
  const { t, money } = usePrefs();
  const [payOpen, setPayOpen] = useState(false);
  const payRef = useRef(null);
  useEffect(() => {
    if (!payOpen) return undefined;
    const off = (e) => { if (payRef.current && !payRef.current.contains(e.target)) setPayOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setPayOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [payOpen]);

  const { form, set, errors, payOpts, pay, setPay, place, setPlace } = co;
  const cur = payOpts.find((x) => x.key === pay) || payOpts[0];
  const rateText = (r) => (!co.ratesReady ? t('يُحدَّد عند التأكيد') : !form.wilaya ? t('اختر الولاية') : r === null ? t('غير متاح') : money(r));

  return (
    <section className="pp-card">
      {co.placed ? (
        <div className="pp-done" role="dialog" aria-modal="true" aria-label={t('تم استلام طلبك')}>
          <div className="pp-done-box">
            <div className="pp-done-ic">✓</div>
            <h3>{t('تم استلام طلبك')}</h3>
            {co.placed.id ? (
              <div className="pp-ordno">
                <span>{t('رقم طلبك')}</span>
                <b dir="ltr">#{co.placed.id}</b>
                <button type="button" onClick={() => { try { navigator.clipboard.writeText(String(co.placed.id)); } catch { /* تجاهل */ } }}>{t('نسخ الرقم')}</button>
              </div>
            ) : null}
            <p>{t('سنتصل بك قريباً لتأكيد الطلب.')}</p>
            <p className="pp-trkhint">🚚 {t('احتفظ بهذا الرقم. لمتابعة طلبك اضغط زر «تتبع طلبي» بجانب شريط البحث في أعلى الصفحة، وأدخل رقم الطلب ورقم هاتفك.')}</p>
            {co.placed.id ? <a className="pp-done-trk" href={`/track?id=${encodeURIComponent(co.placed.id)}&phone=${encodeURIComponent(co.placed.phone || '')}`}>{t('تتبع طلبي الآن')}</a> : null}
            <a className="pp-done-wa" href={co.placed.url} target="_blank" rel="noopener noreferrer">{t('تأكيد عبر واتساب (اختياري)')}</a>
            <button type="button" className="pp-done-ok" onClick={co.closePlaced}>{t('متابعة')}</button>
          </div>
        </div>
      ) : null}
      <h2>{title || t('املأ الاستمارة للطلب')}</h2>

      <div className={`pp-field ${errors.name ? 'bad' : ''}`}>
        <IcUser />
        <input id="pp-name" placeholder={t('الاسم واللقب')} aria-label={t('الاسم واللقب')} value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
        <div className="pp-hint">{t('اكتب اسمك الكامل')}</div>
      </div>
      <div className={`pp-field ${errors.phone ? 'bad' : ''}`}>
        <IcPhone />
        <input id="pp-phone" type="tel" inputMode="numeric" placeholder={t('رقم الهاتف')} aria-label={t('رقم الهاتف')} value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={10} />
        <div className="pp-hint">{t('مثال: 0555123456')}</div>
      </div>

      <div className="pp-row">
        <div className={`pp-field ${errors.wilaya ? 'bad' : ''}`}>
          <IcMap />
          <select id="pp-wilaya" aria-label={t('الولاية')} value={form.wilaya} onChange={set('wilaya')} className={form.wilaya ? '' : 'empty'}>
            <option value="" disabled hidden>{t('الولاية')}</option>
            {WILAYAS.map((w, i) => (<option key={w} value={w}>{i + 1} - {w}</option>))}
          </select>
          <div className="pp-hint">{t('اختر ولايتك')}</div>
        </div>
        <div className={`pp-field ${errors.commune ? 'bad' : ''}`}>
          <IcPin />
          <select id="pp-commune" aria-label={t('البلدية')} value={form.commune} onChange={set('commune')} disabled={!form.wilaya} className={form.commune ? '' : 'empty'}>
            <option value="" disabled hidden>{form.wilaya ? t('البلدية') : t('اختر الولاية أولاً')}</option>
            {co.communes.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <div className="pp-hint">{t('اختر بلديتك')}</div>
        </div>
      </div>

      <div className="pp-legend">{t('مكان التوصيل')}</div>
      <div className="pp-ship">
        <button type="button" aria-pressed={place === 'home'} onClick={() => setPlace('home')}>
          <span className="pp-shi"><IcHome /></span>
          <span className="pp-sht"><b>{t('للمنزل')}</b>
          <small className={form.wilaya ? '' : 'na'}>{rateText(co.homeRate)}</small></span>
        </button>
        <button type="button" aria-pressed={place === 'office'} disabled={co.officeOff && co.ratesReady} onClick={() => setPlace('office')}>
          <span className="pp-shi"><IcTruck /></span>
          <span className="pp-sht"><b>{t('لمكتب التوصيل')}</b>
          <small className={form.wilaya && co.officeRate !== null ? '' : 'na'}>{rateText(co.officeRate)}</small></span>
        </button>
      </div>

      <div className="pp-legend">{t('طريقة الدفع')}</div>
      <div className="pp-paywrap" ref={payRef}>
        <button type="button" className={`pp-paybtn${payOpen ? ' open' : ''}`} aria-haspopup="listbox" aria-expanded={payOpen} aria-label={t('اختر طريقة الدفع')} onClick={() => setPayOpen((v) => !v)}>
          <span className="pp-payico"><PayIcon k={pay} /></span>
          <span className="pp-paytxt"><b>{t(cur.label)}</b></span>
          <svg className="pp-chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {payOpen && (
          <ul className="pp-paylist" role="listbox" aria-label={t('طريقة الدفع')}>
            {payOpts.map((o) => (
              <li key={o.key} role="option" aria-selected={pay === o.key} className={pay === o.key ? 'on' : ''} tabIndex={0}
                onClick={() => { setPay(o.key); setPayOpen(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPay(o.key); setPayOpen(false); } }}>
                <span className="pp-payico sm"><PayIcon k={o.key} /></span>
                <span className="pp-paytxt"><b>{t(o.label)}</b></span>
                {pay === o.key ? (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.500" /></svg>) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      {cur.details ? <p className="pp-paynote" dir="auto">{cur.details}</p> : null}

      {pay !== 'cod' ? (
        <div className={`pp-receipt ${errors.receipt ? 'bad' : ''}`}>
          <div className="pp-rc-warn" role="note"><span aria-hidden="true">⚠️</span> <b>{t('مهم')}:</b> {t('حوّل المبلغ أولاً ثم أرفق صورة وصل الدفع هنا. لن يتم تأكيد طلبك بدون الوصل.')}</div>
          <label className="pp-rc-pick">
            {co.receipt ? <img src={co.receipt.url} alt={t('وصل الدفع')} /> : <span className="pp-rc-ph" aria-hidden="true">📎</span>}
            <span>{co.receipt ? t('تغيير صورة الوصل') : t('إرفاق صورة وصل الدفع')}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f && f.size <= 12 * 1024 * 1024) co.setReceipt(f); }} />
          </label>
          {co.receipt ? <button type="button" className="pp-rc-del" onClick={() => co.setReceipt(null)}>{t('إزالة الصورة')}</button> : null}
        </div>
      ) : null}

      {children}

      <div className="pp-sum">
        <p><span>{t('سعر المنتجات')}</span><span>{money(co.sub)}</span></p>
        <p><span>{t('سعر التوصيل')}</span><span>{co.delivery === null ? (co.ratesReady ? t('اختر الولاية') : t('يُحدَّد عند التأكيد')) : money(co.delivery)}</span></p>
      </div>
      {co.serverErr ? <div className="pp-err" role="alert">{co.serverErr}</div> : null}
    </section>
  );
}

export function CheckoutBar({ co }) {
  const { t, money } = usePrefs();
  return (
    <div className="pp-bar">
      <div className="pp-bar-in">
        <div className="pp-bar-total">
          <span>{t('التكلفة الإجمالية')}:</span>
          <b>{money(co.total)}</b>
        </div>
        <button className="pp-order" onClick={co.submit} disabled={co.submitting}>
          {co.submitting ? t('جارٍ إرسال الطلب...') : t('اطلب الآن')}
        </button>
      </div>
    </div>
  );
}
