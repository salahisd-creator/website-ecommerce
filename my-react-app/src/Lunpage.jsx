import React from 'react'
import { usePrefs } from './prefs';
import { Link } from 'react-router-dom';
import { useWatches } from './useWatches';
import { CardActions, cardStyles, useFavs } from './ProductCard1';
import { useAdmin } from './useAdmin';
import {AddProductCard} from './AddProuductCard'
import Skeleton from './Skeleton';

/*const styles = `
.watchty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 0;
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
  color: var(--c-d1);
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
}
.watchty-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.watchty-info h3 { margin: 0 0 12px; font-size: 24px; color: var(--c-d1); }
.watchty-info p  { margin: 0; font-size: 16px; line-height: 1.7; color: var(--c-d1); }
@media (max-width: 560px) {
  a.watchty-card { flex-direction: column; }
  a.watchty-card img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;*/

function Lunpage() {
  const { t } = usePrefs();
  const { watches, loading} = useWatches("glasses");
  const { favs, toggleFav } = useFavs();
      const isAdmin = useAdmin();

  if (loading) return <Skeleton />;

  return (
    <div>
      
      <style>{cardStyles}</style>
      {isAdmin && (
       <div className="sack-list">
        <AddProductCard to="/add-product" />
        </div>)}
      {watches.map((w) => (
        <div className="watchty-list" key={w.id}>
          <Link to={`/order/${w.slug}`} className="watchty-card">
            <img src={w.images?.[0]} alt={w.name} loading="lazy" decoding="async" />
            <div className="watchty-info">
              <h3>{w.name}</h3>
              <p>{w.bio}</p>
             <CardActions price={w.price} id={w.slug} favs={favs} toggleFav={toggleFav} />
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Lunpage