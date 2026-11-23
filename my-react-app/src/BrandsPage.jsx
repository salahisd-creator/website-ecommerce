import React from 'react';
import { Link } from 'react-router-dom';

// عدّل الاسم والمسار لكل براند هنا فقط
const BRANDS = [
  { name: 'ROLEXX', path: '/ROLEXMBEY/ROLEXX' },
  { name: 'Omega', path: '/ROLEXMBEY/OMEGA' },
  { name: 'AP', path: '/ROLEXMBEY/AP' },
  { name: 'BOSS', path: '/ROLEXMBEY/BOSS' },
  { name: 'CARTIER', path: '/ROLEXMBEY/CARTIER' },
  { name: 'PATEK', path: '/ROLEXMBEY/PATEK' },
  { name: 'TISSOT', path: '/ROLEXMBEY/TISSOT' },
];

const styles = `
.bp { direction: ltr; min-height: 100vh; padding: 24px 16px 40px; box-sizing: border-box; font-family: Georgia, 'Times New Roman', serif; color: var(--c-k); }
.bp *, .bp *::before, .bp *::after { box-sizing: border-box; }
.bp-wrap { max-width: 720px; margin: 0 auto; }
.bp-title { margin: 0; font-size: 30px; font-weight: 400; }
.bp-line { width: 56px; height: 2px; margin: 10px 0 22px; background: var(--c-g0); border-radius: 2px; }
.bp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 700px) { .bp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.bp-card { display: block; padding: 24px 10px 20px; border: 1px solid var(--st-line, var(--c-cream2)); border-radius: 20px; background: var(--st-card, var(--c-cream)); color: var(--c-k); text-align: center; text-decoration: none; transition: transform .15s, border-color .2s; }
.bp-card:hover { border-color: var(--c-g0); }
.bp-card:active { transform: scale(.98); }
.bp-ring { width: 68px; height: 68px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--c-g0); border-radius: 50%; }
.bp-ring span { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--c-k); color: var(--c-g1); font-size: 24px; }
.bp-name { margin: 0; font-size: 15px; letter-spacing: 2px; text-transform: uppercase; }
.bp-card:focus-visible { outline: 2px solid var(--c-g0); outline-offset: 2px; }
`;

export default function BrandsPage() {
  return (
    <div className="bp">
      <style>{styles}</style>
      <div className="bp-wrap">
        <h1 className="bp-title">Brands</h1>
        <div className="bp-line" />
        <div className="bp-grid">
          {BRANDS.map((b) => (
            <Link key={b.name} to={b.path} className="bp-card">
              <div className="bp-ring"><span>{b.name.charAt(0)}</span></div>
              <p className="bp-name">{b.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}