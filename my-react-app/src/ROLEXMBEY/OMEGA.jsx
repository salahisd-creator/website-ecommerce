import React from 'react'
import { Link } from 'react-router-dom'
const styles = `
 .omm-11 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
a.om-11 {
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
a.om-11:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.om-11 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.om-11-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.om-11-info h3 { margin: 0 0 12px; font-size: 24px; color: #3b2a1a; }
.om-11-info p  { margin: 0; font-size: 16px; line-height: 1.7; color: #3b2a1a; }
@media (max-width: 560px) {
  a.om-11-card { flex-direction: column; }
  a.om-11-card img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;


function OMEGA() {
  return (
    <div id='OMEGA'>
                  <style>{styles}</style>
                  <div  className="omm-11">
                    <Link to="/order/SEAMASTER1" className="om-11">
                      <img src="/ROLEXM/OMEGAORAN.jpg" alt="NUTINOIR" />
                      <div className="om-11-info">
                        <h3>PATEK SEAMASTER DIVER </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default OMEGA
