import React from 'react'
import { Link } from 'react-router-dom'
const styles = `
 .bossp1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
a.bossp2 {
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
a.bossp2:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.bossp2 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.bossp3 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.bossp3 h3 { margin: 0 0 12px; font-size: 24px; color: #3b2a1a; }
.bossp3 p  { margin: 0; font-size: 16px; line-height: 1.7; color: #3b2a1a; }
@media (max-width: 560px) {
  a.bossp2 { flex-direction: column; }
  a.bossp2 img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;

function BOSS() {
  return (
    <div id='BOSS'>
                <style>{styles}</style>
                <div  className="bossp1">
                  <Link to=" /order/boss1" className="bossp2">
                    <img src="/ROLEXM/BOSSDOI.jpg" alt="BOSSDOI" />
                    <div className="bossp3">
                      <h3>BOSS</h3>
                      <p>COLOR: BLACK, high quality and elegant design.</p>
                    </div>
                  </Link>
    
                </div>
    </div>
  )
}

export default BOSS
