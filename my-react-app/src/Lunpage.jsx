import React from 'react'
import { Link } from 'react-router-dom';


 const styles = `
 .watchty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
a.watchty-card {
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
a.watchty-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.watchty-card img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.watchty-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.watchty-info h3 { margin: 0 0 12px; font-size: 24px; color: #3b2a1a; }
.watchty-info p  { margin: 0; font-size: 16px; line-height: 1.7; color: #3b2a1a; }
@media (max-width: 560px) {
  a.cs-card { flex-direction: column; }
  a.cs-card img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;
function Lunpage (params) {
  return (
    <div>
      <style>{styles}</style>
      <div className="watchty-list">
        <Link to="/order/LOUISVUITON" className="watchty-card">
          <img src="/luneimags/lvlun1.jpg" alt="LOUISVUITON" />
          <div className="watchty-info">
            <h3>LOUISVUITON</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/CARIRA" className="watchty-card">
          <img src="/luneimags/carira.jpg" alt="carira" />
          <div className="watchty-info">
            <h3>CARIRA</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/BOTTEGA" className="watchty-card">
          <img src="/luneimags/bottega.jpg" alt="bottega" />
          <div className="watchty-info">
            <h3>BOTTEGA VENTA</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/ZENGA" className="watchty-card">
          <img src="/luneimags/zenga.jpg" alt="zenga" />
          <div className="watchty-info">
            <h3>ZENGA</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/CARTIERL1" className="watchty-card">
          <img src="/luneimags/cartierl11.jpg" alt="cartier1" />
          <div className="watchty-info">
            <h3>CARTIER</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/CARTIERL2" className="watchty-card">
          <img src="/luneimags/cartierl2.jpg" alt="cartier" />
          <div className="watchty-info">
            <h3>CARTIER</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/CARTIERL3" className="watchty-card">
          <img src="/luneimags/cartierl3.jpg" alt="cartier" />
          <div className="watchty-info">
            <h3>CARTIER</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/BRUNELLO" className="watchty-card">
          <img src="/luneimags/brunello.jpg" alt="brunello" />
          <div className="watchty-info">
            <h3>BRUNELLO CUCINELLI</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/BALMAIN" className="watchty-card">
          <img src="/luneimags/balmain.jpg" alt="balmain" />
          <div className="watchty-info">
            <h3>BALMAIN</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/lorobiana" className="watchty-card">
          <img src="/luneimags/LOROBIANA.jpg" alt="lorobiana" />
          <div className="watchty-info">
            <h3>LORO BIANA</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/MAYBACH" className="watchty-card">
          <img src="/luneimags/maybach.jpg" alt="maybach" />
          <div className="watchty-info">
            <h3>MAYBACH</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="watchty-list">
        <Link to="/order/GAZAL" className="watchty-card">
          <img src="/luneimags/gazal.jpg" alt="gazal" />
          <div className="watchty-info">
            <h3>GAZAL</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      
    </div>
  )
}

export default Lunpage
