import React, { lazy, Suspense } from "react";
import { usePrefs } from './prefs';
import './App.css'
import { Link, Route, Routes, Navigate } from 'react-router-dom'
import Lunpage from './Lunpage';
import Sackochpage from './Sackochpage';
import Casketpage from './casketpage';
import ProductPage from './ProductPage1';
import BrandsPage from "./BrandsPage";
import { useState } from "react";
import { PRODUCTS } from "./data";
import Layout from "./Layout";
import ReviewsSection from "./ReviewsSection";
import Skeleton from './Skeleton';
import { warmWatches } from './useWatches';
const ROLEXX = lazy(() => import('./ROLEXMBEY/ROLEXX'));
const BOSS = lazy(() => import('./ROLEXMBEY/BOSS'));
const PATEK = lazy(() => import('./ROLEXMBEY/PATEK'));
const OMEGA = lazy(() => import('./ROLEXMBEY/OMEGA'));
const AP = lazy(() => import('./ROLEXMBEY/AP'));
const CARTIER = lazy(() => import('./ROLEXMBEY/CARTIER'));
const TISSOT = lazy(() => import('./ROLEXMBEY/TISSOT'));
const Favorites = lazy(() => import('./Favorites'));
const Login = lazy(() => import('./login'));
const CARTIERL2 = lazy(() => import('./lunpagebey/CARTIERL2'));
const CARTIERL1 = lazy(() => import('./lunpagebey/CARTIERL1'));
const CARTIERL3 = lazy(() => import('./lunpagebey/CARTIERL3'));
const LOUISVUITON = lazy(() => import('./lunpagebey/LOUISVUITON'));
const Carira = lazy(() => import('./lunpagebey/CARIRA'));
const BOTTEGA = lazy(() => import('./lunpagebey/BOTTEGA'));
const BRUNELLO = lazy(() => import('./lunpagebey/BRUNELLO'));
const ZENGA = lazy(() => import('./lunpagebey/ZENGA'));
const GAZAL = lazy(() => import('./lunpagebey/GAZAL'));
const MAYBACH = lazy(() => import('./lunpagebey/MAYBACH'));
const BALMAIN = lazy(() => import('./lunpagebey/BALMAIN'));
const LOROBIANA = lazy(() => import('./lunpagebey/LOROBIANA'));
const LOUISVUITONSA = lazy(() => import('./sackochpagebey/LOUISVUITONSA.JSX'));
const Burberry = lazy(() => import('./casketpagebey/Burberry'));
const Hermes = lazy(() => import('./casketpagebey/Hermes'));
const Prada = lazy(() => import('./casketpagebey/Prada'));
const Burberry2 = lazy(() => import('./casketpagebey/Burberry2'));
const AddProduct = lazy(() => import('./AddProduct'));
const AddProductCard = lazy(() => import('./AddProuductCard'));
const SearchPage = lazy(() => import('./SearchPage'));
const ChooseDestination = lazy(() => import('./Orderspart/ChooseDestination'));
const AdminApp = lazy(() => import('./Orderspart/AdminApp'));
const AdminHome = lazy(() => import('./Orderspart/AdminHome'));
const Tracking = lazy(() => import('./Orderspart/Tracking'));
const Manage = lazy(() => import('./Orderspart/Manage'));
const Productss = lazy(() => import('./Orderspart/Productss'));
const Delivery = lazy(() => import('./Orderspart/Delivery'));
const Settings = lazy(() => import('./Orderspart/Settings'));
const Cart = lazy(() => import('./Cart'));
const Track = lazy(() => import('./Track'));
const Leads = lazy(() => import('./Orderspart/Leads'));
const Rates = lazy(() => import('./Orderspart/Rates'));
const Notify = lazy(() => import('./Orderspart/Notify'));
const Reviews = lazy(() => import('./Orderspart/Reviews'));
const StoreProducts = lazy(() => import('./Orderspart/StoreProducts'));
const Collection = lazy(() => import('./Collection'));
const InfoPage = lazy(() => import('./InfoPages'));
const Team = lazy(() => import('./Orderspart/Team'));
const CATEGORIES = [
  {
    to: "/rolex",
    label: "ساعات",
    en: "WATCHES",
    featured: true,
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
  },
  {
    to: "/lun",
    label: "نظارات",
    en: "EYEWEAR",
    icon: (
      <>
        <circle cx="7" cy="14" r="3.5" />
        <circle cx="17" cy="14" r="3.5" />
        <path d="M10.5 13.5c1-.8 2-.8 3 0M3.5 14L5 8M20.5 14L19 8" />
      </>
    ),
  },
  {
    to: "/Sakochpage",
    label: "حقائب",
    en: "BAGS",
    icon: (
      <>
        <rect x="4" y="8" width="16" height="11" rx="2" />
        <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M4 13h16" />
      </>
    ),
  },
  {
    to: "/casket", // غيّر المسار لمسار صفحة القبعات عندك
    label: "قبعات",
    en: "CAPS",
    icon: (
      <>
        <path d="M4 15c0-5 3.5-9 8-9s8 4 8 9z" />
        <path d="M20 15c1.5 0 2.5.5 3 1.5H12" />
      </>
    ),
  },
];

