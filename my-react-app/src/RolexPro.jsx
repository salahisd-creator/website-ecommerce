import React from 'react'
import { Link } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import ROLEXX from './ROLEXMBEY/ROLEXX';
import PATEK from './ROLEXMBEY/PATEK'
import OMEGA from './ROLEXMBEY/OMEGA'
import AP from './ROLEXMBEY/AP'
import CARTIER from './ROLEXMBEY/CARTIER';
import TISSOT from './ROLEXMBEY/TISSOT';
import Home from './App'
const styles = `
 .rxrp-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
.rp-11 {
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
a.rp-11:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
.rp-11 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.rp1-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.rp1-info h3 { margin: 0 0 12px; font-size: 24px; color: #3b2a1a; }
.rp1-info p  { margin: 0; font-size: 16px; line-height: 1.7; color: #3b2a1a; }
@media (max-width: 560px) {
  a.rp-11 { flex-direction: column; }
  a.rp-11 img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;

function Rolexpro () {
  return (
    <div id='rolex-pro'>
      <style>{styles}</style>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/ROLEXX" className="rp-11">
          <img src="/ROLEXM/DAYDATBI.jpg" alt="Rolex" />
          <div className="rp1-info">
            <h3>ROLEX</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/PATEK" className="rp-11">
          <img src="/ROLEXM/NUTINOIR.jpg" alt="patek" />
          <div className="rp1-info">
            <h3>PATEK</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/OMEGA" className="rp-11">
          <img src="/ROLEXM/OMEGAORAN.jpg" alt="OMEGA" />
          <div className="rp1-info">
            <h3>OMEGA</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/AP" className="rp-11">
          <img src="/ROLEXM/APAEGI.jpg" alt="maybach" />
          <div className="rp1-info">
            <h3>AUDEMARS PIGUET</h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/TISSOT" className="rp-11">
          <img src="/ROLEXM/TISSOTI.jpg" alt="TISSOT" />
          <div className="rp1-info">
            <h3>TISSOT </h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/ROLEXMBEY/CARTIER" className="rp-11">
          <img src="/ROLEXM/CARTIERIVERT.jpg" alt="CARTIER" />
          <div className="rp1-info">
            <h3>CARTIER </h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <div className="rxrp-list">
        <Link to="/order/boss1" className="rp-11">
          <img src="/ROLEXM/BOSSDOI.jpg" alt="BOSS" />
          <div className="rp1-info">
            <h3>BOSS </h3>
            <p>Prada glasses, high quality and elegant design.</p>
          </div>
        </Link>
      </div>
      <Routes>
        <Route path="/ROLEXMBEY/ROLEXX" element={<ROLEXX />} />
        <Route path="/ROLEXMBEY/PATEK" element={<PATEK />} />
        <Route path="/ROLEXMBEY/OMEGA" element={<OMEGA />} />
        <Route path="/ROLEXMBEY/AP" element={<AP />} />
        <Route path="/ROLEXMBEY/TISSOT" element={<TISSOT />} />
        <Route path="/ROLEXMBEY/CARTIER" element={<CARTIER />} />
      </Routes>
    </div>
  )
}

export default Rolexpro
