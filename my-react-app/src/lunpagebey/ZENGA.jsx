import React from 'react'
import { usePrefs } from '../prefs';
import { Link } from 'react-router-dom'
import { useWatches } from '../useWatches'
import { CardActions, cardStyles, useFavs } from '../ProductCard1';
import Skeleton from '../Skeleton';

function ZENGA() {
  const { t } = usePrefs();
  const { watches, loading } = useWatches("zenga");
  const { favs, toggleFav } = useFavs();

  if (loading) return <Skeleton />;

  return (
    <div id='ZENGA'>
      <style>{cardStyles}</style>
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
export default ZENGA;
