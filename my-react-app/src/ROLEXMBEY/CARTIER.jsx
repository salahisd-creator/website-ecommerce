import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
 .cartierp1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
a.cartierp2 {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  max-width: 750px;
  min-height: 220px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: #3b2a1a;
  transition: transform 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}
a.cartierp2:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.cartierp2 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.cartierp3 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.cartierp3 h3 { margin: 0 0 12px; font-size: 24px; color: #3b2a1a; }
.cartierp3 p  { margin: 0; font-size: 16px; line-height: 1.7; color: #3b2a1a; }
@media (max-width: 560px) {
  a.cartierp2 { flex-direction: column; }
  a.cartierp2 img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  direction: rtl;
}
.buy-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #3b2a1a;
  color: #f5d98b;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}
.fav-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #3b2a1a;
  border-radius: 12px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: transform .15s, background .15s, border-color .15s;
}
.fav-btn:hover { background: rgba(59,42,26,.1); }
.fav-btn:active { transform: scale(.88); }
.fav-btn.on { border-color: #c0392b; background: rgba(192,57,43,.1); }`
function CardActions({ id, favs, toggleFav }) {
  const navigate = useNavigate();
  const on = favs.includes(id);

  return (
    <div className="card-actions">
      <button
        className="buy-btn"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/order/${id}`);
        }}
      >
        اشتري الآن
      </button>
      <button
        className={`fav-btn ${on ? 'on' : ''}`}
        aria-label="المفضلة"
       aria-pressed={on}
       onClick={(e) => {
       e.preventDefault();
        toggleFav(id);
       }}>
       <svg viewBox="0 0 24 24" width="18" height="18">
    <path
      d="M12 21s-7-4.6-9.5-9C.8 8.8 2.6 5 6 5c2 0 3.4 1 4 2.3h4C14.6 6 16 5 18 5c3.4 0 5.2 3.8 3.5 7-2.5 4.4-9.5 9-9.5 9z"
      fill={on ? '#c0392b' : 'none'}
      stroke={on ? '#c0392b' : '#3b2a1a'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
     </svg>
  </button>
    </div>
  );
}

function CARTIER() {
  const [favs, setFavs] = useState(
    () => JSON.parse(localStorage.getItem('favs') || '[]')
  );

  const toggleFav = (id) => {
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [...favs, id];
    setFavs(next);
    localStorage.setItem('favs', JSON.stringify(next));
  };

  return (
      <div id='CARTIER'>
            <style>{styles}</style>
            <div  className="cartierp1">
              <Link to="/order/SANTOS1" className="cartierp2">
                <img src="/ROLEXM/CARTIERIDORE.jpg" alt="YACHTNOIEI" />
                <div className="cartierp3">
                  <h3>CARTIER SANTOS</h3>
                  <p>COLOR: BLACK, high quality and elegant design.</p>
                  <CardActions id="SANTOS1" favs={favs} toggleFav={toggleFav} />
                </div>
              </Link>

            </div>
            <div  className="cartierp1">
              <Link to="/order/SANTOS2" className="cartierp2">
                <img src="/ROLEXM/CARTIERIVERT.jpg" alt="YACHTNOIEI" />
                <div className="cartierp3">
                  <h3>CARTIER SANTOS</h3>
                  <p>COLOR: BLACK, high quality and elegant design.</p>
                  <CardActions id="SANTOS2" favs={favs} toggleFav={toggleFav} />
                </div>
              </Link>

            </div>
      </div> 
  )
}

export default CARTIER
