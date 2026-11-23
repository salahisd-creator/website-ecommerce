import React from 'react'
import { usePrefs } from '../prefs';
import { Link } from 'react-router-dom'
import { useWatches } from '../useWatches'
import { CardActions, cardStyles, useFavs } from '../ProductCard1';
import { useAdmin } from '../useAdmin';
import {AddProductCard} from '../AddProuductCard'
import Skeleton from '../Skeleton';



const styles = `
 .ppp-11 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 0;
}
a.pp-11 {
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
  color: var(--c-d1);
  transition: transform 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}
a.pp-11:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.pp-11 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.PP11-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.PP11-info h3 { margin: 0 0 12px; font-size: 24px; color: var(--c-d1); }
.PP11-info p  { margin: 0; font-size: 16px; line-height: 1.7; color: var(--c-d1); }
@media (max-width: 560px) {
  a.pp-11 { flex-direction: column; }
  a.pp-11 img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;

function PATEK() {
  const { t } = usePrefs();
  const { watches, loading } = useWatches("patek");
  const { favs, toggleFav } = useFavs();
    const isAdmin = useAdmin();

  if (loading) return <Skeleton />;

  return (
    <div id='PATEK'>
      <style>{styles}</style>
      <style>{cardStyles}</style>
      {isAdmin && (
       <div className="sack-list">
        <AddProductCard to="/add-product" />
         </div>)}
      {watches.map((w) => (
        <div className="ppp-11" key={w.id}>
          <Link to={`/order/${w.slug}`} className="pp-11">
            <img src={w.images?.[0]} alt={w.name} loading="lazy" decoding="async" />
            <div className="tp12-info">
              <h3>{w.name}</h3>
              <p>{w.bio}</p>
              <CardActions price={w.price} id={w.slug} favs={favs} toggleFav={toggleFav} />
              
              
            </div>
          </Link>
        </div>
      ))}
      <div style={{ height: 60 }} />
    </div>
  )
}

export default PATEK