const CATS_CSS = `
.cats{background:#0d0a06;padding:28px 16px}
.cats-title{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.cats-title span{flex:1;height:1px;background:var(--c-d1)}
.cats-title h2{margin:0;font-size:18px;font-weight:500;color:var(--c-g1);letter-spacing:1px}
.cats-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:1000px;margin:0 auto}
.cat-card{display:block;padding:6px;background:var(--c-bk);border:1px solid var(--c-g1);border-radius:4px;text-decoration:none;transition:transform .2s,background .25s,border-color .25s}
.cat-card:active{transform:scale(.97)}
.cat-in{min-height:200px;padding:20px 10px 14px;border:1px solid var(--c-d1);border-radius:2px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
.cat-ring{width:64px;height:64px;border-radius:50%;border:1px solid var(--c-g1);background:var(--c-bk);color:var(--c-g1);display:flex;align-items:center;justify-content:center;transition:all .25s}
.cat-ar{margin:4px 0 0;font-size:19px;font-weight:500;color:var(--c-g1)}
.cat-en{margin:0;direction:ltr;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:var(--c-g0)}
.cat-line{width:28px;height:1px;background:var(--c-g1)}
.cat-cta{margin-top:auto;font-size:12px;color:var(--c-g1)}

.cat-card.featured,.cat-card:hover,.cat-card:focus-visible{background:var(--c-g1);border-color:var(--c-g1)}
.cat-card.featured .cat-in,.cat-card:hover .cat-in,.cat-card:focus-visible .cat-in{border-color:var(--c-bk)}
.cat-card.featured .cat-ring,.cat-card:hover .cat-ring,.cat-card:focus-visible .cat-ring{background:var(--c-bk);border-color:var(--c-bk);color:var(--c-g1)}
.cat-card.featured .cat-ar,.cat-card:hover .cat-ar,.cat-card:focus-visible .cat-ar{color:var(--c-bk)}
.cat-card.featured .cat-en,.cat-card.featured .cat-cta,.cat-card:hover .cat-en,.cat-card:hover .cat-cta,.cat-card:focus-visible .cat-en,.cat-card:focus-visible .cat-cta{color:#4a3817}
.cat-card.featured .cat-line,.cat-card:hover .cat-line,.cat-card:focus-visible .cat-line{background:var(--c-bk)}

.cats-grid:hover .cat-card.featured:not(:hover){background:var(--c-bk);border-color:var(--c-g1)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-in{border-color:var(--c-d1)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-ring{background:var(--c-bk);border-color:var(--c-g1)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-ar{color:var(--c-g1)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-en{color:var(--c-g0)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-cta{color:var(--c-g1)}
.cats-grid:hover .cat-card.featured:not(:hover) .cat-line{background:var(--c-g1)}

@media (min-width:768px){.cats-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
`;
export  function CategoryCards() {
  const { t } = usePrefs();
  return (
    <section className="cats">
      <style>{CATS_CSS}</style>

      <div className="cats-title">
        <span />
        <h2>{t("تصنيفاتنا")}</h2>
        <span />
      </div>

      <div className="cats-grid">
        {CATEGORIES.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`cat-card${c.featured ? " featured" : ""}`}
          >
            <div className="cat-in">
              <div className="cat-ring">
                <svg
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {c.icon}
                </svg>
              </div>
              <h3 className="cat-ar">{t(c.label)}</h3>
              <p className="cat-en">{c.en}</p>
              <span className="cat-line" />
              <span className="cat-cta">{t("اكتشف المجموعة ←")}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


const STARS = [
  { x: 140, y: 20, begin: 1.7, scale: 0.8 },
  { x: 40, y: 205, begin: 0.9, scale: 1 },
  { x: 308, y: 140, begin: 0.4, scale: 0.6 },
];

const TICKS = Array.from({ length: 12 }, (_, i) => i);

/* فيديو الإعلان: عمودي للهاتف وأفقي للحاسوب، يُحمَّل بعد ظهور الصفحة، ويُستبدل بالرسم الثابت عند توفير البيانات أو الفشل */
function HeroVideo() {
  const [mode, setMode] = React.useState(null); // null | 'v' | 'h' | 'off'
  const ref = React.useRef(null);
  React.useEffect(() => {
    let off = false;
    try {
      const c = navigator.connection || {};
      if (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) off = true;
    } catch { /* تجاهل */ }
    const pick = () => setMode(off ? 'off' : (window.matchMedia('(min-width: 768px)').matches ? 'h' : 'v'));
    const go = () => { pick(); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => pick();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { window.removeEventListener('load', go); mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, []);
  if (mode === 'off') return <HeroArt />;
  const m = mode || (typeof window !== 'undefined' && window.innerWidth >= 768 ? 'h' : 'v');
  return (
    <div className={`gh-vid gh-vid--${m}`}>
      <img className="gh-vid__poster" src={`/isd-promo-${m}.jpg`} alt="ISD +213" width={m === 'h' ? 960 : 540} height={m === 'h' ? 540 : 960} fetchpriority="high" />
      {mode && (
        <video key={m} ref={ref} className="gh-vid__el" src={`/isd-promo-${m}.mp4`} poster={`/isd-promo-${m}.jpg`}
          autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
          onError={() => setMode('off')} />
      )}
    </div>
  );
}

function HeroArt() {
  const { t } = usePrefs();
  return (
    <svg
      className="gh-hero__svg"
      viewBox="0 0 326 300"
      role="img"
      aria-label={t("ساعات ونظارات وحقائب وقبعات")}
    >
      <defs>
        <radialGradient id="gh-disc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3a2d14" />
          <stop offset="1" stopColor="#1b150a" />
        </radialGradient>
      </defs>

      <circle cx="163" cy="140" r="146" fill="none" stroke="var(--c-g0)" strokeWidth="1.2" strokeDasharray="2 7" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="0 163 140" to="360 163 140" dur="50s" repeatCount="indefinite" />
      </circle>

      <circle cx="163" cy="140" r="118" fill="url(#gh-disc-glow)" stroke="var(--c-g0)" strokeWidth="1.2">
        <animate attributeName="opacity" values="1;0.85;1" dur="5s" repeatCount="indefinite" />
      </circle>

      <circle cx="163" cy="140" r="126" fill="none" stroke="var(--c-g1)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="190 602">
        <animateTransform attributeName="transform" type="rotate" from="0 163 140" to="360 163 140" dur="12s" repeatCount="indefinite" />
      </circle>
      <circle cx="163" cy="140" r="126" fill="none" stroke="var(--c-g1)" strokeWidth="2" strokeLinecap="round" strokeDasharray="120 672" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="360 163 140" to="0 163 140" dur="18s" repeatCount="indefinite" />
      </circle>

      {STARS.map((s) => (
        <g key={`${s.x}-${s.y}`} transform={`translate(${s.x} ${s.y}) scale(${s.scale})`}>
          <path d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z" fill="var(--c-g1)">
            <animate attributeName="opacity" values="1;0.15;1" dur="2.6s" begin={`${s.begin}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
      <g transform="translate(163 140)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="4s" repeatCount="indefinite" />
          <rect x="-27" y="-100" width="54" height="52" rx="9" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="2.5" />
          <rect x="-27" y="48" width="54" height="52" rx="9" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="2.5" />
          <circle r="62" fill="#0e0e0e" stroke="var(--c-g1)" strokeWidth="6" />
          <circle r="50" fill="none" stroke="var(--c-g0)" strokeWidth="1" />
          {TICKS.map((i) => {
            const big = i % 3 === 0;
            return (
              <line
                key={i}
                x1="0"
                y1="-46"
                x2="0"
                y2={big ? -37 : -41}
                stroke="var(--c-g1)"
                strokeWidth={big ? 3 : 1.5}
                strokeLinecap="round"
                transform={`rotate(${i * 30})`}
              />
            );
          })}
          <line x1="0" y1="0" x2="0" y2="-26" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" transform="rotate(120)" />
          <line x1="0" y1="0" x2="0" y2="-38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="60s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="10" x2="0" y2="-42" stroke="var(--c-g1)" strokeWidth="1.6" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="6s" repeatCount="indefinite" />
          </line>
          <circle r="5" fill="var(--c-g1)" />
        </g>
      </g>
      <g transform="translate(58 62)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="5s" begin="-1.5s" repeatCount="indefinite" />
          <circle cx="0" cy="0" r="19" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="3" />
          <circle cx="42" cy="0" r="19" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="3" />
          <path d="M19 -2c2-3 4-3 4 0" fill="none" stroke="var(--c-g1)" strokeWidth="3" strokeLinecap="round" />
          <path d="M-19 -3L-34 5" fill="none" stroke="var(--c-g1)" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <g transform="translate(268 60) scale(2.2) translate(-12 -11)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="4.8s" begin="-0.8s" repeatCount="indefinite" />
          <path d="M5.5 13.7C5.8 8.5 8.5 5 12.6 5c5.9 0 9.7 4.5 9.7 9.5q-8.3.7-16.8-.8z" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5.5 13.7C3.3 14.2 1.4 15.2 1.4 16.3c.1 1 1.4 1 2.6.5 3 1 6 2.2 9 1.8 2.2-.4 3.6-2 4.3-3.7z" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M12.8 5c1.7 3 3.2 6.5 3.7 9.8" fill="none" stroke="var(--c-g1)" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="12.8" cy="4.4" rx="1.1" ry="0.65" fill="var(--c-g1)" />
        </g>
      </g>
      <g transform="translate(266 198) rotate(8)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 6;0 0" dur="4.5s" begin="-2s" repeatCount="indefinite" />
          <path d="M-28 -24L-46 6" fill="none" stroke="var(--c-g1)" strokeWidth="4" strokeLinecap="round" />
          <path d="M-52 10L-38 14" fill="none" stroke="var(--c-g0)" strokeWidth="6" strokeLinecap="round" />
          <rect x="-34" y="-24" width="68" height="50" rx="7" fill="#1d1710" stroke="var(--c-g1)" strokeWidth="2.5" />
          <path d="M-34 -17Q-34 -24 -27 -24H27Q34 -24 34 -17V8Q0 16 -34 8Z" fill="var(--c-bk)" stroke="var(--c-g1)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-18 -14l3 3-3 3-3-3zM0 -14l3 3-3 3-3-3zM18 -14l3 3-3 3-3-3zM-9 -3l3 3-3 3-3-3zM9 -3l3 3-3 3-3-3z" fill="var(--c-g0)" opacity="0.7" />
          <rect x="18" y="3" width="10" height="7" rx="1.5" fill="var(--c-g1)" />
          <path d="M34 -20l5 3v12" fill="none" stroke="var(--c-g0)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <rect x="224" y="102" width="70" height="28" rx="14" fill="var(--c-bk)" stroke="var(--c-g0)" strokeWidth="1.4" />
      <text x="259" y="121" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--c-g1)" fontFamily="Cairo, sans-serif">{t("قبعات")}</text>
      <rect x="20" y="118" width="74" height="28" rx="14" fill="var(--c-bk)" stroke="var(--c-g0)" strokeWidth="1.4" />
      <text x="57" y="137" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--c-g1)" fontFamily="Cairo, sans-serif">{t("نظارات")}</text>
      <rect x="222" y="236" width="74" height="28" rx="14" fill="var(--c-bk)" stroke="var(--c-g0)" strokeWidth="1.4" />
      <text x="259" y="255" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--c-g1)" fontFamily="Cairo, sans-serif">{t("حقائب")}</text>
      <rect x="126" y="268" width="74" height="28" rx="14" fill="var(--c-g1)" />
      <text x="163" y="287" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-k)" fontFamily="Cairo, sans-serif">{t("ساعات")}</text>
    </svg>
  );
}

function HeroTitle() {
  const { t, lang } = usePrefs();
  return (
    <svg className="gh-hero__title" viewBox="0 0 326 44" role="img" aria-label={t("كل ما يليق بك في مكان واحد")}>
      <defs>
        <linearGradient id="gh-shine" gradientUnits="userSpaceOnUse" x1="-326" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="var(--c-g1)" />
          <stop offset="0.42" stopColor="var(--c-g1)" />
          <stop offset="0.5" stopColor="var(--c-g2)" />
          <stop offset="0.58" stopColor="var(--c-g1)" />
          <stop offset="1" stopColor="var(--c-g1)" />
          <animate attributeName="x1" values="-326;326" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0;652" dur="3.5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <text x="163" y="32" textAnchor="middle" fontSize={lang === "ar" ? 24 : 15.5} fontWeight="800" fill="url(#gh-shine)" fontFamily="Cairo, sans-serif">
        {t("كل ما يليق بك في مكان واحد")}
      </text>
    </svg>
  );
}

function ProductsSection({products}) {
  const { t } = usePrefs();
  const [visible, setVisible]=useState(8);
  
  return (
    <section className="gh-section gh-section--products" id="all-products">
      <h2 className="gh-title">{t("منتجاتنا")}</h2>
      <p className="gh-sub">{t("اختر ما يناسبك واطلب الآن")}</p>
      <div className="gh-products">
        {products.slice(0,visible).map((p) => (
          <Link key={p.id} to={`/order/${p.slug || p.id}`} className="gh-product">
            <div className="gh-product__img">
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" />
              ) : (
                <svg className="gh-product__ph" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              )}
              {p.discount ? <span className="gh-badge" dir="ltr">-{p.discount}%</span> : null}
            </div>
            <h3 className="gh-product__name">{p.name}</h3>
            <p className="gh-product__price">
              <strong>{p.price} {t("د.ج")}</strong>
              {p.oldPrice ? <s>{p.oldPrice}</s> : null}
            </p>
            <span className="gh-btn-dark">{t("اطلب الآن")}</span>
          </Link>
                ))}
      </div>

      {visible < products.length && (
        <div className="gh-more">
          <button
            className="gh-more__btn"
            onClick={() => setVisible((v) => v + 8)}
          >
            {t("عرض المزيد")}
            <span className="gh-more__count">
              ({products.length - visible})
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

function Home() {
  const { t } = usePrefs();
  const TRUST = [
  { label: "توصيل سريع لكامل العالم", sub: "شحن آمن حتى باب بيتك", icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.7 3.9 5.7 3.9 9S14.6 18.3 12 21c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z" /></> },
  { label: "منتجات ذات جودة", sub: "تصاميم فاخرة بعناية", icon: <><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></> },
  { label: "طرق دفع متعددة", sub: "عند الاستلام أو بالتحويل", icon: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></> },
  { label: "ثقة و أمان", sub: "طلبك محمي وبياناتك آمنة", icon: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></> },
];
  return (
    <div className="gh">
      <div className="gh__inner">
        <CategoryCards />

        <section className="gh-hero" aria-label={t("تسوق الآن")}>
          <div className="gh-hero__art">
            <HeroVideo />
          </div>
          <div className="gh-hero__body">
            <HeroTitle />
            <p className="gh-hero__sub">{t("ساعات ونظارات وحقائب وقبعات بتصاميم فاخرة")}</p>
            <Link className="gh-btn-gold" to="/rolex">
              {t("تسوق الآن")}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </Link>
          </div>
        </section>


        <ul className="gh-trust">
          {TRUST.map((tr) => (
            <li key={tr.label} className="gh-trust__item">
              <span className="gh-trust__ic"><svg viewBox="0 0 24 24" aria-hidden="true">{tr.icon}</svg></span>
              <b>{t(tr.label)}</b>
              <small>{t(tr.sub)}</small>
            </li>
          ))}
        </ul>

      
        <ProductsSection products={PRODUCTS} />
        <ReviewsSection />
      </div>
    </div>
  );
}


/* تحميل مسبق هادئ لكل صفحات المتجر + بيانات المنتجات أثناء خمول المتصفح، فيصبح التنقل فورياً بلا «جاري التحميل» */
const PREFETCH = [
  () => import('./ROLEXMBEY/ROLEXX'),
  () => import('./ROLEXMBEY/BOSS'),
  () => import('./ROLEXMBEY/PATEK'),
  () => import('./ROLEXMBEY/OMEGA'),
  () => import('./ROLEXMBEY/AP'),
  () => import('./ROLEXMBEY/CARTIER'),
  () => import('./ROLEXMBEY/TISSOT'),
  () => import('./Favorites'),
  () => import('./lunpagebey/CARTIERL2'),
  () => import('./lunpagebey/CARTIERL1'),
  () => import('./lunpagebey/CARTIERL3'),
  () => import('./lunpagebey/LOUISVUITON'),
  () => import('./lunpagebey/CARIRA'),
  () => import('./lunpagebey/BOTTEGA'),
  () => import('./lunpagebey/BRUNELLO'),
  () => import('./lunpagebey/ZENGA'),
  () => import('./lunpagebey/GAZAL'),
  () => import('./lunpagebey/MAYBACH'),
  () => import('./lunpagebey/BALMAIN'),
  () => import('./lunpagebey/LOROBIANA'),
  () => import('./sackochpagebey/LOUISVUITONSA.JSX'),
  () => import('./casketpagebey/Burberry'),
  () => import('./casketpagebey/Hermes'),
  () => import('./casketpagebey/Prada'),
  () => import('./casketpagebey/Burberry2'),
  () => import('./AddProduct'),
  () => import('./AddProuductCard'),
  () => import('./SearchPage'),
  () => import('./Cart'),
  () => import('./Track'),
  () => import('./Collection'),
  () => import('./InfoPages')
];
function prefetchChunks() {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  let i = 0;
  const next = () => {
    if (i >= PREFETCH.length) return;
    try { PREFETCH[i++]().catch(() => {}); } catch { /* تجاهل */ }
    setTimeout(() => idle(next), 250);
  };
  idle(() => { warmWatches().catch(() => {}); next(); });
}

function App() {
  React.useEffect(() => { prefetchChunks(); }, []);
  return (
    <Suspense fallback={<Skeleton />}>
    <Routes>
      {/* ===== كل الصفحات فيها الهيدر والفوتر ===== */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<Track />} />
        <Route path="/rolex" element={<BrandsPage />} />
        <Route path="/ROLEXMBEY/ROLEXX" element={<ROLEXX />} />
        <Route path="/ROLEXMBEY/PATEK" element={<PATEK />} />
        <Route path="/ROLEXMBEY/OMEGA" element={<OMEGA />} />
        <Route path="/ROLEXMBEY/AP" element={<AP />} />
        <Route path="/ROLEXMBEY/boss" element={<BOSS />} />
        <Route path="/ROLEXMBEY/CARTIER" element={<CARTIER />} />
        <Route path="/ROLEXMBEY/TISSOT" element={<TISSOT />} />
        <Route path="/lun" element={<Lunpage />} />
        <Route path="/collection/:slug" element={<Collection />} />
        <Route path="/Sakochpage" element={<Sackochpage />} />
        <Route path="/casket" element={<Casketpage />} />
        <Route path="/order/:productId" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<InfoPage page="about" />} />
        <Route path="/shipping" element={<InfoPage page="shipping" />} />
        <Route path="/privacy" element={<InfoPage page="privacy" />} />
        <Route path="/terms" element={<InfoPage page="terms" />} />
        <Route path="/contact" element={<InfoPage page="contact" />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lunpagebey/CARTIERL2" element={<CARTIERL2 />} />
        <Route path="/lunpagebey/CARTIERL1" element={<CARTIERL1 />} />
        <Route path="/lunpagebey/CARTIERL3" element={<CARTIERL3 />} />
        <Route path="/lunpagebey/LOUISVUITON" element={<LOUISVUITON />} />
        <Route path="/lunpagebey/Carira" element={<Carira />} />
        <Route path="/lunpagebey/bottega" element={<BOTTEGA />} />
        <Route path="/lunpagebey/brunello" element={<BRUNELLO />} />
        <Route path="/lunpagebey/gazal" element={<GAZAL />} />
        <Route path="/lunpagebey/ZENGA" element={<ZENGA />} />
        <Route path="/lunpagebey/MAYBACH" element={<MAYBACH />} />
        <Route path="/lunpagebey/BALMAIN" element={<BALMAIN />} />
        <Route path="/lunpagebey/LOROBIANA" element={<LOROBIANA />} />
        <Route path="/sackochpagebey/LOUISVUITONSA" element={<LOUISVUITONSA />} />
        <Route path="/casketpagebey/Burberry" element={<Burberry />} />
        <Route path="/casketpagebey/Prada" element={<Prada />} />
        <Route path="/casketpagebey/Hermes" element={<Hermes />} />
        <Route path="/casketpagebey/Burberry2" element={<Burberry2 />} />
        <Route path="/admin/add" element={<AddProduct />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/addprouductcard" element={<AddProductCard />} />
        <Route path="/search" element={<SearchPage />} />
        
      </Route>

      {/* ===== بدون هيدر ولا فوتر ===== */}
      <Route path="/choose" element={<ChooseDestination />} />
      <Route path="/admin" element={<AdminApp />}>
        <Route index element={<AdminHome />} />
        <Route path="orders" element={<Tracking />} />
        <Route path="orders/manage" element={<Manage />} />
        <Route path="products" element={<StoreProducts />} />
        <Route path="products/list" element={<Productss />} />
        <Route path="leads" element={<Leads />} />
        <Route path="products/leads" element={<Navigate to="/admin/leads" replace />} />
        <Route path="customers" element={<Navigate to="/admin" replace />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="reports" element={<Navigate to="/admin" replace />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
        <Route path="rates" element={<Rates />} />
        <Route path="notify" element={<Notify />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="import" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
export default App;
