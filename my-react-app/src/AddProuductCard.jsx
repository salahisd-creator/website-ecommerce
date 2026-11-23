import React from 'react';
import { Link } from 'react-router-dom';

export const addCardStyles = `
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  box-sizing: border-box;
  min-height: 320px;
  height: 260px;
  padding: 24px 16px;
  border: 1.5px dashed var(--c-g0);
  border-radius: 22px;
  background: #ffffff;
  color: var(--c-k);
  text-align: center;
  text-decoration: none;
  font-family: inherit;
  direction: rtl;
  cursor: pointer;
  transition: background .2s, transform .15s, border-color .2s;
}
.add-card:hover { background: var(--c-cream); border-color: var(--c-g0); }
.add-card:active { transform: scale(.98); }
.add-card:focus-visible { outline: 2px solid var(--c-g0); outline-offset: 3px; }
.add-card-circle {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--c-k);
  outline: 1px solid var(--c-g0);
  outline-offset: 6px;
  transition: filter .2s;
}
.add-card:hover .add-card-circle { filter: brightness(1.25); }
.add-card-circle svg {
  width: 36px;
  height: 36px;
  fill: none;
  stroke: var(--c-g1);
  stroke-width: 2.4;
  stroke-linecap: round;
}
.add-card-title { margin: 8px 0 0; font-size: 18px; font-weight: 700; color: var(--c-k); }
.add-card-sub { margin: 0; font-size: 14px; color: var(--c-g0); }
`;

// to: رابط صفحة الاضافة (اي رابط). الشرط (المالك فقط) تضعه انت عند الاستدعاء
export function AddProductCard({ to = 'add-product' }) {
  return (
    <Link to={'/admin/add'} className="add-card">
      <style>{addCardStyles}</style>
      <span className="add-card-circle">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <p className="add-card-title">إضافة منتج</p>
      <p className="add-card-sub">للمالك فقط</p>
    </Link>
  );
}
export default AddProductCard