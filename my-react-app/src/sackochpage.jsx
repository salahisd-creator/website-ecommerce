import React from 'react';
import { usePrefs } from './prefs';
import { Link } from 'react-router-dom';
import { useWatches } from './useWatches';
import { CardActions, cardStyles, useFavs } from './ProductCard1';
import { useAdmin } from './useAdmin';
import {AddProductCard} from './AddProuductCard'
import Skeleton from './Skeleton';

function Sackochpage() {
  const { t } = usePrefs();
  const { watches, loading } = useWatches("bags");
   const { favs, toggleFav } = useFavs();
    const isAdmin = useAdmin();
  
  if (loading) return <Skeleton />;

  return (
    <div className='Sackochpagebody'>
      <style>{cardStyles}</style>
      {isAdmin && (
        <div className="sack-list">
          <AddProductCard to="/add-product" />
          </div>)}
           {watches.map((w) => (
           <div className="sack-list" key={w.id}>
          <Link to={`/order/${w.slug}`} className="sack-card">
            <img src={w.images?.[0]} alt={w.name} loading="lazy" decoding="async" />
            <div className="sack-info">
              <h3>{w.name}</h3>
              <p>{w.bio}</p>
              <CardActions price={w.price} id={w.slug} favs={favs} toggleFav={toggleFav} />
            </div>
          </Link>
        </div>
     ))}
    </div>
  )};
  export default Sackochpage